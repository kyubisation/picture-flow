import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(public auth: AuthService) {}

  signInWithGoogle() {
    this.auth.signInWithGoogle();
  }

  signInWithFacebook() {
    this.auth.signInWithFacebook();
  }

  signInWithTwitter() {
    this.auth.signInWithTwitter();
  }
}
