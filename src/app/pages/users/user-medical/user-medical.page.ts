import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-user-medical',
  templateUrl: './user-medical.page.html',
  styleUrls: ['./user-medical.page.scss'],
})
export class UserMedicalPage implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('UserMedicalPage ', id);
  }

}
