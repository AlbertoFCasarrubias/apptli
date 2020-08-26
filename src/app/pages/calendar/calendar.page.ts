import {Component, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {UsersState} from '../../store/states/users.state';
import {EventsState} from '../../store/states/events.state';
import {AppState} from '../../store/states/app.state';
import * as moment from 'moment/moment';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.page.html',
    styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
    scheduleData: any = {};

    constructor(public menuCtrl: MenuController,
                private route: ActivatedRoute,
                private store: Store) {
    }

    toggleMenu() {
        this.menuCtrl.toggle();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(
            params => {
                if (params['params'].event) {
                    this.scheduleData.showEvent = JSON.parse(params['params'].event);
                } else {
                    this.scheduleData.showEvent = 'notEvent';
                }
            });

        this.scheduleData.user = this.store.selectSnapshot(AppState.user);
        const events = this.store.selectSnapshot(EventsState.schedule);
        let eventsArray = [];
        if (events) {
          eventsArray = Object.keys(events).map((k) => events[k]);
        }

        if (this.scheduleData.user.doctor) {
            this.scheduleData.users = this.store.selectSnapshot(UsersState.patients);
            this.scheduleData.events = eventsArray.filter(e => {
                const find = e.users.find(u => u.id === this.scheduleData.user.id);
                if (find) {
                    return true;
                }

                return false;
            });
        } else {
            this.scheduleData.events = eventsArray.filter(e => {
                let userEvent = false;
                e.patient.forEach(u => {
                    if (u.id === this.scheduleData.user.id) {
                        userEvent = true;
                    }
                });

                return userEvent;
            });
            this.scheduleData.users = this.store.selectSnapshot(UsersState.users);
        }

        console.log('this.scheduleData ', this.scheduleData);
    }

}
