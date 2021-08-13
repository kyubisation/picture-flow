import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

export type IdentityProviders = 'google' | 'facebook' | 'twitter' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly user: Observable<firebase.User | null> = this._firebaseAuth.user;

  get previousIdp(): IdentityProviders {
    return localStorage.getItem('picture-flow-previous-idp') as IdentityProviders;
  }

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

  signInWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    return this._signIn(provider);
  }

  signOut() {
    return this._firebaseAuth.signOut();
  }

  private _signIn(provider: firebase.auth.AuthProvider) {
    return this._firebaseAuth.signInWithRedirect(provider);
  }
}
