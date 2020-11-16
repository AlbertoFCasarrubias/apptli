import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {AppState} from '../../../store/states/app.state';
import {UsersState} from '../../../store/states/users.state';
import {Observable, Subscription} from 'rxjs';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {UpdateUserData} from '../../../store/actions/users.action';
import {Chart} from "angular-highcharts";

@Component({
  selector: 'app-user-medical',
  templateUrl: './user-medical.page.html',
  styleUrls: ['./user-medical.page.scss'],
})
export class UserMedicalPage implements OnInit, OnDestroy {
  subscriptionJSON: Subscription;
  json$: Observable<object>;
  form: FormGroup;
  user: any = {
    alimenticios: {},
    antecedentes: {},
    consultas: []
  };
  swap: any = false;
  loading: any;
  edit = false;

  chartMes: any;
  chartMesOptions: any = this.createColumnChart('Ventas por mes');
  colors = ['#0072bb', '#024ea2', '#2e3192', '#5b2d90', '#92278f', '#8f52a0', '#64E572', '#8c62aa', '#727dbd', '#95b5de']

  constructor(private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private store: Store,
              public toastController: ToastController,
              public alertController: AlertController,
              public loadingController: LoadingController,
              private utilitiesService: UtilitiesService) {
    this.json$ = this.utilitiesService.json;
    this.subscriptionJSON = this.json$.subscribe( data => {
      console.log('data[\'json\']' , data['json']);
      console.log('this.user' , this.user);
      const user = Object.assign({}, this.user);

      user.alimenticios = data['json'].alimenticios;
      user.antecedentes = data['json'].antecedentes;
      user.consultas = data['json'].consultas;

      this.user = user;

      this.form.controls.alimenticios.patchValue(data['json'].alimenticios);
      this.form.controls.antecedentes.patchValue(data['json'].antecedentes);
      this.form.controls.consultas.patchValue(data['json'].consultas);
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
    this.user = this.store.selectSnapshot(UsersState.users).find(u => u.id === id);

    if (this.user) {
      this.form.controls.alimenticios.patchValue(this.user.alimenticios);
      this.form.controls.antecedentes.patchValue(this.user.antecedentes);
      this.form.controls.consultas.patchValue(this.user.consultas);
    }

    /*
    this.chartMesOptions.series[0].data = month.map(order => {
            const reduce = order.data.reduce((a, b) => {
              const price = b.price ? Number(b.price) : 0;
              return a + price;
            } , 0);

            return {
              name: order.group,
              y: reduce
            };
          });
          this.chartMes = new Chart(this.chartMesOptions);
     */

    this.chartMes = new Chart(this.chartMesOptions);



  }

  ngOnDestroy() {
    this.subscriptionJSON.unsubscribe();
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

  submit(value) {
    this.presentLoading();
    this.user.alimenticios = this.form.value.alimenticios;
    this.user.antecedentes = this.form.value.antecedentes;

    this.updateUser(this.user);
  }

  updateUser(value) {
    value.doctor = value.doctor === 'true' ? true : false;
    value.admin = value.admin === 'true' ? true : false;

    console.log('updateUser value ', value);
    console.log('/// ', this.form.value);

    this.store.dispatch(new UpdateUserData(value)).subscribe(data => {
      console.log('DATA UPDATE ', data);
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
    console.log('VALUE SAVED OK ', value);
    const message = !showPassword ? ' La contraseña temporal es 12341234' : '';
    this.dismissLoading();
    this.presentAlert('Usuario', value.name + ' guardado correctamente.' + message);
  }

  createColumnChart(title) {
    return {
      title: {
        text: title
      },

      yAxis: {
        title: {
          text: 'Number of Employees'
        }
      },

      xAxis: {
        accessibility: {
          rangeDescription: 'Range: 2010 to 2017'
        }
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointStart: 2010
        }
      },

      series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    };
  }

}
