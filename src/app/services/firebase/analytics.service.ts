import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import {Store} from '@ngxs/store';
import {AppState} from '../../store/states/app.state';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  version = environment.version;

  constructor(private store: Store) {
    firebase.analytics();
  }

  sendEvent(eventName, eventParams = null) {
    if (!eventParams) {
      eventParams = {};
    }
    const user = this.store.selectSnapshot(AppState.user);
    eventParams.user = user ? user.id : '';
    eventParams.version = this.version;
    firebase.analytics().logEvent(eventName, eventParams);

  }


}
