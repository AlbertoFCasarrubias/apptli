import {AfterContentChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AlertController, ModalController, Platform} from '@ionic/angular';
import {ModalObjectQuantityComponent} from './modal-object-quantity/modal-object-quantity.component';
import {ModalScheduleComponent} from '../schedule/modal-schedule/modal-schedule.component';

@Component({
  selector: 'object-quantity',
  templateUrl: './object-quantity.component.html',
  styleUrls: ['./object-quantity.component.scss'],
})
export class ObjectQuantityComponent implements AfterContentChecked {
  @Input() initial: any = ''; //Valores iniciales que deben estar cargados en el componente
  @Input() data: any = '';    //Valores totales, ejemplo: todos los productos del catálogo
  @Input() title: any = '';
  @Input() color: any = '';
  @Input() showQuantity: any = true;
  @Input() multiple: any = true;
  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();

  response: any = [];
  deleteData:any = [];
  devWidth: any;

  constructor(public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public platform: Platform) {}

  ngAfterContentChecked()
  {
    this.devWidth = this.platform.width();
    if (this.initial) {
      this.response = this.initial;
    }
  }

  async showData() {
    const modal = await this.modalCtrl.create({
      component: ModalObjectQuantityComponent,
      componentProps: {
        data: this.data,
        title: this.title,
        initial: this.response,
        multiple: this.multiple
      }
    });

    modal.onDidDismiss()
        .then(response => {

          if(response)
          {
            const users = response.data;

            const usersMap = users.map(el =>
            {
              /*
              const find = this.response.find(rp => rp.id === el.id);

              if(find && find.quantity) {
                el.quantity = find.quantity;
              }
              else
              {
                el.quantity = 1;
              }*/

              return el;
            });

            usersMap.sort((a, b) => {
              return a.name - b.name;
            });

            this.response = usersMap;
          }
          this.emit();

        });

    return await modal.present();
  }

  removeItem(obj) {
    this.showConfirm(obj);
  }

  async showConfirm(obj) {
    const alert = await this.alertCtrl.create({
      header: `¿Quieres eliminar ${obj.name}?`,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Aceptar',
          handler: () =>
          {
            console.log('RESPONSE ', this.response);
            this.deleteData.push(obj);
            this.response = this.response.filter(el => el.id !== obj.id);

            console.log('RESPONSE ', this.response);

            this.delete.emit(this.deleteData);
            this.emit();
          }
        }
      ]
    });
    await alert.present();
  }

  updateQuantity($event, obj)
  {
    this.response = this.response.map(el =>
    {
      if(el.id == obj.id)
      {
        el.quantity = $event.value;
      }

      return el;
    });

    this.emit();

  }

  emit()
  {
    this.change.emit(this.response);
  }

}
