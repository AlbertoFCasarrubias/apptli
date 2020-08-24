import {
  AfterContentChecked,
  Component,
  Input, OnChanges, OnDestroy, Renderer2, SimpleChanges
} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import { FormBuilder } from '@angular/forms';

import * as moment from 'moment/moment';
import {DragulaService} from 'ng2-dragula';
import {Subscription} from 'rxjs';
import {ModalScheduleComponent} from './modal-schedule/modal-schedule.component';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {ScheduleHourDirective} from '../../directives/schedule-hour.directive';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {AppState} from '../../store/states/app.state';
import {UpdateEvent} from '../../store/actions/events.action';
import {EventsState} from '../../store/states/events.state';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements AfterContentChecked, OnDestroy, OnChanges {
  @Input('data') data: any;
  @Input('title') title: any;
  @Input('titleAddAlert') titleAddAlert: any;

  HOUR = {
    start: 7,
    end: 23
  }
  EVENT_STATUS   = {
    pay: 'pay',
    cancelled: 'cancelled',
    requestByDoctor: 'requestByDoctor',
    requestByPatient: 'requestByPatient',
    approved: 'approved',
    unpay: 'unpay',
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
  dropId: any;

  printDataCall = false;
  showEventCall = false;


  constructor(public navCtrl: NavController,
              private dragulaService: DragulaService,
              public modalController: ModalController,
              public loadingController: LoadingController,
              public fb: FormBuilder,
              private renderer: Renderer2,
              private store: Store,
              private alertCtrl: AlertController,
              private firebaseService: FirebaseService) {
    this.user       = this.store.selectSnapshot(AppState.user);

    const myIsoWeekDay = 1; // say our weeks start on tuesday, for monday you would type 1, etc.
    const startOfPeriod = moment();

    // how many days do we have to substract?
    const daysToSubtract = moment(startOfPeriod).isoWeekday() >= myIsoWeekDay ?
        moment(startOfPeriod).isoWeekday() - myIsoWeekDay :
        7 + moment(startOfPeriod).isoWeekday() - myIsoWeekDay;

    // subtract days from start of period
    this.weekShown = moment(startOfPeriod).locale('es').subtract(daysToSubtract, 'd');

    // You can also get all events, not limited to a particular group
    this.subs.add(this.dragulaService.over()
        .subscribe(({ el, container, source }) => {
          this.dropId = container.id;
        })
    );

    this.subs.add(this.dragulaService.drop()
        .subscribe(({ name, el, target, source, sibling }) => {
          // @ts-ignore
          const eventFind = this.data.events.find( e => e.id == el.attributes.id.nodeValue);
          if (eventFind.status === this.EVENT_STATUS.approved || eventFind.status === this.EVENT_STATUS.cancelled){
            this.dragulaService.find('EVENTS').drake.cancel(true);
          }

          this.dropId = null;
          this.updateDateEvent(el, target);
        })
    );

    this.store.select(EventsState.schedule).subscribe(events => {
      if (events && this.data && this.data.events) {
        this.data.events = Object.keys(events).map((k) => events[k]).filter(e => {
          const find = e.users.find(u => u.id === this.data.user.id);
          if (find) {
            return true;
          }
          return false;
        });

        this.printData();
      }
    });
  }

  changeDrop(id) {
    if (this.user.doctor) {
      this.changeDropStyle(id);
    } else {
      const cols = id.split('@');
      const date = moment(id, 'YYYY-MM-DD@HH').locale('es');
      const hour = cols[1];
      const doctors = this.data.users.filter(u => u.doctor);
      const doctorsAvailable = doctors.filter( user => {
        let userAvailable = false;
        const dayKey = date.format('dddd').toLowerCase();

        if (user.schedule[dayKey]) {
          const day         = dayKey.toLowerCase();
          const hours       = user.schedule[dayKey] ? user.schedule[dayKey].split('#') : ['00:00', '00:00'];
          const initialHour = moment(`${date.format('YYYY-MM-DD')} ${hours[0]}` , 'YYYY-MM-DD HH:mm').locale('es');
          let endHour       = moment(`${date.format('YYYY-MM-DD')} ${hours[1]}` , 'YYYY-MM-DD HH:mm').locale('es');

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

      if (doctorsAvailable.length > 0) {
        return this.changeDropStyle(id);
      }

      return 'disable';
    }
  }

  changeDropStyle(id) {
    if (id === this.dropId) {
      return 'hourDrag';
    }

    return '';
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.printDataCall = false;
    this.showEventCall = false;
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

  ngOnChanges(changes: SimpleChanges) {
    this.presentLoading();

    if (changes.data.currentValue.events
        && changes.data.currentValue.users
        && changes.data.currentValue.showEvent) {
      this.dismisLoading();
      this.drawSchedule();
    }
  }

  ngAfterContentChecked() {
    this.presentLoading();
    if (this.data.events && this.data.users && this.data.user && this.data.showEvent && !this.printDataCall) {
      this.dismisLoading();
      this.drawSchedule();
    }
  }

  drawSchedule(){
    this.printData();
    this.printDataCall = true;
    this.showEventCall = true;

    if(this.data.showEvent === 'notEvent') {
      this.showEventCall = true;
    }
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

    /*
    if(!this.showEventCall){
      this.showEvent();
    }*/
  }

  showEvent(){
    this.fistDayWeek = this.weekShown;
    const diff = moment.duration(moment(this.data.showEvent.start).diff(this.fistDayWeek));
    // console.log('DIFF ', diff.asWeeks() , Math.ceil(diff.asWeeks()));

    this.weekShown.add(7 *  Math.ceil(diff.asWeeks()), 'd');
    this.fistDayWeek = this.weekShown;
    this.showEventCall = true;
    console.log('/*/*/*/*/ 3333');
    this.printData();
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
    //console.log('printEvents this.data.events ', this.data.events);

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

            if(hora){
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

  }

  setStyle(event) {
    let color = '#4197B5';
    switch(event.data.status)
    {
      case this.EVENT_STATUS.pay:
        color = `linear-gradient(to bottom, ${color} 50%,#75dccd 100%)`;
        break;

      case this.EVENT_STATUS.cancelled:
        color = `linear-gradient(to bottom, ${color} 50%,#e8595b 100%)`;
        break;

      default:
        color = color;
        break;
    }

    return {
      'height.px'       : event.data.duration * 100 / 80,
      background        : color,
      'justify-content' : event.data.duration > 60 ? 'flex-start' : 'center',
      'padding-top'     : event.data.duration > 60 ? '10px' : '0'
    };



  }

  async goToEvent(event, day, hour) {
    const date     = moment(`${day} ${hour}:00`, 'YYYY-MM-DD HH:00').locale('es');
    const data = {
      data: this.data,
      status: this.EVENT_STATUS,
      date,
      event
    };

    const modal = await this.modalController.create({
      component: ModalScheduleComponent,
      componentProps: data
    });

    this.modalController.dismiss()
        .then(modalData => {
          console.log('dismiss update ', modalData);
          if(modalData.toString() === 'update')
          {
            console.log('get all schedules');
            this.firebaseService.getSchedules()
                .subscribe(sData => {
                  this.data.events = sData;
                  this.printData();
                });
          }
        });

    return await modal.present();


  }

  async showNewEventAlert(day, hour) {
    const date     = moment(`${day} ${hour}:00`, 'YYYY-MM-DD HH:00').locale('es');
    const modal = await this.modalController.create({
      component: ModalScheduleComponent,
      componentProps: {
        data: this.data,
        status: this.EVENT_STATUS,
        date
      }
    });

    modal.onWillDismiss()
        .then(dismissData => {
          if(dismissData.data.action !== 'close')
          {
            this.firebaseService.getSchedules()
                .subscribe(data => {
                  this.data.events = data;
                  this.printData();
                });
          }

        })
        .catch(err => console.error(err));

    return await modal.present();
  }

  async chooseAction(day, hour , events , event = false) {
    if (events.length > 0) {
      const alert = await this.alertCtrl.create({
        header: 'Agenda',
        message: '¿Qué deseas hacer?',
        buttons: [
        {
          text: 'Ver evento',
          handler: () => {
            this.goToEvent(events[0].data, day, hour);
          }
        },
        {
          text: 'Cancelado',
          handler: () => {
            this.cancelEvent(events[0].data);
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

  async updateDateEvent(el, date) {
    let dateHour = date.attributes.id.nodeValue;
    dateHour     = dateHour.split('@');

    const eventFind = this.data.events.find( e => e.id == el.attributes.id.nodeValue);
    const event = Object.assign({}, eventFind);

    if(event.status === this.EVENT_STATUS.approved || event.status === this.EVENT_STATUS.cancelled) {
      let status = '';
      switch (event.status) {
        case this.EVENT_STATUS.approved:
          status = 'confirmada';
          break;

        case this.EVENT_STATUS.cancelled:
          status = 'cancelada';
          break;
      }

      const alert = await this.alertCtrl.create({
        header: 'Agenda',
        message: `No se puede editar una consulta ${status}.`,
        buttons: [
          {
            text: 'Aceptar'
          }
        ]
      });
      await alert.present();
    }
    else {
      const newDate = dateHour[0];
      const newHour = dateHour[1];
      const horaIni = moment(newDate);
      horaIni.hour(newHour);

      const horaFin = moment(newDate);
      horaFin.hour(newHour);
      horaFin.add(event.duration, 'm');

      event.start     = horaIni.toISOString();
      event.end       = horaFin.toISOString();
      event.hourStart = horaIni.format('HH:mm');
      event.hourEnd   = horaFin.format('HH:mm');
      event.users     = event.users.map(usr => usr.id);
      event.patient   = event.patient.map(usr => usr.id);

      if (event.id) {
        this.store.dispatch(new UpdateEvent(event));
      }
    }
  }

  payEvent(event) {

    //this.navCtrl.push(SalePage, {event});
    //this.scheduleProvider.editServiceStatus(event.id, EVENT_STATUS.pay);
  }

  cancelEvent(event) {
    event.status = this.EVENT_STATUS.cancelled;
    event.users  = event.users.map(usr => usr.id);

    console.log('cancel ', event);
    if (event.id) {
      this.firebaseService.updateSchedule(event)
          .then(() => console.log('cancel ok'))
          .catch(err => console.error(err));
    }
  }

}
