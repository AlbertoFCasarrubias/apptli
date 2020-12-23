import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router} from '@angular/router';
import {IonTabs, MenuController, ModalController, NavController} from '@ionic/angular';
import {ParseFilePage} from '../parse-file/parse-file.page';
import {AppState} from '../../../store/states/app.state';
import {Store} from '@ngxs/store';
import {UsersState} from '../../../store/states/users.state';
import {UtilitiesService} from '../../../services/utilities/utilities.service';
import {Observable, Subscription} from 'rxjs';
import {AnalyticsService} from '../../../services/firebase/analytics.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit, AfterViewInit {
  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  subscriptionTabs: Subscription;
  tabs$: Observable<object>;

  subscriptionEdit: Subscription;
  edit$: Observable<object>;

  userID: any;
  selectedTab: any;
  showParseBtn = false;
  appUser: any;
  users: any;
  user: any;
  edit = false;
  badge = {
    medical: 0,
    user: 0
  };

  disable = {
    medical: false
  };

  constructor(private router: Router,
              private nav: NavController,
              private store: Store,
              public menuCtrl: MenuController,
              private utilitiesService: UtilitiesService,
              private analyticsService: AnalyticsService,
              public modalController: ModalController) {
    this.appUser = this.store.selectSnapshot(AppState.user);
    this.getUsers();

    this.tabs$ = this.utilitiesService.tabs;
    this.subscriptionTabs = this.tabs$.subscribe( data => {
      if (data['tabs'].tab) {
        this.disable.medical = true;
        this.user = data['tabs'].createdUser;
        this.userID = data['tabs'].createdUser.id;
        this.getUsers();
        console.log('USER ', document.documentURI.split('/'), this.userID, this.user, this.users);
      }
    });

    this.edit$ = this.utilitiesService.edit;
    this.subscriptionEdit = this.edit$.subscribe(next => {
      this.edit = next['edit'];
    });
  }

  ngOnInit() {
    this.getUser();
  }

  ngAfterViewInit() {
    this.tabs.select(`user/${this.userID}`);
    this.user = this.users.find(u => u.id === this.userID);
    console.log('this.user ', this.user);

    if (this.user) {
      this.disable.medical = true;
    }
  }

  getUser() {
    const url = this.router.url.split('/');
    this.userID = url.pop();
  }


  toggleMenu() {
    this.menuCtrl.toggle();
  }

  back() {
    this.router.navigate(['/users']);
  }

  getUsers() {
    this.users = this.store.selectSnapshot(UsersState.users);
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

  editMode() {
    this.edit = !this.edit;
    this.utilitiesService.setEdit(this.edit);
  }

  async showParseFileModal() {
    this.analyticsService.sendEvent('open_parse_file');
    const modal = await this.modalController.create({
      component: ParseFilePage,
    });

    modal.onWillDismiss().then( data => {
      if (data['data']) {
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
      }

    });

    return await modal.present();
  }

}
