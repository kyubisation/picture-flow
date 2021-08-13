import { Component } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'picture-flow';
  readonly user: Observable<firebase.User | null> = this._auth.user;

  constructor(private _auth: AuthService, private _router: Router) {}

  async signOut() {
    await this._auth.signOut();
    await this._router.navigate(['/sign-in']);
  }
}
