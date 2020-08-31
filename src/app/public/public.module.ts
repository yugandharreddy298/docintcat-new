import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { publicroutes } from './public.routing';
import { RouterModule } from '@angular/router';
import { AllowusersComponent } from './allowusers/allowusers.component';
import { ShareviewComponent } from './shareview/shareview.component';
import { sharedModulesModule } from '../sharedmodules.module';
import { ChatComponent } from './chat/chat.component';
import { AunthicateComponent } from './aunthicate/aunthicate.component'
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { SignupdialogboxComponent } from './signupdialogbox/signupdialogbox.component';
import { UploadLinkComponent } from './upload-link/upload-link.component';
import { MaillinksComponent } from './maillinks/maillinks.component';
import { PublicfoldersComponent } from './publicfolders/publicfolders.component';

@NgModule({
  declarations: [
    AllowusersComponent,
    ShareviewComponent,
    ChatComponent,
    AunthicateComponent,
    CommonDialogComponent,
    SignupdialogboxComponent,
    UploadLinkComponent,
    MaillinksComponent,
    PublicfoldersComponent

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(publicroutes),
    sharedModulesModule
  ],
  exports: [
    AllowusersComponent,
    ShareviewComponent,
    ChatComponent,
    AunthicateComponent,
    CommonDialogComponent
  ],
  entryComponents: [
    CommonDialogComponent,
    SignupdialogboxComponent
  ]
})
export class PublicModule { }
