import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, LoadingController, MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import * as moment from 'moment/moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {UsersState} from '../../store/states/users.state';
import {AppState} from '../../store/states/app.state';
import {EventsState} from '../../store/states/events.state';
import {UpdateEvent} from '../../store/actions/events.action';
import {SetCurrentCall} from '../../store/actions/app.action';
import {FirebaseFunctionsService} from '../../services/firebase-functions/firebase-functions.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
    now;
    interval;
    user: any;
    loading: any;
    events: any = [];
    currentEvent = [];
    eventsApproved = [];
    eventsCancelled = [];
    eventsNotApproved = [];
    eventsRequestDoctor = [];
    eventsRequestPatient = [];
    status = environment.EVENT_STATUS;

    constructor(public menuCtrl: MenuController,
                public loadingController: LoadingController,
                private firebaseFunctionsService: FirebaseFunctionsService,
                private router: Router,
                private store: Store,
                public alertController: AlertController) {}

    toggleMenu() {
        this.menuCtrl.toggle();
    }

    ngOnInit() {
        this.currentEvent = [];
        this.presentLoading();
        this.user = this.store.select(AppState.user).subscribe(user => {
            if (user) {
                this.user = user;
            }
        });

        this.store.select(EventsState.schedule).subscribe(async (events) => {
            if (this.user && events) {
                let filter;
                if (this.user.doctor) {
                    filter = Object.keys(events).map((k) => events[k]).filter(e => moment(e.start).format('MM-DD') >= moment().format('MM-DD'));
                } else {
                    filter = Object.keys(events).map((k) => events[k]).filter(e => {
                        let userEvent = false;
                        e.patient.forEach(u => {
                            if (u.id === this.user.id && moment(e.start).format('MM-DD') >= moment().format('MM-DD')) {
                                userEvent = true;
                            }
                        });

                        return userEvent;
                    });
                }

                this.events = filter;
                this.eventsApproved = this.events.filter(e => e.status === this.status.approved);
                this.eventsCancelled = this.events.filter(e => e.status === this.status.cancelled);
                this.eventsRequestPatient = this.events.filter(e => e.status === this.status.requestByPatient);
                this.eventsRequestDoctor = this.events.filter(e => e.status === this.status.requestByDoctor);
                this.eventsNotApproved = this.events.filter(e => !e.status);

                this.now = moment();
                this.findCurrentEvent();
                this.dismissLoading();

                this.interval = setInterval(() => {
                    this.now = moment();

                    if(this.events.length > 0){
                        this.findCurrentEvent();
                    }
                }, 30000);
            } else {
                this.dismissLoading();
            }

        });
    }

    presentLoading() {
        this.loadingController.create({
            message: 'Cargando datos...'
        }).then((res) => {
            this.loading = true;
            res.present();
        });
    }

    dismissLoading() {
        if(this.loading) {
            this.loadingController.dismiss();
            this.loading = null;
        }
    }

    findCurrentEvent() {
        this.events.forEach( event => {
            if (this.now.isBetween(moment(event.start), moment(event.end))
                && !this.currentEvent.find(e => e.id === event.id && e.status !== this.status.cancelled)) {
                this.currentEvent.push(event);
                this.store.dispatch(new SetCurrentCall(this.currentEvent));
            }
        });
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.currentEvent = [];
    }

    async confirmEvent(event, status = null) {
        const names = event.patient.map(u => u.name).join();

        const alert = await this.alertController.create({
            header: '¿Confirmar la consulta?',
            message: `Consulta el día ${moment(event.start).locale('es').format('ddd DD MMM')} con ${names}`,
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        if (!status) {
                            this.updateStatusEvent(event, this.user.doctor ? this.status.requestByDoctor : this.status.requestByPatient);
                        } else {
                            this.updateStatusEvent(event, status);
                        }
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                }

            ]
        });

        await alert.present();
    }

    async cancelEvent(event) {
        const alert = await this.alertController.create({
            header: '¿Cancelar la consulta?',
            message: `Consulta el día ${moment(event.start).locale('es').format('ddd DD MMM')} con ${event.patient.name}`,
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.updateStatusEvent(event, this.status.cancelled);
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                }

            ]
        });

        await alert.present();
    }

    updateStatusEvent(event, status) {
        const payload = Object.assign({}, event);
        payload.status = status;
        payload.users = event.users.map(u => u.id);
        payload.patient = event.patient.map(u => u.id);

        this.store.dispatch(new UpdateEvent(payload))
            .subscribe(data => {
                let tokens;
                switch (status) {
                    case this.status.approved:
                    case this.status.cancelled:
                        const users = event.users.map(u => u.token);
                        const patient = event.patient.map(u => u.token);
                        tokens = users.concat(patient);
                        break;

                    case this.status.requestByPatient:
                        tokens = event.users.map(u => u.token);
                        break;

                    case this.status.requestByDoctor:
                        tokens = event.patient.map(u => u.token);
                        break;
                }

                if (tokens) {
                    const payloadPush = Object.assign({}, event);
                    payloadPush.tokens = tokens;
                    console.log('pushNotification ', payloadPush);

                    this.firebaseFunctionsService.pushNotification(payloadPush)
                        .then(resp => console.log(resp))
                        .catch(resp => console.error(resp));
                }
            });
    }

    goToCalendar(event)
    {
        this.router.navigate(['/calendar', {event: JSON.stringify(event)}]);
    }

    goToCall(event)
    {
        this.router.navigate(['/call', {event: JSON.stringify(event)}]);
    }

}
