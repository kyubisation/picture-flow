import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';

import { AddPhotoComponent } from './add-photo/add-photo.component';
import { FlowComponent } from './flow/flow.component';
import { SignInComponent } from './sign-in/sign-in.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['sign-in']);
const redirectLoggedInToLandingPage = () => redirectLoggedInTo(['']);

const routes: Routes = [
  { path: '', component: FlowComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'sign-in', component: SignInComponent, ...canActivate(redirectLoggedInToLandingPage) },
  { path: 'add-photo', component: AddPhotoComponent, ...canActivate(redirectUnauthorizedToLogin) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
