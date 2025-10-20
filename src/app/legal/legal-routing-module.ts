import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Privacy } from './privacy/privacy';
import { TermsOfService } from './terms-of-service/terms-of-service';

const routes: Routes = [
  { path: 'privacy', component: Privacy },
  { path: 'termsofservice', component: TermsOfService },
  { path: '**', redirectTo: '/privacy' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { }
