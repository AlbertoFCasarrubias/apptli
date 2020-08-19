import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {SetUser} from './store/actions/app.action';
import {GetUsers} from './store/actions/users.action';
import {GetEvents} from './store/actions/events.action';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    public appPages = [
        {
            title: 'Inicio',
            url: '/home',
            icon: 'home'
        },
        {
            title: 'Agenda',
            url: '/calendar',
            icon: 'calendar'
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
        public afAuth: AngularFireAuth,
        private store: Store
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();

            this.afAuth.user.subscribe(user => {
                    if (user) {
                        this.initStore(user);
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

    initStore(user){
        this.store.dispatch(new SetUser(user));
        this.store.dispatch(new GetUsers());
        this.store.dispatch(new GetEvents());
    }

    callFunction(obj) {
        console.log('OBJ ', obj);
        if (obj.title === 'Logout') {
            this.afAuth.auth.signOut()
                .then(() => {
                    this.router.navigate(['/login']);
                })
                .catch(err => console.log('Error logout ', err));
        }
    }
}
