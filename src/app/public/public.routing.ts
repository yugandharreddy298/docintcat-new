import { Routes } from '@angular/router';
import { AllowusersComponent } from './allowusers/allowusers.component';
import { ShareviewComponent } from './shareview/shareview.component';
import { UploadLinkComponent } from './upload-link/upload-link.component';
import { MaillinksComponent } from './maillinks/maillinks.component';
import { AunthicateComponent } from './aunthicate/aunthicate.component'
import { PublicfoldersComponent } from './publicfolders/publicfolders.component';

export const publicroutes: Routes = [
    { path: 'allowusers/:id', component: AllowusersComponent },
    { path: 'sharereview/:id', component: ShareviewComponent },
    { path: 'sharereview/:id/:id2', component: ShareviewComponent },
    { path: 'Sharereview/:id/:id2', component: ShareviewComponent },
    { path: 'uploadbylink/:id', component: UploadLinkComponent },
    { path: 'checkuser/:id', component: MaillinksComponent },
    // { path: 'checkauthentication/:id', component: AunthicateComponent },
    { path: 'publicfoldersComponent/:id', component: PublicfoldersComponent },


]