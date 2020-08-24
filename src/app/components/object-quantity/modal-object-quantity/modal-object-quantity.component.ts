import {Component, OnInit} from '@angular/core';
import {ModalController, NavController, NavParams} from '@ionic/angular';

@Component({
    selector: 'app-modal-object-quantity',
    templateUrl: './modal-object-quantity.component.html',
    styleUrls: ['./modal-object-quantity.component.scss'],
})
export class ModalObjectQuantityComponent implements OnInit {

    originalData: any = [];
    data: any = [];
    dataSelected = [];
    title = '';
    multiple = true;
    initalData: any;
    shouldShowCancel = false;

    constructor(public navCtrl: NavController,
                //public viewCtrl: ViewController,
                private modalController: ModalController,
                public navParams: NavParams) {
    }

    ngOnInit() {
        console.log('ModalObjectQuantityComponent this.navParams ', this.navParams);

        this.initalData = this.navParams.data.initial;
        this.title = this.navParams.data.title;
        this.data = this.navParams.data.data;
        this.originalData = this.navParams.data.data;
        this.dataSelected = this.navParams.data.initial;
        this.multiple = this.navParams.data.multiple;
    }

    onInput(ev: any) {
        // Reset items back to all of the items
        this.data = this.originalData;

        // set val to the value of the searchbar
        const val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.data = this.data.filter((item) => {
                return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
            });
        }
    }

    onCancel(ev) {
        console.log(ev);
    }

    check(item) {
        const find = this.dataSelected.find(el => {
            if (el && item && el.id == item.id) {
                return true;
            } else {
                return false;
            }
        });

        if (find) {
            return 'selected';
        } else {
            return '';
        }
    }

    selectItem(item) {
        const find = this.dataSelected.find(el => {
            if (el && item && el.id == item.id) {
                return true;
            } else {
                return false;
            }
        });

        if (find) {
            this.dataSelected = this.dataSelected.filter(el => el.id != item.id);
        } else {
            if (this.multiple) {
                this.dataSelected.push(item);
            } else {
                this.dataSelected = [];
                this.dataSelected.push(item);
            }
        }
    }

    close() {
        this.dataSelected = this.navParams.data.initial;
        this.modalController.dismiss(this.navParams.data.initial);
    }

    closeModal() {
        this.modalController.dismiss(this.dataSelected);
    }

}
