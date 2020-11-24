import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {UsersState} from '../../../store/states/users.state';
import {Observable, Subject, Subscription} from 'rxjs';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AlertController, LoadingController, ModalController, ToastController} from '@ionic/angular';
import { UpdateUserData} from '../../../store/actions/users.action';
import * as moment from 'moment';
import {ConsultaModel, UserModel} from '../../../models/models';
import {AppointmentPage} from '../appointment/appointment.page';

@Component({
  selector: 'app-user-medical',
  templateUrl: './user-medical.page.html',
  styleUrls: ['./user-medical.page.scss'],
})
export class UserMedicalPage implements OnInit, OnDestroy {
  subscriptionJSON: Subscription;
  json$: Observable<object>;

  subscriptionEdit: Subscription;
  edit$: Observable<object>;

  chartSubject: Subject<boolean> = new Subject<boolean>();

  consultas: ConsultaModel[];
  form: FormGroup;
  user: UserModel;
  swap: any = false;
  loading: any;
  edit = false;

  charts: any = {
    peso: {},
    grasa: {},
    agua: {},
    grasaVisceral: {},
    pesoMuscular: {},
    edadMetabolica: {},
    edadOsea: {},
    pecho: {},
    cintura: {},
    cadera: {},
    bd: {},
    bi: {},
    pd: {},
    pi: {}
  };

  constructor(private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private store: Store,
              public toastController: ToastController,
              public alertController: AlertController,
              public modalController: ModalController,
              public loadingController: LoadingController,
              private utilitiesService: UtilitiesService) {
    this.json$ = this.utilitiesService.json;
    this.edit$ = this.utilitiesService.edit;

    this.subscriptionJSON = this.json$.subscribe( data => {
      const user = Object.assign({}, this.user);

      user.alimenticios = data['json'].alimenticios;
      user.antecedentes = data['json'].antecedentes;
      user.consultas = data['json'].consultas;

      this.user = user;

      if(this.consultas.length === 0) {
        this.consultas = data['json'].consultas;
      } else {
        data['json'].consultas.forEach( c => this.consultas.push(c));
      }
      this.consultas = this.sortDatesConsultas(this.consultas);

      this.form.controls.alimenticios.patchValue(data['json'].alimenticios);
      this.form.controls.antecedentes.patchValue(data['json'].antecedentes);
      this.form.controls.consultas.patchValue(data['json'].consultas);

      this.generateCharts();
      this.utilitiesService.setEdit(true);
    });

    this.subscriptionEdit = this.edit$.subscribe( data => {
      this.edit = data['edit'] ? true : false;
    });

    this.form = this.formBuilder.group({
      alimenticios: this.formBuilder.group({
        cena: new FormControl(''),
        colacionMatutina: new FormControl(''),
        colacionVespertina: new FormControl(''),
        comida: new FormControl(''),
        desayuno: new FormControl(''),
      }),
      antecedentes: this.formBuilder.group({
        alcoholismo: new FormControl(''),
        alergias: new FormControl(''),
        cirugias: new FormControl(''),
        enfermedades: new FormControl(''),
        medicamentos: new FormControl(''),
        tabaquismo: new FormControl(''),
      }),
      consultas: new FormControl('')
    });
  }

  ngOnInit() {
    this.getUser();
  }

  ngOnDestroy() {
    this.subscriptionJSON.unsubscribe();
    this.subscriptionEdit.unsubscribe();
  }

  getUser() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const users = Object.assign([], this.store.selectSnapshot(UsersState.users));
    this.user = users.find(u => u.id === id);
    console.log('getUser ID ' , id , this.user);

