import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, MenuController, NavController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {DeleteUser, GetUsers} from '../../store/actions/users.action';
import {UsersState} from '../../store/states/users.state';
import {AppState} from '../../store/states/app.state';
import {GetEvents} from '../../store/actions/events.action';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  appUser: any;
  users: any = [];
  loading: any;

  constructor(public alertController: AlertController,
              public loadingController: LoadingController,
              public firebaseService: FirebaseService,
              public menuCtrl: MenuController,
              private authService: AuthService,
              private store: Store,
              private nav: NavController,
              private router: Router) { }

  async ngOnInit() {
    await this.presentLoading();
    this.appUser = this.store.selectSnapshot(AppState.user);
    this.getUsers();
  }

  getUsers() {
    if (this.appUser.admin) {
      this.store.select(UsersState.users).subscribe(users => {
        if (users) {
          this.users = Object.assign([], users).sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      this.dismissLoading();
    } else {
      this.store.select(UsersState.patients).subscribe(users => {
        if (users) {
          this.users = Object.assign([], users).sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      this.dismissLoading();
    }
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  goBack(){
    this.nav.back();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Cargando'
    });
    await this.loading.present();
  }

  dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async presentAlertConfirm(header, message, obj) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.store.dispatch(new DeleteUser(obj.id)).subscribe(() => {
              this.users = this.users.filter(m => m !== obj.id);
              this.authService.doDeleteUser(obj.adminID);
            });
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

  goTo(m?) {
    this.router.navigate([m ? '/user-tab/user/' + m.id : '/user-tab/user']);
  }

  delete(m) {
    this.presentAlertConfirm('Usuarios', `¿Seguro que deseas borrar al usuario ${m.name}?` , m);
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.store.dispatch(new GetUsers()).toPromise().then(() => {
      this.users = this.store.selectSnapshot(UsersState.users);
      event.target.complete();
      console.log('Async operation has ended');
    });
  }

  filterUsers(event) {
    if (event.target.value.length > 2) {
      this.getUsers();
      this.users = this.users.filter( u => u.name.toLowerCase().search(event.target.value.toLowerCase()) !== -1 || u.mail.toLowerCase().search(event.target.value.toLowerCase()) !== -1);
    } else {
      this.getUsers();
    }
  }

}
