import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder,
              public modalController: ModalController) {
    this.form = this.formBuilder.group({
      agua: new FormControl(''),
      bd: new FormControl(''),
      bi: new FormControl(''),
      cadera: new FormControl(''),
      cintura: new FormControl(''),
      date: new FormControl(moment().toISOString()),
      edadMetabolica: new FormControl(''),
      edadOsea: new FormControl(''),
      grasa: new FormControl(''),
      grasaVisceral: new FormControl(''),
      pd: new FormControl(''),
      pi: new FormControl(''),
      peso: new FormControl('', Validators.compose([Validators.required])),
      pecho: new FormControl(''),
      pesoMuscular: new FormControl('')
    });
  }

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss();
  }

  submit(value) {
    value.date = moment(value.date).format('D/M/YY');
    this.modalController.dismiss(value);
  }

}
