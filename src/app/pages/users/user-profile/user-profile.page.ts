import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router} from '@angular/router';
import {IonTabs, ModalController} from '@ionic/angular';
import {ParseFilePage} from '../parse-file/parse-file.page';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit, AfterViewInit {
  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  userID: any;
  selectedTab: any;
  showParseBtn = false;

  constructor(private router: Router,
              public modalController: ModalController) { }

  ngOnInit() {
    const url = this.router.url.split('/');
    this.userID = url.pop();
  }

  ngAfterViewInit() {
    this.tabs.select(`user/${this.userID}`);
  }

  setCurrentTab() {
    this.selectedTab = this.tabs.getSelected();
    this.tabs.select(`${this.selectedTab}/${this.userID}`);

    if (this.selectedTab === 'medical') {
      this.showParseBtn = true;
    } else {
      this.showParseBtn = false;
    }
  }

  async showParseFileModal() {
    const modal = await this.modalController.create({
      component: ParseFilePage,
    });
    return await modal.present();
  }

}
