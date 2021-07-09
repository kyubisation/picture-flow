import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';

import { FlowComponent } from './flow/flow.component';
import { LoginComponent } from './login/login.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToLandingPage = () => redirectLoggedInTo(['']);

const routes: Routes = [
  { path: '', component: FlowComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'login', component: LoginComponent, ...canActivate(redirectLoggedInToLandingPage) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
