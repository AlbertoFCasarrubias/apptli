import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {GetUserByMail, SetUser} from './store/actions/app.action';
import {GetPatients, GetUsers} from './store/actions/users.action';
import {GetEvents} from './store/actions/events.action';
import {AppState} from './store/states/app.state';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    private menu = [
        {
            title: 'Inicio',
            url: '/home',
            icon: 'home',
            doctor: true,
            patient: true
        },
        {
            title: 'Agenda',
            url: '/calendar',
            icon: 'calendar',
            doctor: true,
            patient: true
        },
        {
            title: 'Usuarios',
            url: '/users',
            icon: 'people',
            doctor: true,
            patient: false
        },
        {
            title: 'Llamada',
            url: '/call',
            icon: 'videocam',
            doctor: true,
            patient: true
        },
        {
            title: 'Logout',
            url: '/logout',
            icon: 'log-out',
            doctor: true,
            patient: true,
            function: true
        }
    ];
    public appPages = [];

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
            this.store.select(AppState.user).subscribe(user => {
                if (user) {
                    if (user['doctor']) {
                        this.appPages = this.menu.filter(m => m.doctor);
                    }
                    else {
                        this.appPages = this.menu.filter(m => m.patient);
                    }
                } else {
                    this.appPages = [];
                }
            });

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

    initStore(user) {
        console.log('USER ', user);
        this.store.dispatch(new GetUserByMail(user.email));
        this.store.dispatch(new GetUsers());
        this.store.dispatch(new GetPatients(user.uid));
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
