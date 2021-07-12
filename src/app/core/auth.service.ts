import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _firebaseAuth: AngularFireAuth) {}

  signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this._signIn(provider);
  }

  signInWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this._signIn(provider);
  }

  signInWithTwitter() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return this._signIn(provider);
  }

  private _signIn(provider: firebase.auth.AuthProvider) {
    return this._firebaseAuth.signInWithRedirect(provider);
  }
}
