import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AlertController, NavController, NavParams, ToastController} from '@ionic/angular';

import * as moment from 'moment/moment';
import {FirebaseService} from '../../../services/firebase/firebase.service';

@Component({
  selector: 'modal-schedule',
  templateUrl: './modal-schedule.component.html',
  styleUrls: ['./modal-schedule.component.scss'],
})
export class ModalScheduleComponent implements OnInit {

  title = 'Agregar';
  id: any;

  submitAttempt: any = false;
  form: any;
  date = '';

  users: any = [];
  selectedUsers: any = [];

  constructor(public navCtrl: NavController,
              private formBuilder: FormBuilder,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public firebaseService: FirebaseService,
              public navParams: NavParams) {
    this.form = this.formBuilder.group(
        {
          users:           ['', Validators.compose([Validators.required])],
          comments:        [''],
          duration:        [60],
          status:          ['created'],
          start:           [''],
          end:             [''],
          hourStart:       [''],
          hourEnd:         ['']
        });
  }

  ngOnInit() {
    //console.log('ModalScheduleComponent: NAVPARAMS ', this.navParams.data);

    this.date     = this.navParams.data.date;
    this.users    = this.filterUserSchedule(this.navParams.data.date, this.navParams.data.data.users);

    this.addMinutes(60);

    if (this.navParams.data.event) {
      this.title            = 'Editar';
      this.id               = this.navParams.data.event._id;
      this.date             = this.navParams.data.event.start;
      this.selectedUsers    = this.navParams.data.event.users;

      this.form.controls.comentarios.patchValue(this.navParams.data.event.comentarios);
      this.addMinutes(this.navParams.data.event.duracion);
      this.setSelected('users',   this.navParams.data.event.users.map(el => el._id));
    }
  }

  close() {
    this.navCtrl.pop();
  }

  async showAlert(title, subtitle) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: subtitle,
      buttons: [
        {
          text: 'Aceptra',
          handler: () => {
            console.log('aceptar');
          },
        },
      ],
    });
    await alert.present();
  }

  addMinutes(minutes) {
    // console.log('addMinutes ', minutes);

    const horaFin = moment(this.date).add(minutes, 'm');
    this.form.controls.duration.patchValue(minutes);
    this.form.controls.start.patchValue(moment(this.date).toISOString());
    this.form.controls.end.patchValue(horaFin.toISOString());
    this.form.controls.hourStart.patchValue(moment(this.date).format('HH:mm'));
    this.form.controls.hourEnd.patchValue(horaFin.format('HH:mm'));
  }

  filterUserSchedule(eventDate , initialUsers) {
    const date = eventDate;

    return initialUsers.filter( user => {
      let userAvailable = false;

      for (const dayKey in user.schedule) {
        const day         = dayKey.toLowerCase();
        const hours       = user.schedule[dayKey] ? user.schedule[dayKey].split('#') : ['00:00', '00:00'];
        const initialHour = moment(`${eventDate.format('YYYY-MM-DD')} ${hours[0]}` , 'YYYY-MM-DD HH:mm').locale('es');
        const endHour     = moment(`${eventDate.format('YYYY-MM-DD')} ${hours[1]}` , 'YYYY-MM-DD HH:mm').locale('es');

        if (day === date.format('dddd').toLowerCase()
            && date.isBetween(initialHour, endHour, null, '[)')
        ) {
          userAvailable = true;
          break;
        } else {
          userAvailable = false;
        }
      }

      return userAvailable;
    });
  }

  goToPage(page) {
    switch (page) {
      case 'services':
        //this.navCtrl.push(ServicePage);
        break;

      case 'clients':
        //this.navCtrl.push(ClientPage);
        break;

      case 'staff':
        //this.navCtrl.push(StaffPage);
        break;

      case 'stall':
        //this.navCtrl.push(StallPage);
        break;
    }
  }

  setSelected(control, response) {
    if (control === 'servicio') {
      let duracion = 0;
      for (const serv of response) {
        if (serv.horas) {
          duracion += serv.horas * 60;
        }

        if (serv.minutos) {
          duracion += serv.minutos;
        }
      }

      if (duracion > 0) {
        this.form.controls.duracion.patchValue(duracion);
        console.log('DURACION ', duracion);
      }

    }

    this.form.controls[control].patchValue(response);
  }

  addEvent(value) {
    console.log('VALUE ', value);

    value.users    = value.users.map(el => el.id);

    console.log('VALUE ', value);

    this.firebaseService.createSchedule(value)
        .then(data => console.log('data ' , data))
        .catch(err => console.error(err));
/*
    this.scheduleProvider.addService(value)
        .then(data => {
          this.commonProvider.dismiss();

          const toast = this.toastCtrl.create({
            message: 'Evento guardado correctamente',
            duration: 3000
          });
          toast.present();

          this.navCtrl.pop();
        })
        .catch(err => {
          console.log('addService err ', err);
        });*/
  }

  editEvent(value) {

    console.log('EDIT VALUE ', value);

    if (value.cabina[0].nombre) {
      value.cabina    = value.cabina.map(el => el._id);
    }

    if (value.staff[0].nombre) {
      value.staff     = value.staff.map(el => el._id);
    }

    if (value.clientes[0].nombre) {
      value.clientes  = value.clientes.map(el => el._id);
    }

    if (value.servicio[0].nombre) {
      value.servicio  = value.servicio.map(el => el._id);
    }

    console.log('EDIT VALUE ', value);

/*
    this.scheduleProvider.editService(this.id, value)
        .then(data => {
          this.commonProvider.dismiss();
          this.showAlert('Agenda', 'Evento guardado correctamente.');
          this.navCtrl.pop();
        })
        .catch(err => {
          console.log('addService err ', err);
        });*/

  }

  submitForm(value: any): void {
    this.submitAttempt = true;
    // console.log(this.form);
    if (this.form.valid ) {
      //this.commonProvider.present();
      if (this.id) {
        this.editEvent(value);
      } else {
        this.addEvent(value);
      }
    } else {
      console.log('else ');
    }
  }

}
