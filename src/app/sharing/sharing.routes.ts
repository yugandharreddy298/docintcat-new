import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainnavComponent } from './mainnav/mainnav.component';
import { FiledocumentComponent } from './filedocument/filedocument.component';
import { AfterloginComponent } from './afterlogin/afterlogin.component';
import { BinfilesComponent } from './binfiles/binfiles.component';
import { FavoritefilesComponent } from './favoritefiles/favoritefiles.component';
import { SharedFilesComponent } from './shared-files/shared-files.component';
import { SentfilesComponent } from './sentfiles/sentfiles.component';
import { AdminviewComponent } from './adminview/adminview.component';
import { TemplatesComponent } from './templates/templates.component';
import { AgreementcopyComponent } from './agreementcopy/agreementcopy.component';
import { AuditlogComponent } from './auditlog/auditlog.component';
import { TransactionVerifyComponent } from './transaction-verify/transaction-verify.component'
import { SearchresultComponent } from './searchresult/searchresult.component';
import {DocumentverificationComponent} from '../outsidecomponents/documentverification/documentverification.component'
import { VideoplayerComponent } from './videoplayer/videoplayer.component';
export const sharingroutes: Routes = [
    {
        path: 'home', component: MainnavComponent,
        children: [
          { path: 'dashboard', component: AdminviewComponent },
          { path: '', component: AfterloginComponent },
          { path: 'myfiles', component: FiledocumentComponent },
          { path: 'myfiles/:id', component: FiledocumentComponent },
          { path: 'favorites/:id', component: FavoritefilesComponent },
          { path: 'favorites', component: FavoritefilesComponent },
          { path: 'shareddocument', component: SharedFilesComponent },
          { path: 'shareddocument/:id', component: SharedFilesComponent },
          { path: 'sentfiles/:id', component: SentfilesComponent },
          { path: 'sentfiles', component: SentfilesComponent },
          { path: 'binfiles', component: BinfilesComponent },
          { path: 'search', component: SearchresultComponent },
          { path: 'auditlog', component: AuditlogComponent },
          { path: 'auditlog/:id/:id2', component: AuditlogComponent },  
          { path: 'templates', component: TemplatesComponent },
          { path: 'verification', component: DocumentverificationComponent },


        ]    
      },
      { path: 'filecont/:id', component: AgreementcopyComponent }, 
      { path: 'filecont/:id/:id1', component: AgreementcopyComponent }, 
      { path: 'templateedit/:id/:id1', component: AgreementcopyComponent },         
      { path: 'transaction-verify', component: TransactionVerifyComponent },
      { path: 'transaction-verify/:id/:id2/:id3', component: TransactionVerifyComponent },
      { path: 'videoplay/:id', component: VideoplayerComponent},


]