import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
        {
            title: 'Agenda',
            url: '/home',
            icon: 'home'
        },
        {
            title: 'Usuarios',
            url: '/users',
            icon: 'people'
        },
        {
            title: 'Logout',
            url: '/logout',
            icon: 'log-out',
            function: true
        }
    ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    public afAuth: AngularFireAuth
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();

      this.afAuth.user.subscribe(user => {
            if (user) {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/login']);
            }
          }, err => {
            this.router.navigate(['/login']);
          },
          () => {
            this.splashScreen.hide();
          });
    });
  }

    callFunction(obj) {
        console.log('OBJ ' , obj);
        if (obj.title === 'Logout') {
            this.afAuth.auth.signOut()
                .then(() => {
                    console.log('logout');
                    this.router.navigate(['/login']);
                })
                .catch(err => console.log('Error logout ', err));
        }
    }
}
