import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { HomComponent } from './hom/hom.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ContactusComponent } from './contactus/contactus.component';
import { FeaturesComponent } from './features/features.component';
import { DocumentverificationComponent } from './documentverification/documentverification.component';
import { TermsandconditionComponent } from './termsandcondition/termsandcondition.component';
import { FaqComponent } from './faq/faq.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { SignupmailconfirmComponent } from './signupmailconfirm/signupmailconfirm.component';
import { MailConfirmComponent } from './mail-confirm/mail-confirm.component';
import { SignupemployeeComponent } from './signupemployee/signupemployee.component';
import { UnauthorizedAccessComponent } from './unauthorized-access/unauthorized-access.component';
import { MobileauthenticationComponent } from './mobileauthentication/mobileauthentication.component';

export const outsidecomponentsroutes: Routes = [
  {
    path: '', component: HomComponent,
    children: [
      { path: '', component: HomepageComponent },
      { path: 'about', component: AboutusComponent },
      { path: 'contact', component: ContactusComponent },
      { path: 'features', component: FeaturesComponent },
      { path: 'termsandconditions', component: TermsandconditionComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'verification', component: DocumentverificationComponent },
      { path: 'privacy', component: PrivacyComponent }
    ]
  },
  { path: 'privacypolicy', component: PrivacyComponent },
  { path: 'termsandcondition', component: TermsandconditionComponent },
  { path: 'emailactivation/:id', component: MailConfirmComponent },
  { path: 'signupemployee/:id', component: SignupemployeeComponent },
  { path: 'signupemailconfirm/:id', component: SignupmailconfirmComponent },
  { path: 'unauthorized', component: UnauthorizedAccessComponent },
  { path: 'checkauthentication/:id', component: MobileauthenticationComponent }
]

