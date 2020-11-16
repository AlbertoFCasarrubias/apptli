import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router} from '@angular/router';
import {IonTabs, ModalController, NavController} from '@ionic/angular';
import {ParseFilePage} from '../parse-file/parse-file.page';
import {AppState} from '../../../store/states/app.state';
import {Store} from '@ngxs/store';
import {UsersState} from '../../../store/states/users.state';

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
  appUser: any;
  users: any;
  user: any;
  badge = {
    medical: 0,
    user: 0
  };

  constructor(private router: Router,
              private nav: NavController,
              private store: Store,
              public modalController: ModalController) {
    this.appUser = this.store.selectSnapshot(AppState.user);
    this.getUsers();
  }

  ngOnInit() {
    const url = this.router.url.split('/');
    this.userID = url.pop();
  }

  ngAfterViewInit() {
    this.tabs.select(`user/${this.userID}`);
    this.user = this.users.find(u => u.id === this.userID);
  }

  back(){
    this.nav.back();
  }

  getUsers() {
    if (this.appUser.admin) {
      this.users = this.store.selectSnapshot(UsersState.users);
    } else {
      this.users = this.store.selectSnapshot(UsersState.patients);
    }
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

    modal.onWillDismiss().then( data => {
      const json = data['data']['json'];
      //console.log('DISMISS ', json);
      if (this.user.name !== json.name) {
        this.badge.user++;
      }

      if (this.user.height !== json.height) {
        this.badge.user++;
      }

      if (this.user.age !== json.age) {
        this.badge.user++;
      }

    });

    return await modal.present();
  }

}
