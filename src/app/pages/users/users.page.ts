import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, MenuController, NavController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {GetUsers} from '../../store/actions/users.action';
import {UsersState} from '../../store/states/users.state';
import {AppState} from '../../store/states/app.state';

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
              private store: Store,
              private nav: NavController,
              private router: Router) { }

  async ngOnInit() {
    await this.presentLoading();

    this.appUser = this.store.selectSnapshot(AppState.user);
    console.log('this.appUser ', this.appUser);

    if (this.appUser.admin) {
      this.users = this.store.selectSnapshot(UsersState.users);
      this.dismissLoading();
    }
    else {
      this.users = this.store.selectSnapshot(UsersState.patients);
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
            this.firebaseService.deleteUser(obj.id)
                .then(() => this.users = this.users.filter(m => m !== obj.id))
                .catch(err => console.error('delete users ', err));
            ;
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

  add(m: any = false) {
    this.router.navigate([m ? '/user/' + m.id : '/user']);
  }

  delete(m) {
    this.presentAlertConfirm('Usuarios', `¿Seguro que deseas borrar al usuario ${m.name}?` , m);
  }

}
