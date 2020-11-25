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
  cloudFunctionCreateUser$;
  callableCreateUser;

  cloudFunctionDeleteUser$;
  callableDeleteUser;

  constructor(private firebaseService: FirebaseService,
              private fns: AngularFireFunctions,
              public afAuth: AngularFireAuth) {
    this.callableCreateUser = fns.httpsCallable('createUser');
    this.callableDeleteUser = fns.httpsCallable('deleteUser');
  }

  doRegister(value) {
    return new Promise<any>((resolve, reject) => {
      this.cloudFunctionCreateUser$ = this.callableCreateUser(value);
      this.cloudFunctionCreateUser$.subscribe(
          res => resolve(res),
          err => reject(err)
      );
    });
  }

  doDeleteUser(uid) {
    return new Promise<any>((resolve, reject) => {
      this.cloudFunctionDeleteUser$ = this.callableDeleteUser(uid);
      this.cloudFunctionDeleteUser$.subscribe(
          res => resolve(res),
          err => reject(err)
      );
    });
  }

  doLogin(value) {
    return firebase.auth().signInWithEmailAndPassword(value.email, value.password);
  }

  doLogout() {
    return this.afAuth.signOut();
  }

  doChangePassword(mail) {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().sendPasswordResetEmail(mail)
          .then(
              res => resolve(res),
              err => reject(err));
    });
  }

}
