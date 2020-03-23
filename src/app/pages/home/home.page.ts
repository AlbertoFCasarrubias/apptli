import {Component, OnInit} from '@angular/core';
import {AlertController, MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import * as moment from 'moment/moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    events: any = [];
    user: any;
    status = environment.EVENT_STATUS;

    constructor(public menuCtrl: MenuController,
                private router: Router,
                public alertController: AlertController,
                private firebaseService: FirebaseService) {
    }

    toggleMenu() {
        this.menuCtrl.toggle();
    }

    ngOnInit(): void {
        this.firebaseService.getUserByAuthId()
            .then(userData => {
                userData
                    .subscribe(user => this.init(user), error => console.error(error));
            });
    }

    init(user) {
        this.user = user;
        this.getEvents();
    }

    getEvents() {
        this.firebaseService.getSchedulesByDoctor(this.user.id)
            .subscribe(data => {
                data = data.filter(d => moment(d['start']) >= moment());
                data.sort((a, b) => moment(a['start']).date() - moment(b['start']).date());
                this.events = data;
            });
    }

    async confirmEvent(event) {
        const alert = await this.alertController.create({
            header: '¿Confirmar la consulta?',
            message: `Consulta el día ${moment(event.start).locale('es').format('ddd DD MMM')} con ${event.patient.name}`,
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
        const payload = event;
        payload.status = status;
        payload.users = event.users.map(u => u.id);
        payload.patient = event.patient.id;

        console.log('update ', payload);

        this.firebaseService.updateSchedule(payload)
            .then(() => {
                event.status = status;
            })
            .catch(err => console.error(err));
    }

    goToCalendar(event)
    {
        this.router.navigate(['/calendar', {event: JSON.stringify(event)}]);
    }

}
