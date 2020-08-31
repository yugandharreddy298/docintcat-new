import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import 'hammerjs';
import { FrontEndConfig } from "./frontendConfig"
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { MatButtonModule, MatCheckboxModule, MatListModule, MatChipsModule } from '@angular/material';
import { MatInputModule, MatSelectModule, MatTreeModule, MatTableModule, MatPaginatorModule, MatRadioModule, MatSidenavModule, MatNativeDateModule, MatSortModule, MatMenuModule, MatGridListModule } from '@angular/material'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SignaturePadModule } from '@ng-plus/signature-pad'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { ConfirmEqualValidatorDirective } from './validator';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { TooltipModule } from 'ng2-tooltip-directive';
import { DocumentService } from './document.service';
import { AdminService } from './admin.service'
import { UserService } from './user.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { AnimateOnScrollModule } from 'ng2-animate-on-scroll';
import { ParticleEffectButtonModule } from "angular-particle-effect-button";
import { FileDropModule } from 'ngx-file-drop';
import { DataService } from './core/data.service';
import { SafeHtmlPipe } from './safe-html';
import { PushNotificationsService } from './push-notifications.service';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FileuploadService } from './fileupload.service'
import { ResizableModule } from 'angular-resizable-element';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { MatTabsModule } from '@angular/material/tabs';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { FONT_PICKER_CONFIG } from 'ngx-font-picker';
import { FontPickerModule, FontPickerConfigInterface } from 'ngx-font-picker';
import { ContentEditableFormDirective } from './content-editable-form.directive';
import { OrganizationService } from './organization.service'
import { AvatarModule } from 'ngx-avatar';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { CookieService } from 'ngx-cookie-service';
import { WebcamModule } from 'ngx-webcam';
import { FileSizeModule } from 'ngx-filesize';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { DndModule } from "ngx-drag-drop";
import { DatePipe } from '@angular/common';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { APP_BASE_HREF } from '@angular/common';
import { PublicModule } from './public/public.module';


const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  // your Google API key
  apiKey: 'AIzaSyBF_BmY30XV-xVPpphAoKmRlJQn-ek46uI'
};

export function getBaseHref(): string {
  return window.location.pathname;
}

export const MY_CUSTOM_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD:MM:YYYY hh:mm:ss a',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    AppComponent,
    SafeHtmlPipe,
    ContentEditableFormDirective,
    ConfirmEqualValidatorDirective,
  ],
  imports: [
    PublicModule,
    BrowserModule,
    AppRoutingModule,
    MatChipsModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    HttpClientModule,
    MatInputModule,
    TooltipModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatSliderModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatSortModule,
    MatTreeModule,
    MatListModule, MatMenuModule,
    MatGridListModule,
    DragDropModule,
    MatFormFieldModule,
    MatSidenavModule,
    AnimateOnScrollModule,
    ParticleEffectButtonModule,
    FileDropModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    SignaturePadModule,
    NgbModule,
    ColorPickerModule,
    MDBBootstrapModule.forRoot(),
    NgCircleProgressModule.forRoot({
      "backgroundPadding": 7,
      "radius": 20,
      "space": -2,
      "outerStrokeWidth": 2,
      "outerStrokeColor": "#808080",
      "innerStrokeColor": "#e7e8ea",
      "innerStrokeWidth": 2,
      "clockwise": true,
      "showTitle": false,
      "showSubtitle": false,
      "showUnits": false,
    }),
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    ResizableModule,
    FlexLayoutModule,
    FontPickerModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    PdfViewerModule,
    AvatarModule,
    MatExpansionModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    WebcamModule,
    FileSizeModule,
    NgxIntlTelInputModule,
    DndModule,
    ImageCropperModule,
    AngularDateTimePickerModule
  ],
  providers: [DatePipe, CookieService, FrontEndConfig, { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }, AdminService, DocumentService, UserService, OrganizationService, DataService, PushNotificationsService, FileuploadService, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }, { provide: APP_BASE_HREF, useValue: '/' }, { provide: FONT_PICKER_CONFIG, useValue: DEFAULT_FONT_PICKER_CONFIG }],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule { }