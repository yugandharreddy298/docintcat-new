import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { sharingroutes } from './sharing.routes';
import { RouterModule } from '@angular/router';
import { sharedModulesModule } from '../sharedmodules.module';
import { MainnavComponent } from './mainnav/mainnav.component';
import { MyfilesComponent } from './myfiles/myfiles.component'
import { FiledocumentComponent } from './filedocument/filedocument.component';
import { AfterConfirmationComponent } from './after-confirmation/after-confirmation.component';
import { AfterloginComponent } from './afterlogin/afterlogin.component';
import { FavoritefilesComponent } from './favoritefiles/favoritefiles.component'
import { BinfilesComponent } from './binfiles/binfiles.component';
import { SharedFilesComponent } from './shared-files/shared-files.component';
import { SentfilesComponent } from './sentfiles/sentfiles.component';
import { AdminviewComponent } from './adminview/adminview.component';
import { NearmapsComponent } from './nearmaps/nearmaps.component';
import { TemplatesComponent } from './templates/templates.component';
import { AgreementcopyComponent } from './agreementcopy/agreementcopy.component';
import { DocFields } from "./agreementcopy/docfields"
import { DateFilterPipe } from './date-filter.pipe';
import { FilterPipe } from './filter.pipe';
import { TemplteFilterPipe } from './templatefilter';
import { SharepopupComponent } from './sharepopup/sharepopup.component';
import { AuditlogComponent } from './auditlog/auditlog.component';
import { TransactionVerifyComponent } from './transaction-verify/transaction-verify.component'
import { NearMapsPopupComponent } from './near-maps-popup/near-maps-popup.component';
import { SearchresultComponent } from './searchresult/searchresult.component';
import { MovetoComponent } from './moveto/moveto.component';
import { PublicModule } from '../public/public.module';
import {OutsidecomponentsModule} from '../outsidecomponents/outsidecomponents.module';
import { PreviewPdfComponent } from './preview-pdf/preview-pdf.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component'

@NgModule({
  declarations: [
    MainnavComponent,
    FiledocumentComponent,
    MyfilesComponent,
    AfterConfirmationComponent,
    AfterloginComponent,
    SentfilesComponent,
    FavoritefilesComponent,
    BinfilesComponent,
    SharedFilesComponent,
    AdminviewComponent,
    NearmapsComponent,
    TemplatesComponent,
    AgreementcopyComponent,
    FilterPipe,
    TemplteFilterPipe,
    DateFilterPipe,
    SharepopupComponent,
    AuditlogComponent,
    TransactionVerifyComponent,
    NearMapsPopupComponent,
    SearchresultComponent,
    MovetoComponent,
    PreviewPdfComponent,
    VideoplayerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(sharingroutes),
    sharedModulesModule,
    PublicModule,
    OutsidecomponentsModule

  ],
  entryComponents:[
    SharepopupComponent,
    MovetoComponent,
    PreviewPdfComponent
  ],
  providers: [DocFields]
})
export class SharingModule { }
