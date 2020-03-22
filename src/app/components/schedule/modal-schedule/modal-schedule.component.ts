import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AlertController, ModalController, NavController, NavParams, ToastController} from '@ionic/angular';

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
  status: any;

  submitAttempt: any = false;
  form: any;
  date = '';

  user: any;
  users: any = [];
  selectedUsers: any = [];

  constructor(public modalController: ModalController,
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
          status:          [''],
          start:           [''],
          end:             [''],
          hourStart:       [''],
          hourEnd:         [''],
          patient:         ['']
        });
  }

  ngOnInit() {
    console.log('ModalScheduleComponent: NAVPARAMS ', this.navParams);

    this.user     = this.navParams.data.data.user;
    this.date     = this.navParams.data.date;
    this.status   = this.navParams.data.status;
    this.users    = this.filterUserSchedule(this.navParams.data.date, this.navParams.data.data.users);

    this.addMinutes(60);

    this.form.controls.status.patchValue(this.status.requestByDoctor);

    if (this.navParams.data.event) {
      this.title            = 'Editar';
      this.id               = this.navParams.data.event.id;
      this.date             = this.navParams.data.event.start;
      this.selectedUsers    = this.navParams.data.event.users;

      if (this.navParams.data.event.comments) {
        this.form.controls.comments.patchValue(this.navParams.data.event.comments);
      }

      this.addMinutes(this.navParams.data.event.duration);
      this.setSelected('users',   this.navParams.data.event.users.map(el => el.id));
    }
  }

  close() {
    this.modalController.dismiss({
      action: 'close'
    });
  }

  async showAlert(title, subtitle) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: subtitle,
      buttons: [
        {
          text: 'Aceptar'
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
    initialUsers = initialUsers.filter(u => u.doctor);

    return initialUsers.filter( user => {
      let userAvailable = false;
      const dayKey = date.format('dddd').toLowerCase();

      if (user.schedule[dayKey]) {
        const day         = dayKey.toLowerCase();
        const hours       = user.schedule[dayKey] ? user.schedule[dayKey].split('#') : ['00:00', '00:00'];
        const initialHour = moment(`${eventDate.format('YYYY-MM-DD')} ${hours[0]}` , 'YYYY-MM-DD HH:mm').locale('es');
        let endHour       = moment(`${eventDate.format('YYYY-MM-DD')} ${hours[1]}` , 'YYYY-MM-DD HH:mm').locale('es');

        const checkEndHour = hours[1].split(':');
        if(checkEndHour[0] === '00')
        {
          endHour = endHour.add(1, 'd');
        }

        if (day === date.format('dddd').toLowerCase()
            && date.isBetween(initialHour, endHour, null, '[)')
        ) {
          userAvailable = true;
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
    this.form.controls[control].patchValue(response);
  }

  addEvent(value) {
    value.users    = value.users.map(el => el.id);
    console.log('addEvent ', this.user);
    if(!this.user.doctor)
    {
      value.status = this.status.requestByPatient;
      value.patient = this.user.id;
    }

    this.firebaseService.createSchedule(value)
        .then(data => {
          this.showAlert('Agenda', 'Evento guardado correctamente.');
          this.modalController.dismiss({
            action: 'add'
          });
        })
        .catch(err => console.error(err));
  }

  editEvent(value) {
    value.id = this.id;

    this.firebaseService.updateSchedule(value)
        .then(() => {
          this.showAlert('Agenda', 'Evento guardado correctamente.');
          this.modalController.dismiss({
            action: 'update'
          });
        })
        .catch(err => {
          console.log('addService err ', err);
        });
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
