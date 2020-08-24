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
import {UsersState} from './store/states/users.state';

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
            patient: true,
            show: true
        },
        {
            title: 'Agenda',
            url: '/calendar',
            icon: 'calendar',
            doctor: true,
            patient: true,
            show: true
        },
        {
            title: 'Usuarios',
            url: '/users',
            icon: 'people',
            doctor: true,
            patient: false,
            show: true
        },
        {
            title: 'Llamada',
            url: '/call',
            icon: 'videocam',
            doctor: true,
            patient: true,
            show: false
        },
        {
            title: 'Logout',
            url: '/logout',
            icon: 'log-out',
            doctor: true,
            patient: true,
            show: true,
            function: true
        }
    ];
    public appPages = [];
    user: any;

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

            this.store.select(AppState.currentCall).subscribe(currentCall => {
                let show = false;
                if (currentCall) {
                    show = true;
                }

                this.appPages.forEach(menu => {
                    if (menu.title === 'Llamada') {
                        menu.show = show;
                    }
                });
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

    async initStore(user) {
        this.store.dispatch(new GetUserByMail(user.email)).toPromise().then(() => {
            this.user = this.store.selectSnapshot(AppState.user);
        });
        this.store.dispatch(new GetUsers()).toPromise().then(() => {
            const users = this.store.selectSnapshot(UsersState.users);
            this.store.dispatch(new GetEvents(users));
        });
        this.store.dispatch(new GetPatients(user.uid));

    }

    callFunction(obj) {
        if (obj.title === 'Logout') {
            this.afAuth.auth.signOut()
                .then(() => {
                    this.router.navigate(['/login']);
                })
                .catch(err => console.log('Error logout ', err));
        }
    }
}
