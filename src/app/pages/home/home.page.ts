import {Component, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  scheduleData: any = {};

  constructor(public menuCtrl: MenuController,
              private firebaseService: FirebaseService) {}

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  ngOnInit(): void {
    this.firebaseService.getSchedules()
        .subscribe(data => this.scheduleData.events = data);

    this.firebaseService.getUsers()
        .subscribe( data => this.scheduleData.users = data);
  }
}
