import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, MenuController} from '@ionic/angular';
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

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
    events: any = [];
    eventsApproved = [];
    eventsNotApproved = [];
    eventsCancelled = [];
    currentEvent = [];
    user: any;
    status = environment.EVENT_STATUS;
    now;
    interval;

    constructor(public menuCtrl: MenuController,
                private router: Router,
                private store: Store,
                public alertController: AlertController) {}

    toggleMenu() {
        this.menuCtrl.toggle();
    }

    ngOnInit() {
        this.interval = setInterval(() => {
            this.now = moment();

            if(this.events.length > 0){
                this.findCurrentEvent();
            }
        }, 30000);

        this.store.select(AppState.user).subscribe(user => {
            if (user) {
                this.user = user;
            }
        });

        this.store.select(EventsState.schedule).subscribe(events => {
            if (events) {
                this.events = events;
                this.eventsApproved = this.events.filter(e => e.status === this.status.approved);
                this.eventsNotApproved = this.events.filter(e => e.status !== this.status.approved && e.status !== this.status.cancelled);
                this.eventsCancelled = this.events.filter(e => e.status === this.status.cancelled);

                this.now = moment();
                this.findCurrentEvent();
                console.log('events ', this.events);
            }

        });
    }

    findCurrentEvent() {
        this.events.forEach( event => {
            if (this.now.isBetween(moment(event.start), moment(event.end)) && !this.currentEvent.find(e => e.id === event.id)) {
                this.currentEvent.push(event);
                this.store.dispatch(new SetCurrentCall(this.currentEvent));
            }
        });
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    async confirmEvent(event) {
        const names = event.patient.map(u => u.name).join();

        const alert = await this.alertController.create({
            header: '¿Confirmar la consulta?',
            message: `Consulta el día ${moment(event.start).locale('es').format('ddd DD MMM')} con ${names}`,
            buttons: [
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.updateStatusEvent(event, this.status.approved);
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

    updateStatusEvent(event, status){
        const payload = Object.assign({}, event);
        payload.status = status;
        payload.users = event.users.map(u => u.id);
        payload.patient = event.patient.map(u => u.id);

        console.log('update ', payload);
        this.store.dispatch(new UpdateEvent(payload))
            .subscribe(data => {
                console.log('update ', data);
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