    if (this.user) {
      this.consultas = this.copyConsultas();
      this.form.controls.alimenticios.patchValue(this.user.alimenticios ? this.user.alimenticios : {});
      this.form.controls.antecedentes.patchValue(this.user.antecedentes ? this.user.antecedentes : {});
      this.form.controls.consultas.patchValue(this.user.consultas ? this.user.consultas : {});
      this.generateCharts();
    }
  }

  generateCharts() {
    console.log('generating charts...');
    this.generateValuesChart('peso');
    this.generateValuesChart('grasa');
    this.generateValuesChart('agua');
    this.generateValuesChart('grasaVisceral');
    this.generateValuesChart('pesoMuscular');
    this.generateValuesChart('edadMetabolica');
    this.generateValuesChart('edadOsea');
    this.generateValuesChart('pecho');
    this.generateValuesChart('cintura');
    this.generateValuesChart('cadera');
    this.generateValuesChart('bd');
    this.generateValuesChart('bi');
    this.generateValuesChart('pd');
    this.generateValuesChart('pi');
  }

  generateValuesChart(chart) {
    if (this.consultas) {
      const xLabels = this.consultas.map(c => moment(c.date, 'DD/MM/YYYY').format('DD-MMM'));
      this.charts[chart].type = 'spline';
      this.charts[chart].xAxis = xLabels;
      this.charts[chart].data = this.consultas.map(c => Number(c[chart]));
      this.charts[chart].data.push(this.charts[chart].data.pop());
      this.charts[chart].xAxis.push('');

      this.chartSubject.next(true);
      setTimeout(() => {
        this.chartSubject.next(false);
      }, 1000);
    }
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  copyConsultas() {
    if (this.user && this.user.consultas) {
      return this.user.consultas.map( (c: ConsultaModel) => {
        return {
          agua : c.agua,
          bd : c.bd,
          bi : c.bi,
          cadera : c.cadera,
          cintura : c.cintura,
          date : c.date,
          edadMetabolica : c.edadMetabolica,
          edadOsea : c.edadOsea,
          grasa : c.grasa,
          grasaVisceral : c.grasaVisceral,
          pd : c.pd,
          pi : c.pi,
          pecho : c.pecho,
          peso : c.peso,
          pesoMuscular : c.pesoMuscular,
        };
      });
    }

    return [];
  }

  moveTo(consulta, field) {
    if (this.swap) {
      if (field === this.swap.field) {
        this.swap = false;
        return;
      }
    }

    this.swap = {
      consulta,
      field
    };

    this.presentToast('Selecciona la fecha donde quieres intercambiar el valor de ' + field);
  }

  moveInto(consulta) {
    if (!this.swap) {
      this.presentToast('Selecciona primero el valor a intercambiar.');
      return;
    }

    this.consultas = this.copyConsultas();
    const indexFrom = this.user.consultas.findIndex(c => c.date === this.swap.consulta.date);
    const indexTo = this.user.consultas.findIndex(c => c.date === consulta.date);
    const valueFrom = this.user.consultas[indexFrom][this.swap.field];
    const valueTo = this.user.consultas[indexTo][this.swap.field];

    this.consultas[indexFrom][this.swap.field] = valueTo;
    this.consultas[indexTo][this.swap.field] = valueFrom;

    this.presentToast('El valor de ' + this.swap.field + ' fue intercambiado.');
    setTimeout(() => this.swap = false);

  }

  editConsultaValue(consulta, field, event) {
    this.consultas = this.consultas.map(c => {
      const tmp = Object.assign({}, c);

      if (tmp.date === consulta.date) {
        tmp[field] = event.target.value;
      }

      return tmp;
    });
  }

  createPayloadForm() {
    return {
      id: this.user.id,
      name: this.user.name,
      age: this.user.age,
      birthday: this.user.birthday,
      height: this.user.height,
      mail: this.user.mail,
      schedule: this.user.schedule,
      admin: this.user.admin,
      doctor: this.user.doctor,
      patient: this.user.patient,
      alimenticios: this.form.value.alimenticios,
      antecedentes: this.form.value.antecedentes,
      consultas: this.consultas,
    };
  }

  deleteConsulta(index) {
    this.consultas.splice(index, 1);
  }

  submit(value) {
    value.id = this.user.id;
    value.name = this.user.name;
    value.age = this.user.age;
    value.birthday = this.user.birthday;
    value.height = this.user.height;
    value.mail = this.user.mail;
    value.schedule = this.user.schedule;
    value.admin = this.user.admin;
    value.doctor = this.user.doctor;
    value.patient = this.user.patient;
    value.alimenticios = this.form.value.alimenticios;
    value.antecedentes = this.form.value.antecedentes;
    value.consultas = this.consultas;
    value.consultas = this.sortDatesConsultas(value.consultas);
    this.updateUser(value);
  }

  updateUser(value) {
    if(value.id){
      console.log('updateUser TIENE ID ', value);
      this.presentLoading();
      this.store.dispatch(new UpdateUserData(value)).subscribe(data => {
        this.getUser();
        this.savedOK(value, true);
      });
    }
    else{
      console.log('NO TIENE ID');
    }


  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'Aceptar',
        handler: () => {

        }
      }]
    });

    await alert.present();
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

  savedOK(value, showPassword = false) {
    const message = !showPassword ? ' La contraseña temporal es 12341234' : '';
    this.dismissLoading();
    this.presentAlert('Usuario', value.name + ' guardado correctamente.' + message);
    this.utilitiesService.setEdit(false);
  }

  async showAppointmentModal() {
    const modal = await this.modalController.create({
      component: AppointmentPage,
    });

    modal.onWillDismiss().then( data => {
      if (data.data) {
        this.consultas.push(data.data);
        const payload = this.createPayloadForm();
        payload.consultas = this.sortDatesConsultas(payload.consultas);
        this.updateUser(payload);
      }
    });

    return await modal.present();
  }

  sortDatesConsultas(array) {
    return array.sort((a, b) => +moment(a.date, 'DD/MM/YYYY') - +moment(b.date, 'DD/MM/YYYY'));
  }
}
