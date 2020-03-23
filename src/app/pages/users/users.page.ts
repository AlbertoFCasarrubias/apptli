import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: any = [];
  loading: any;

  constructor(public alertController: AlertController,
              public loadingController: LoadingController,
              public firebaseService: FirebaseService,
              private nav: NavController,
              private router: Router) { }

  async ngOnInit() {
    const load = await this.presentLoading();
    this.firebaseService.getUsers()
        .subscribe(
            data => {
              this.users = data;
              //console.log('USERS ' , data);
              this.dismissLoading();
            },
            err => console.error('error get users ', err));
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