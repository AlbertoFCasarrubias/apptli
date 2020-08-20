import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {FirebaseService} from '../firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private firebaseService: FirebaseService,
              public afAuth: AngularFireAuth) { }

  doRegister(value)
  {
    return new Promise<any>((resolve, reject) => {
      firebase.auth()
          .createUserWithEmailAndPassword(value.email, value.password)
          .then(
              res => resolve(res),
              err => reject(err));
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
