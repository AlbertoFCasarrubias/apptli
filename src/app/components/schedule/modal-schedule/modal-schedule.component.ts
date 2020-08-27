import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {AlertController, ModalController, NavController, NavParams, ToastController} from '@ionic/angular';

import * as moment from 'moment/moment';
import {FirebaseService} from '../../../services/firebase/firebase.service';
import {Store} from '@ngxs/store';
import {AddEvent, UpdateEvent} from '../../../store/actions/events.action';

@Component({
  selector: 'modal-schedule',
  templateUrl: './modal-schedule.component.html',
  styleUrls: ['./modal-schedule.component.scss'],
})
export class ModalScheduleComponent implements OnInit {

  title = 'Agregar';
  id: any;
  status: any;
  today = moment().format('YYYY-MM-DD');

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
              private store: Store,
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

    if (this.user.doctor) {
      this.users    = this.navParams.data.data.users;
    } else {
      this.users    = this.getAvailableDoctors(this.navParams.data.date, this.navParams.data.data.users);
    }


    this.addMinutes(60);

    this.form.controls.status.patchValue(null);

    if (this.navParams.data.event) {
      this.title            = 'Editar';
      this.id               = this.navParams.data.event.id;
      this.date             = this.navParams.data.event.start;

      if (this.navParams.data.event.comments) {
        this.form.controls.comments.patchValue(this.navParams.data.event.comments);
      }

      this.addMinutes(this.navParams.data.event.duration);

      if(this.navParams.data.data.user.doctor){
        this.setSelected('users',   this.navParams.data.event.patient.map(el => el.id));
        this.selectedUsers    = this.navParams.data.event.patient;
      }
      else {
        this.setSelected('users',   this.navParams.data.event.users.map(el => el.id));
        this.selectedUsers    = this.navParams.data.event.users;
      }

    }
  }

  close() {
    this.modalController.dismiss({
      action: 'close'
    });
  }

  changeDate(){
    console.log(this.form.value.start);
    const start = moment(this.form.value.start);
    const end = start.add(1, 'h');
    this.form.controls.end.patchValue(end.toISOString());
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

  getAvailableDoctors(eventDate , initialUsers) {
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
    console.log('control ', control);
    console.log('response ', response);
    this.selectedUsers = response;
    this.form.controls[control].patchValue(response);
  }

  deleteSelected($event) {

  }

  addEvent(value) {
    if (!this.user.doctor) {
      value.users = value.users.map(el => el.id);
      value.patient = [this.user.id];
    } else {
      value.patient = value.users.map(el => el.id);
      value.users = [this.user.id];
    }

    console.log('addEvent ', value, this.user);

    this.store.dispatch(new AddEvent(value)).toPromise()
        .then(() => {
          this.showAlert('Agenda', 'Evento guardado correctamente.');
          this.modalController.dismiss({
            action: 'add'
          });
        })
        .catch(err => console.error(err));
  }

  editEvent(value) {
    value.id = this.id;
    console.log('VALUE ', value);

    if (!this.user.doctor) {
      value.users = value.users.map(el => el.id);
      value.patient = [this.user.id];
    } else {
      value.patient = value.users.map(el => el.id);
      value.users = [this.user.id];
    }

    console.log('VALUE ', value);


    this.store.dispatch(new UpdateEvent(value)).toPromise()
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
