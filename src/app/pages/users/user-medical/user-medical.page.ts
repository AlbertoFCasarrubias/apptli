import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {UsersState} from '../../../store/states/users.state';
import {Observable, Subscription} from 'rxjs';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {UpdateUserData} from '../../../store/actions/users.action';
import * as moment from 'moment';

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


  form: FormGroup;
  user: any = {
    alimenticios: {},
    antecedentes: {},
    consultas: []
  };
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

      this.form.controls.alimenticios.patchValue(data['json'].alimenticios);
      this.form.controls.antecedentes.patchValue(data['json'].antecedentes);
      this.form.controls.consultas.patchValue(data['json'].consultas);

      this.generateCharts();
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
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const users = Object.assign([], this.store.selectSnapshot(UsersState.users));
    this.user = Object.assign({}, users.find(u => u.id === id));

    if (this.user) {
      this.form.controls.alimenticios.patchValue(this.user.alimenticios);
      this.form.controls.antecedentes.patchValue(this.user.antecedentes);
      this.form.controls.consultas.patchValue(this.user.consultas);
      this.generateCharts();
    }
  }

  ngOnDestroy() {
    this.subscriptionJSON.unsubscribe();
    this.subscriptionEdit.unsubscribe();
  }

  generateCharts() {
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
    const xLabels = this.user.consultas.map(c => moment(c.date, 'DD/MM/YYYY').format('DD-MMM'));
    this.charts[chart].type = 'spline';
    this.charts[chart].xAxis = xLabels;
    this.charts[chart].data = this.user.consultas.map(c => Number(c[chart]));
    this.charts[chart].data.push(this.charts[chart].data.pop());
    this.charts[chart].xAxis.push('');
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  chartCallback(){

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

    const indexFrom = this.user.consultas.findIndex(c => c.date === this.swap.consulta.date);
    const indexTo = this.user.consultas.findIndex(c => c.date === consulta.date);
    const valueFrom = this.user.consultas[indexFrom][this.swap.field];
    const valueTo = this.user.consultas[indexTo][this.swap.field];

    this.user.consultas[indexFrom][this.swap.field] = valueTo;
    this.user.consultas[indexTo][this.swap.field] = valueFrom;

    this.presentToast('El valor de ' + this.swap.field + ' fue intercambiado.');
    setTimeout(() => this.swap = false);

  }

  editConsultaValue(consulta, field, event) {
    this.user.consultas = this.user.consultas.map(c => {
      const tmp = Object.assign({}, c);

      if (tmp.date === consulta.date) {
        tmp[field] = event.target.value;
      }

      return tmp;
    });
  }

  submit(value) {
    this.presentLoading();
    this.user.alimenticios = this.form.value.alimenticios;
    this.user.antecedentes = this.form.value.antecedentes;

    this.updateUser(this.user);
  }

  updateUser(value) {
    value.doctor = value.doctor === 'true' ? true : false;
    value.admin = value.admin === 'true' ? true : false;

    console.log('VALUE ', value);

    this.store.dispatch(new UpdateUserData(value)).subscribe(data => {
      this.savedOK(value, true);
    });
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
    this.generateCharts();
  }

  createColumnChart(title) {

  }

}
