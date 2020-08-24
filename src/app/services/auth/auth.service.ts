import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {FirebaseService} from '../firebase/firebase.service';
import {AngularFireFunctions} from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  cloudFunction$;
  callable;

  constructor(private firebaseService: FirebaseService,
              private fns: AngularFireFunctions,
              public afAuth: AngularFireAuth) {
    this.callable = fns.httpsCallable('createUser');
  }

  doRegister(value) {
    return new Promise<any>((resolve, reject) => {
      this.cloudFunction$ = this.callable(value);
      this.cloudFunction$.subscribe(
          res => resolve(res),
          err => reject(err)
      );
    });
  }

  doLogin(value) {
    return firebase.auth().signInWithEmailAndPassword(value.email, value.password);
  }

  doLogout() {
    return this.afAuth.auth.signOut();
  }

  doChangePassword() {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().sendPasswordResetEmail('alberto@chukan.net')
          .then(
              res => resolve(res),
              err => reject(err));
    });
  }

}
