import { NgModule } from '@angular/core';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'ngx-avatar';
import { FileDropModule } from 'ngx-file-drop';
import { FileSizeModule } from 'ngx-filesize';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DndModule } from "ngx-drag-drop";
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ColorPickerModule } from 'ngx-color-picker';
import { WebcamModule } from 'ngx-webcam';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PasswordshowhideDirective } from './passwordshowhide.directive';

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
  declarations: [PasswordshowhideDirective
  ],
  imports: [
    MatChipsModule,
    BsDatepickerModule.forRoot(),
    MatInputModule,
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
    MatFormFieldModule,
    MatSidenavModule,
    MatSnackBarModule,
    SignaturePadModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarModule,
    FileDropModule,
    FileSizeModule,
    DragDropModule,
    DndModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    PdfViewerModule,
    ImageCropperModule,
    ColorPickerModule,
    WebcamModule,
    FlexLayoutModule,

  ],
  exports: [
    BsDatepickerModule,
    MatChipsModule,
    MatInputModule,
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
    MatFormFieldModule,
    MatSidenavModule,
    MatSnackBarModule,
    SignaturePadModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatExpansionModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarModule,
    FileDropModule,
    FileSizeModule,
    DragDropModule,
    DndModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    PdfViewerModule,
    ImageCropperModule,
    ColorPickerModule,
    WebcamModule,
    FlexLayoutModule,
    PasswordshowhideDirective
  ],
  providers: [{ provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] }, { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },],
})
export class sharedModulesModule { }