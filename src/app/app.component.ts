import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
// import firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'picture-flow';

  constructor(public auth: AngularFireAuth) {
    // this.auth.signInWithRedirect()
    // new firebase.auth.
  }
}
