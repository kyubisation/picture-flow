import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = environment.title;
  readonly user: Observable<firebase.User | null> = this._auth.user;

  constructor(
    private _auth: AuthService,
    private _router: Router,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    for (const idp of ['google', 'facebook', 'twitter', 'microsoft']) {
      const resourceUrl = sanitizer.bypassSecurityTrustResourceUrl(`/assets/${idp}.svg`);
      iconRegistry.addSvgIconInNamespace('auth', idp, resourceUrl);
    }
  }

  async signOut() {
    await this._auth.signOut();
    await this._router.navigate(['/sign-in']);
  }
}
