import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {FirebaseService} from '../../../services/firebase/firebase.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {RoutingService} from '../../../services/routing/routing.service';
import {Store} from '@ngxs/store';
import {AppState} from '../../../store/states/app.state';
import {AddUser, UpdateUserData} from '../../../store/actions/users.action';
import {Observable, Subject, Subscription} from 'rxjs';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {UsersState} from '../../../store/states/users.state';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  appUser: any;
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
  subscriptionJSON: Subscription;
  json$: Observable<object>;
  json: any;
  changed: any = {};
  createdUser: any;

  constructor(
      private store: Store,
      private formBuilder: FormBuilder,
      public alertController: AlertController,
      public loadingController: LoadingController,
      public firebaseService: FirebaseService,
      private activatedRoute: ActivatedRoute,
      private routingService: RoutingService,
      private authService: AuthService,
      private utilitiesService: UtilitiesService,
      private nav: NavController,
      private router: Router
  ) {
    this.json$ = this.utilitiesService.json;
    this.subscriptionJSON = this.json$.subscribe( data => {

      if (data['json']) {
        this.json = data['json'];
        setTimeout(() => {
          if(this.user){
            if (this.user.name !== this.json.name) {
              this.form.controls.name.patchValue(this.json.name);
              this.changed.name = true;
            }

            if (this.user.age !== this.json.age) {
              this.form.controls.age.patchValue(this.json.age);
              this.changed.age = true;
            }

            if (this.user.height !== this.json.height) {
              this.form.controls.height.patchValue(this.json.height);
              this.changed.height = true;
            }
          }
        });
      }
    });
  }

  ngOnInit() {
    this.appUser = this.store.selectSnapshot(AppState.user);
    this.form = this.formBuilder.group({
      name: new FormControl('', Validators.compose([Validators.required])),
      age: new FormControl(''),
      birthday: new FormControl(''),
      height: new FormControl(''),
      mail: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      schedule: [this.workingHours],
      admin: new FormControl(true),
      doctor: new FormControl(this.appUser.admin ? 'true' : 'false'),
      patient: new FormControl(this.appUser.adminID)
    });

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id && id !== 'user') {
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
          if (this.createdUser && this.createdUser.id) {
            this.utilitiesService.setTabs({
              tab: true,
              createdUser: this.createdUser
            });
            this.router.navigate(['/user-tab/user/' + this.createdUser.id]);
          }
        }
      }]
    });

    await alert.present();
  }

  setNewPassword() {
    this.authService.doChangePassword('')
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
          this.form.controls.age.patchValue(this.user.age);
          this.form.controls.height.patchValue(this.user.height);
          this.form.controls.admin.patchValue(this.user.admin);
          this.form.controls.doctor.patchValue(this.user.doctor.toString());
          this.form.controls.schedule.patchValue(this.user.schedule);
          this.form.addControl('id', new FormControl(this.user.id));
          this.form.addControl('autoincrement', new FormControl(this.user.autoincrement));

          if (this.user.schedule) {
            for (const i of Object.keys(this.user.schedule)) {
              this.workingHours[i] = this.user.schedule[i];
            }
          } else {
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
    value.age = value.age ? value.age : '';
    value.height = value.height ? value.height : '';

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
              value.adminID = register.uid;
              this.createUser(value);
            });
      }
    }
  }

  createUser(value) {
    value.doctor = value.doctor === 'true' ? true : false;
    value.admin = value.admin === 'true' ? true : false;

    this.store.dispatch(new AddUser(value))
        .subscribe(() => {
          this.createdUser = Object.assign([], this.store.selectSnapshot(UsersState.users)).find(u => u.mail === value.mail);
          this.savedOK(value, true);
        },
        err => this.saveError(err));

  }

  updateUser(value) {
    value.doctor = value.doctor === 'true' ? true : false;
    value.admin = value.admin === 'true' ? true : false;

    this.store.dispatch(new UpdateUserData(value)).subscribe(data => {
      this.savedOK(value, true);
    });
  }

  savedOK(value, showPassword = false) {
    const message = !showPassword ? ' La contraseña temporal es 12341234' : '';
    this.dismissLoading();
    this.presentAlert('Usuario', value.name + ' guardado correctamente.' + message);
  }

  saveError(err) {
    this.dismissLoading();
    this.presentAlert('Usuario', err.toString());
  }

  // HOURS
  getStaffHour($event) {
    const json = JSON.parse($event);

    if (json.start) {
      if (json.day.toLowerCase() === 'lunes') {

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
