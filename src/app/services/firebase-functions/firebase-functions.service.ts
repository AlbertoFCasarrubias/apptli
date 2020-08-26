import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFunctionsService {
  cloudFunction$;
  callable;

  constructor(private fns: AngularFireFunctions) {}

  pushNotification(value) {
    this.callable = this.fns.httpsCallable('pushNotification');
    return new Promise<any>((resolve, reject) => {
      this.cloudFunction$ = this.callable(value);
      this.cloudFunction$.subscribe(
          res => resolve(res),
          err => reject(err)
      );
    });
  }
}
