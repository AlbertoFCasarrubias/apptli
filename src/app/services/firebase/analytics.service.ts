import { Injectable } from '@angular/core';
import {AngularFireAnalytics} from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private analytics: AngularFireAnalytics) { }

  sendEvent(title) {
    this.analytics.logEvent(title , {
      eventCategory: 'eventCategory',
      eventAction: 'eventAction',
      eventLabel: 'label',
      transport: 'transport'
    })
        .then( data => console.log('DATA ', data))
        .catch( err => console.error('ERROR ', err));
  }
}
