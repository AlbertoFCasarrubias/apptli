import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {UsersState} from '../../store/states/users.state';
import {EventsState} from '../../store/states/events.state';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  scheduleData: any = {};

  constructor(public menuCtrl: MenuController,
              private route: ActivatedRoute,
              private store: Store,
              private firebaseService: FirebaseService) {}

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
        params => {
          if(params['params'].event)
          {
            this.scheduleData.showEvent = JSON.parse(params['params'].event);
          }
          else{
              this.scheduleData.showEvent = 'notEvent';
          }
        });


    this.firebaseService.getUserByAuthId()
        .then(userData => {
          userData
              .subscribe(user => this.scheduleData.user = user, error => console.error(error));
        });

    this.store.select(EventsState.schedule)
        .subscribe(data => this.scheduleData.events = data, error => console.error(error));

    this.store.select(UsersState.users)
        .subscribe( data => this.scheduleData.users = data, error => console.error(error));

  }

}
