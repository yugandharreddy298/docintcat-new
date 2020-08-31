import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { outsidecomponentsroutes } from './outsidecomponents.routes';
import { RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { HomComponent } from './hom/hom.component';
import { sharedModulesModule } from '../sharedmodules.module'
import { AboutusComponent } from './aboutus/aboutus.component';
import { ContactusComponent } from './contactus/contactus.component';
import { FeaturesComponent } from './features/features.component';
import { DocumentverificationComponent } from './documentverification/documentverification.component';
import { TermsandconditionComponent } from './termsandcondition/termsandcondition.component';
import { FaqComponent } from './faq/faq.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { SignupmailconfirmComponent } from './signupmailconfirm/signupmailconfirm.component'
import { MailConfirmComponent } from './mail-confirm/mail-confirm.component';
import { SignupemployeeComponent } from './signupemployee/signupemployee.component';
import { CountdownModule } from 'ngx-countdown';
import { UnauthorizedAccessComponent } from './unauthorized-access/unauthorized-access.component';
import { MobileauthenticationComponent } from './mobileauthentication/mobileauthentication.component';

@NgModule({
  declarations: [
    HomComponent,
    HomepageComponent,
    AboutusComponent,
    ContactusComponent,
    FeaturesComponent,
    DocumentverificationComponent,
    TermsandconditionComponent,
    FaqComponent,
    PrivacyComponent,
    SignupmailconfirmComponent,
    MailConfirmComponent,
    SignupemployeeComponent,
    UnauthorizedAccessComponent,
    MobileauthenticationComponent
 
  ],
  imports: [
    CommonModule,
    CountdownModule,
    RouterModule.forChild(outsidecomponentsroutes),
    sharedModulesModule
  ]
})
export class OutsidecomponentsModule { }
