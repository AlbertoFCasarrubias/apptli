import { Component, OnInit } from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  scheduleData: any = {};

  constructor(public menuCtrl: MenuController,
              private firebaseService: FirebaseService) {}

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  ngOnInit(): void {
    this.firebaseService.getUserByAuthId()
        .then(userData => {
          userData
              .subscribe(user => this.scheduleData.user = user, error => console.error(error));
        });

    this.firebaseService.getSchedules()
        .subscribe(data => this.scheduleData.events = data, error => console.error(error));
    this.firebaseService.getUsers()
        .subscribe( data => this.scheduleData.users = data, error => console.error(error));

  }

}
