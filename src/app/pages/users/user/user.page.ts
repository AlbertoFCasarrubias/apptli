import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {FirebaseService} from '../../../services/firebase/firebase.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {RoutingService} from '../../../services/routing/routing.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  user: any;
  form: FormGroup;
  loading: any;
  initHours = '07:00#20:00';
  workingHours = {
    lunes:        this.initHours,
    martes:       this.initHours,
    miércoles:    this.initHours,
    jueves:       this.initHours,
    viernes:      this.initHours,
    sábado:       this.initHours,
    domingo:      this.initHours
  };

  constructor(
      private formBuilder: FormBuilder,
      public alertController: AlertController,
      public loadingController: LoadingController,
      public firebaseService: FirebaseService,
      private activatedRoute: ActivatedRoute,
      private routingService: RoutingService,
      private authService: AuthService,
      private nav: NavController,
      private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required])),
      mail: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      schedule:    [this.workingHours],
      admin: new FormControl(true),
      doctor: new FormControl(false)
    });

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.getUser(id);
    }
  }

  goBack() {
    this.nav.back();
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'Aceptar',
        handler: () => {
          this.router.navigate(['/users']);
          /*
          if (this.routingService.getPreviousUrl() === '/order') {
            this.router.navigate(['/order']);
          } else {
            this.router.navigate(['/users']);
          }
           */
        }
      }]
    });

    await alert.present();
  }

  setNewPassword() {
    this.authService.doChangePassword()
        .then(() => this.presentAlert('Cambio de contraseña', 'Favor de revisar tu correo electrónico.'))
        .catch(err => this.presentAlert('Error de cambio de contraseña', err));
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

  getUser(id) {
    this.presentLoading();
    this.firebaseService.getUser(id).subscribe(
        data => {
          this.user = data;
          this.form.controls.name.patchValue(this.user.name);
          this.form.controls.mail.patchValue(this.user.mail);
          this.form.controls.admin.patchValue(this.user.admin);
          this.form.controls.doctor.patchValue(this.user.doctor.toString());
          this.form.controls.schedule.patchValue(this.user.schedule);
          this.form.addControl('id', new FormControl(this.user.id));
          this.form.addControl('autoincrement', new FormControl(this.user.autoincrement));

          if(this.user.schedule)
          {
            for(let i of Object.keys(this.user.schedule))
            {
              this.workingHours[i] = this.user.schedule[i];
            }
          }
          else {
            this.form.controls.schedule.patchValue(this.workingHours);
          }

          this.dismissLoading();
        },
        err => console.error(err)
    );
  }

  submit(value) {
    if (!value.admin) {
      value.admin = 'false';
    }
    this.presentLoading();
    if (value.admin === 'false' || !value.admin) {
      if (this.user) {
        this.updateUser(value);
      } else {
        this.createUser(value);
      }
    } else {
      if (this.user) {
        this.updateUser(value);
      } else {
        const reg = {
          email: value.mail,
          password: '12341234'
        };

        this.authService.doRegister(reg)
            .then(register => {
              value.adminID = register.user.uid;
              this.createUser(value);
            });
      }
    }
  }

  createUser(value) {
    value.doctor = Boolean(value.doctor);
    value.admin = Boolean(value.admin);

    this.firebaseService
        .createUser(value)
        .then(data => this.savedOK(data))
        .catch(err => this.saveError(err));
  }

  updateUser(value) {
    value.doctor = Boolean(value.doctor);
    value.admin = Boolean(value.admin);

    this.firebaseService
        .updateUser(value)
        .then(() => this.savedOK(value))
        .catch(err => this.saveError(err));
  }

  savedOK(value) {
    console.log('VALUE SAVED OK ', value);
    const message = value.admin === 'true' ? ' La contraseña temporal es 12341234' : '';
    this.dismissLoading();
    this.presentAlert('Usuario', value.name + ' guardado correctamente.' + message);
  }

  saveError(err) {
    console.log('error');
    this.dismissLoading();
    this.presentAlert('Usuario', err.toString());
  }

  // HOURS
  getStaffHour($event) {
    console.log('event ', $event);
    const json = JSON.parse($event);
    console.log('json ', json);

    if (json.start) {
      if (json.day.toLowerCase() == 'lunes') {

        this.initHours = json.start + '#' + json.end;
        for (const i of Object.keys(this.workingHours)) {
          if (this.workingHours[i]) {
            this.workingHours[i] = json.start + '#' + json.end;
          }
        }
      }

      this.workingHours[json.day] = json.start + '#' + json.end;
    } else {
      this.workingHours[json.day] = null;
    }

    this.form.controls.schedule.patchValue(this.workingHours);

  }


}
