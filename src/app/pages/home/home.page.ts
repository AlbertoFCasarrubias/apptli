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
  user: any;

  constructor(public menuCtrl: MenuController,
              private firebaseService: FirebaseService) {}

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
     console.log('thisuser ', this.user);

     this.firebaseService.getSchedulesByDoctor(this.user.id)
         .subscribe( data => {
           console.log('DATA ', data);
         });
   }
}
