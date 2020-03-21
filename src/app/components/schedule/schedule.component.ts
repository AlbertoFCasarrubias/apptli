import {AfterContentChecked, Component, Input, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import { FormBuilder } from '@angular/forms';

import * as moment from 'moment/moment';
import {DragulaService} from 'ng2-dragula';
import {Subscription} from 'rxjs';
import {ModalScheduleComponent} from './modal-schedule/modal-schedule.component';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit, AfterContentChecked {
  @Input('data') data: any;
  @Input('title') title: any;
  @Input('titleAddAlert') titleAddAlert: any;

  HOUR = {
    start: 7,
    end: 23
  }
  EVENT_STATUS   = {
    pay: 'pay',
    cancelled: 'cancelled'
  }
  interval: any;
  initialTime = moment();
  time = 0;
  user: any;
  pacientes: any;
  formCalendar: any;
  loading: any;

  today = moment();
  weekShown: any = moment().isoWeekday(1);
  fistDayWeek: any;
  weekMoment: any;
  events = [];
  schedule: any = [];
  week: any = [];
  hours: any = [];
  text: string;
  subs = new Subscription();


  constructor(public navCtrl: NavController,
              private dragulaService: DragulaService,
              public modalController: ModalController,
              public loadingController: LoadingController,
              public fb: FormBuilder,
              private alertCtrl: AlertController) {
    this.user       = JSON.parse(localStorage.getItem('usr'));

    if (typeof this.user === 'string') {
      this.user = JSON.parse(this.user);
    }

    const myIsoWeekDay = 1; // say our weeks start on tuesday, for monday you would type 1, etc.
    const startOfPeriod = moment();

    // how many days do we have to substract?
    const daysToSubtract = moment(startOfPeriod).isoWeekday() >= myIsoWeekDay ?
        moment(startOfPeriod).isoWeekday() - myIsoWeekDay :
        7 + moment(startOfPeriod).isoWeekday() - myIsoWeekDay;

    // subtract days from start of period
    this.weekShown = moment(startOfPeriod).locale('es').subtract(daysToSubtract, 'd');

    // You can also get all events, not limited to a particular group
    this.subs.add(this.dragulaService.drop()
        .subscribe(({ name, el, target, source, sibling }) => {
          /*console.log('DROP ');
          console.log('NAME ', name);
          console.log('el ', el);
          console.log('target ', target);
          console.log('source ', source);
          console.log('sibling ', sibling);
          console.log('sourceModel ', sourceModel);
          console.log('targetModel ', targetModel);
          console.log('item ', item);
          console.log(' ');*/

          this.updateDateEvent(el, target);
        })
    );
  }



  async presentLoading() {
    if (this.loading) {

      this.loading = await this.loadingController.create({
        message: this.title
      });
      await this.loading.present();
    }
  }

  dismisLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  newHour() {
    const array = [];
    for (let j = 7; j < 23; j++) {
      array.push({
        id: j,
        hour: j + ':00',
        events: []
      });
    }
    return array;
  }

  ngAfterContentChecked(){
    this.presentLoading();
    if (this.data.events && this.data.users) {

      console.log('this.data.events ', this.data.events);
      this.dismisLoading();
      this.initTime();
      this.printData();

      if (this.interval) {
        clearInterval(this.interval);
      }

      this.interval = setInterval(() => {
        this.initTime();
      }, 1000 * 60);
    }
  }

  ngOnInit(): void {
    this.printData();
  }

  initTime() {
    const hora  = Number(this.initialTime.format('HH')) - 7 ; // Por default empieza el día a las 7am
    const min   = Number(this.initialTime.format('mm'));
    this.time = hora * 80 + (min * 100 / 80);
  }

  printData() {
    this.hours    = [];
    this.schedule = [];
    this.week     = [];

    for (let j = this.HOUR.start; j < this.HOUR.end; j++) {
      this.hours.push(j + ':00');
    }

    const myIsoWeekDay = 1; // say our weeks start on tuesday, for monday you would type 1, etc.
    let startOfPeriod = moment();

    if (this.fistDayWeek === undefined) {
      startOfPeriod = moment();
    } else {
      startOfPeriod = this.fistDayWeek;
    }

    // how many days do we have to substract?
    const daysToSubtract = moment(startOfPeriod).isoWeekday() >= myIsoWeekDay ?
        moment(startOfPeriod).isoWeekday() - myIsoWeekDay :
        7 + moment(startOfPeriod).isoWeekday() - myIsoWeekDay;

    // subtract days from start of period
    this.weekMoment = moment(startOfPeriod).locale('es').subtract(daysToSubtract, 'd');

    for (let i = 0; i < 7; i++) {
      if (i !== 0) {
        this.week.push(moment(this.weekMoment).locale('es').add(i, 'd'));

        this.schedule.push({
          id: moment(this.weekMoment).add(i, 'd').format('YYYY-MM-DD'),
          day: {
            moment: moment(this.weekMoment).locale('es').add(i, 'd'),
            horas: this.newHour()
          }
        });
      } else {
        this.week.push(this.weekMoment);
        this.schedule.push({
          id: this.weekMoment.format('YYYY-MM-DD'),
          day: {
            moment: this.weekMoment,
            horas: this.newHour()
          }
        });
      }
    }

    const today = moment();

    if(this.data.events){
      this.printEvents();
    }


  }

  addWeek() {

    this.weekShown.add(7, 'd');
    this.fistDayWeek = this.weekShown;
    this.printData();
  }

  substractWeek() {
    this.weekShown.subtract(7, 'd');
    this.fistDayWeek = this.weekShown;
    this.printData();
  }

  addMonth() {

    this.weekShown.add(1, 'months');
    this.fistDayWeek = this.weekShown;
    this.printData();
  }

  substractMonth() {
    this.weekShown.subtract(1, 'months');
    this.fistDayWeek = this.weekShown;
    this.printData();
  }

  printEvents() {
    for (const event of this.data.events) {
      const nombre = 'consulta';

      if (event.fecha !== '') {
        const start    = moment(event.start);
        const endWeek  = moment(this.weekMoment).add(7, 'd');

        if ( start.format('YYYY-MM-DD') >= this.weekMoment.format('YYYY-MM-DD') &&
            start.format('YYYY-MM-DD') <= endWeek.format('YYYY-MM-DD')) {

          let dia = this.schedule.filter(x => x.id === start.format('YYYY-MM-DD'));
          dia     = dia[0];

          if (dia) {
            let hora = dia.day.horas.filter(x => x.id === Number(start.format('H')));
            hora     = hora[0];

            const tmp = {
                  id          : event.id,
                  nombre,
                  start       : start.locale('es').format('dd DD MMM HH:mm'),
                  data        : event
                };
            hora.events.push(tmp);
          }
        }
      }
    }

  }

  setStyle(event) {
    const color = '#4197B5';

    return {
      'height.px'       : event.data.duracion * 100 / 80,
      background        : color,
      'justify-content' : event.data.duracion > 60 ? 'flex-start' : 'center',
      'padding-top'     : event.data.duracion > 60 ? '10px' : '0'
    };



  }

  async goToEvent(event, day, hour) {

    console.log('goToEvent', event);
    const date     = moment(`${day} ${hour}:00`, 'YYYY-MM-DD HH:00').locale('es');

    const modal = await this.modalController.create({
      component: ModalScheduleComponent,
      componentProps: {
        data: this.data,
        date ,
        event: event.data
      }
    });
    return await modal.present();

    /*
    modal.onDidDismiss(() => {
      this.scheduleProvider.get()
          .then(data => {
            this.data.events = data;
            this.printData();
          })
          .catch(err => {
            console.log('get err ', err);
          });
    });*/


  }

  async showNewEventAlert(day, hour) {
    const date     = moment(`${day} ${hour}:00`, 'YYYY-MM-DD HH:00').locale('es');
    const modal = await this.modalController.create({
      component: ModalScheduleComponent,
      componentProps: {
        data: this.data,
        date
      }
    });
    return await modal.present();
    /*
    modal.onDidDismiss(() => {

      this.scheduleProvider.get()
          .then(data => {
            this.data.events = data;
            this.printData();
          })
          .catch(err => {
            console.log('get err ', err);
          });
    });*/
  }

  async chooseAction(day, hour , events , event = false) {
    console.log('events ', events);

    if (events.length > 0) {
      const alert = await this.alertCtrl.create({
        header: 'Agenda',
        message: '¿Qué deseas hacer?',
        buttons: [
        {
          text: 'Ver evento',
          handler: () => {
            this.goToEvent(event, day, hour);
          }
        },
        {
          text: 'Terminado',
          handler: () => {
            this.payEvent(event);
          }
        },
        {
          text: 'Cancelado',
          handler: () => {
            this.cancelEvent(event);
          }
        },
        {
          text: 'Agregar evento',
          handler: () => {
            this.showNewEventAlert(day, hour);
          }
        }
      ]
      });
      await alert.present();

    } else {
      this.showNewEventAlert(day, hour);
    }
  }

  newEvent(service, day, hour) {
    console.log('DAY ' , day);
    console.log('HOUR ' , hour);
    console.log(' ');

    const today     = moment(day + ' ' + hour, 'YYYY-MM-DD H');
    this.addCalendarEvent(service, today.toISOString(), '');


  }

  addCalendarEvent(service, date, _idConsulta) {
    const today     = moment(date);
    const horaFin   = moment(date).add(1, 'hour');

    const payload = {
      clientes: ['09e3ce00-55eb-11e8-b475-63084e33681e'],
      start:    today.toISOString(),
      end:      horaFin.toISOString(),
      horaIni:  moment(date).format('HH:mm'),
      horaFin:  horaFin.format('HH:mm'),
      servicio: service._id,
      cabina:   '7082f4f0-4269-11e8-95a2-fbd8a5aa02fc'
    };
/*
    this.scheduleProvider.addService(payload)
        .then(data => {
          this.scheduleProvider.get()
              .then(data => {
                console.log('get ', data);
                this.data.events = data;
              })
              .catch(err => {
                console.log('get err ', err);
              });
        })
        .catch(err => {
          console.log('addService err ', err);
        });*/
  }

  updateDateEvent(el, date) {
    console.log(this.data);

    let dateHour = date.attributes.id.nodeValue;
    dateHour     = dateHour.split('@');

    const event   = this.data.events.find( e => e._id == el.attributes.id.nodeValue);
    const newDate = dateHour[0];
    const newHour = dateHour[1];
    const horaIni = moment(newDate);
    horaIni.hour(newHour);

    const horaFin = moment(newDate);
    horaFin.hour(newHour);
    horaFin.add(event.duracion, 'm');

    const payload = {
      staff:    event.staff.map(el => el._id),
      clientes: event.clientes.map(el => el._id),
      cabina:   event.cabina.map(el => el._id),
      servicio: event.servicio.map(el => el._id),
      duracion: event.duracion,
      start:    horaIni.toISOString(),
      end:      horaFin.toISOString(),
      horaIni:  horaIni.format('HH:mm'),
      horaFin:  horaFin.format('HH:mm')
    };

    /*
    this.scheduleProvider.editService(event._id, payload)
        .then(data => {
          console.log('DATA ', data);
        })
        .catch(err => {
          console.log('ERR ', err);
        });

     */

  }

  payEvent(event) {

    //this.navCtrl.push(SalePage, {event});
    //this.scheduleProvider.editServiceStatus(event.id, EVENT_STATUS.pay);
  }

  cancelEvent(event) {
    //this.scheduleProvider.editServiceStatus(event.id, EVENT_STATUS.cancelled);
  }

}
