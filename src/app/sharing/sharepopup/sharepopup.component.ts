
import { Component, OnInit, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DocumentService } from '../../document.service';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { FormControl } from '@angular/forms';
import { VERSION } from '@angular/material';
import { ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as _moment from 'moment';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { GeneralService } from '../../general.service';
import { UserService } from '../../user.service';
import * as _ from 'lodash';
declare var $: any;
const moment = (_moment as any).default ? (_moment as any).default : _moment;
declare var H: any;
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-sharepopup',
  templateUrl: './sharepopup.component.html',
  styleUrls: ['./sharepopup.component.css']
})
export class SharepopupComponent implements OnInit, AfterViewInit {
  version = VERSION;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('userEmail') userEmail: ElementRef<HTMLInputElement>;  // mat input values
  registeredusers: any; // stores the list of all user in db
  access: any; // stores the access whether allowuser or public
  sharedPeople: any; // consists of list of shared people
  visible = true; // mat chips
  selectable = true; // for mat chips to allow select option
  removable = true; // for mat chips to allow remove option
  addOnBlur = true; // for mat chips to allow blur method
  separatorKeysCodes: number[] = [ENTER, COMMA]; // for mat chips to add into an array
  elementctrl = new FormControl(); // for mat chips
  filteredemail: Observable<string[]>; // filtered email for mat chip
  alluseremails: any = []; // consist of list of shared people of logged in user
  shareAccess = []; // stores the list of share access to particular user
  minDate: any;  // setting minutes for extra 30 mins
  userDoc: any;  // consists of current version document
  userDocList: any = []; // consists of list of feilds assigned user in document
  dependencyDocList:any = []; //consists of list of feilds dependency user in document
  users = []; // consist of added user for sharing the document in mat chip
  sharingdoc: any; // consist of the result of the shared document
  addEmailChips = false;
  sharedemails: any;
  isEmail = false;
  emailvalid = false;
  expanded = false;
  filepasswordcheck = true;
  sharepasswordcheck = false;
  emailCheck = false;
  Sharetype: any;
  access_expirydate;
  pin;
  message;
  placeshare;
  testdata;
  accessCode: any = [{ name: 'Download', value: 'Download' },
  { name: 'Comment', value: 'Comment' },
  { name: 'Version Access', value: 'VersionAccess' },
  { name: 'Chat', value: 'Chat' },
  { name: 'Heatmaps', value: 'heatmaps' },
  { name: 'Video Record', value: 'VideoRecord' }];
  latitude: any;
  longitude: any;
  geocoder: any;
  platform: any;
  filepassword: any;
  submitted = false;
  IpAddress;
  fields; // consist fieldvalues
  currentVersionFieldValues;
  userType;
  hide = true;
  hide1 = true;
  PINPattern = new RegExp('^[0-9]{6}$');
  PINDisable = [];
  pinDisable = false;
  passwordtype = 'password';
  passwordIcon = 'fa fa-eye-slash';
  constructor(
    public dialogRef: MatDialogRef<SharepopupComponent>,
    public dialog: MatDialog, private documentService: DocumentService, private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public dailogdata: any, private router: Router,
    private dataservice: DataService, private generalService: GeneralService, private http: HttpClient) {
    this.filteredemail = this.elementctrl.valueChanges.pipe(startWith(null),
      map((x: any | null) => x ? this.filter(x) : this.alluseremails.slice()));
  }

  onNoClick(): void { this.dialogRef.close(false); }

  ngOnInit() {
    $('div.cdk-overlay-container').removeClass('checking');
    if ((this.dailogdata.content.folders && this.dailogdata.content.folders.length > 0) && (this.dailogdata.content.files && this.dailogdata.content.files.length > 0)) {
      const dialogRef = this.dialog.open(CommonDialogComponent,
        {
          data: { title: 'dependency', name: 'dependency', content: 'Share access is applicable only to files and not folders' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
        }
      });
    }
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    const profiledata = JSON.parse(localStorage.getItem('currentUser'));
    if (profiledata) { this.userType = this.userService.decryptData(profiledata.type); }
    if (this.dailogdata.content.isFolder) { this.folderChecking(this.dailogdata.content._id); }
    if (!this.dailogdata.title) { this.Sharetype = 'Review'; }// if title is not present ,sharetype is setted to review
    if (this.dailogdata.title) { this.Sharetype = this.dailogdata.title; } // if title is present ,sharetype is setted to Signature
    this.access = 'Allowusers';
    this.shareAccess.push('Download', 'Comment');   // default share access options
    this.minDate = new Date();
    console.log(this.dailogdata)
    this.getAllUsers();
    if (!this.dailogdata.multi) { this.getSharedPeopleDocs(); }
    if (this.dailogdata.title) { setTimeout(() => { this.getUserDocList(); }, 1000); } else { this.getUserDocList(); }
    ////////////////    Map        ////////////////
    this.platform = new H.service.Platform({
      app_id: 'xeeSniVGFJguQieOyDvg',
      app_code: 'CYXw3RyDsetaa5pSVf3EAw',
      useHTTPS: true
    });
    this.geocoder = this.platform.getGeocodingService();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }, error => {
        this.documentService.openSnackBar('Your Location is Blocked, please Allow for security reasons', 'X');

        // var locationdata = JSON.parse(localStorage.getItem('mylocation'));
        this.latitude = undefined;
        this.longitude = undefined;
      });
    }

    this.IpAddress = JSON.parse(localStorage.getItem('myip'));
    const data = localStorage.getItem('ipaddress');
    if (!this.IpAddress) { this.IpAddress = this.userService.decryptData(data); }
    this.sharedPeopleupdate();
  }
  ngAfterViewInit() {
    this.getdocumentFieldValues();
  }
  /**
   * Function name : getdocumentFieldValues
   * Input:null
   * Output : get current documentField Values
   */
  getdocumentFieldValues() {
    this.documentService.getsharingpeople(this.dailogdata.content).subscribe((data: any) => {
      this.currentVersionFieldValues = data.filter(sharedDoc => sharedDoc.signed);
      if (!this.dailogdata.multi) {
        if (this.currentVersionFieldValues && this.currentVersionFieldValues.length) {
          this.Sharetype = 'Review';
        }
      }
    });
  }
  /**
   * Function name : sharedPeopleupdate
   * Input:null
   * Output : update the data when ever new changes are made in shared people document
   */
  sharedPeopleupdate() {
    this.dataservice.newMessageReceived()
      .subscribe(data => {
        if (data.fileid === this.dailogdata.content._id) {
          this.getSharedPeopleDocs();
          this.getdocumentFieldValues();
        }
      });
  }
  /**
   * Function name : folderChecking
   * Input {Srting}: (folderId) folderId*-selected folder id
   * Output : checking of folder whether folder contain files or not
   */
  folderChecking(folderId) {
    this.documentService.isEmptyfolder(folderId).subscribe((data: any) => {
      if (!data) {
        const dialogRef = this.dialog.open(CommonDialogComponent,
          {
            data: { title: 'dependency', name: 'dependency', content: 'Are you sure?  You want to share empty folder!',folder:true },
            width: '500px', panelClass: 'deletemod', disableClose: false
          });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
          }
          else{
            this.dialogRef.close(false);
          }
        });
      }
    }, error => {
    });
  }

  /**
   * Function name : getAddEmailChips
   * Input:null
   * Output : add emails of already shared user in email search
   */
  getAddEmailChips() {
    if (this.dailogdata.emails) {
      let register;
      this.addEmailChips = true;
      this.dailogdata.emails.forEach(element => {
        element.email = element.email;
        const present = (this.sharedPeople.some(x => x.toemail === element.email));
        if (!present) {
          if (this.registeredusers) { register = (this.registeredusers.find(x => (x.email) === (element.email))); }
          if (register) {
            if (register.type === 'organisation') {
              this.users.push({ email: register.email, _id: register._id, name: register.companyname });
            } else if (register.type === 'individual') {
              this.users.push({ email: register.email, _id: register._id, name: register.name });
            } else { this.users.push({ email: register.email, _id: register._id, name: register.fname + ' ' + register.lname }); }
          } else { this.users.push({ email: element.email, name: element.email }); }
        }
      });
    }
  }

  /**
   * Function name : getUserDocList
   * Input :null
   * Output : selected file current version fields
   */
  getUserDocList() {
    if (!this.dailogdata.multi) {
      this.documentService.getCurrentVersionDocFieldWithValues({
        documentid: this.dailogdata.content._id,
        versionid: this.dailogdata.content.versionid
      }).subscribe(response => {
        this.userDoc = response;
        if (((this.userDoc && this.userDoc.length === 0) || !this.userDoc) && this.Sharetype === 'Signature') {
          this.addFeildsPopUp();
        }
        if (this.userDoc) {
          this.userDoc.forEach(docs => {
            if (docs.people) { if (!this.userDocList.some(x => x === docs.people)) { this.userDocList.push(docs.people); } }
            if (docs.dependency) { if (!this.dependencyDocList.some(x => x === docs.dependency)) { this.dependencyDocList.push(docs.dependency); } }

          });
        }
      });
    }
  }

  /**
   * Function name : getSharedPeopleDocs
   * Input :null
   * Output :gets the shared people of particular document
   */
  getSharedPeopleDocs() {
    this.documentService.getsharingpeople(this.dailogdata.content).subscribe(data => {
      this.sharedPeople = data;
      this.sharedPeople.forEach(element => {
        element.difference = moment(element.created_at).fromNow();
        if (element.toid && element.toid.type && element.toid.type === 'individual') {
          element.name = element.toid.name;
        } else if (element.toid && element.toid.type && element.toid.type === 'organisation') {
          element.name = element.toid.companyname;
        } else if (element.toid && element.toid.type && element.toid.type === 'employee') {
          element.name = element.toid.fname + ' ' + element.toid.lname;
        } else { element.name = element.toemail.split('@')[0]; }
        element.shareAccess = [];
        element.passwordIcon='fa fa-eye-slash';
        element.passwordtype='password';
        if (element.Download) { element.shareAccess.push('Download'); }
        if (element.comment) { element.shareAccess.push('Comment'); }
        if (element.VersionAccess) { element.shareAccess.push('VersionAccess'); }
        if (element.VideoRecord) { element.shareAccess.push('VideoRecord'); }
        if (element.heatmaps) { element.shareAccess.push('heatmaps'); }
        if (element.Chat) { element.shareAccess.push('Chat'); }
        if (element.edit) { element.shareoption = 'Edit'; }
        if (element.view) { element.shareoption = 'View'; }
        if (element.comment) { element.shareoption = 'Comment'; }
        if (element.view) { element.Sharetype = 'Review'; }
        if (element.edit) { element.Sharetype = 'Signature'; }
        if (this.dailogdata.SharedRecordEdit && element._id === this.dailogdata.SharedRecordEdit._id) {
          setTimeout(() => {
            const id = 'icon_cross_' + this.dailogdata.SharedRecordEdit._id;
            document.getElementById(id).click();
            document.getElementById('targetid').click();
          }, 10);
        }
      });
    });
  }

  /**
   * Function name : getSharedPeopleDocs
   * Input :null
   * Output :get the all shared people of user
   */
  getAllSharedPeople() {
    this.documentService.getSharePeopleEmails().subscribe(data => {
      this.sharedemails = data;
      this.getAddEmailChips();
      let shared;
      this.sharedemails.forEach(element => {
        if (this.registeredusers.length > 0) {
          const check = this.registeredusers.find(x => x.email === element.toemail);
          if (check) {
            if (this.alluseremails.length === 0) { this.alluseremails.push({ email: element.toemail, _id: check._id, name: check.name }); }
            if (this.alluseremails.length > 0) {
              shared = (this.alluseremails.some(x => x.email === element.toemail));
              if (!shared) {
                if (check.type === 'organisation') {
                  this.alluseremails.push({ email: element.email, _id: check._id, name: check.companyname });
                } else if (check.type === 'individual') {
                  this.alluseremails.push({ email: check.email, _id: check._id, name: check.name });
                } else { this.alluseremails.push({ email: check.email, _id: check._id, name: check.fname + ' ' + check.lname }); }
              }
            }
          } else {
            if (this.alluseremails.length > 0) {
              shared = (this.alluseremails.some(x => x.email === element.toemail));
              if (!shared) { this.alluseremails.push({ email: element.toemail, name: element.toemail }); }
            }
            if (this.alluseremails.length === 0) { this.alluseremails.push({ email: element.toemail, name: element.toemail }); }
          }
        }
      });
    });
  }

  /**
   * Function name : getAllUsers
   * Input :null
   * Output :get list of all users
   */
  getAllUsers() {
    this.documentService.getSearch('users/getUsers').subscribe(data => {
      this.registeredusers = data;
      this.getAllSharedPeople();
    });
  }

  /**
   * Function name : shareDoc
   * Input{formdata} : (formFeilds) formFeilds*-submitted formdetails
   * Output : validate the form details amd shares the file
   */
  shareDoc = async function (formFeilds) {
    this.submitted = true;
    let notregisterPeople = [];
    await this.users.forEach(element => {
      const register = (this.registeredusers.find(x => (x.email) === (element.email)));
      if (register === undefined && formFeilds.value.access === 'Allowusers') {
        notregisterPeople.push(element.email);
      }
    });
    if (notregisterPeople.length > 0 && !this.emailvalid) {
      const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
        { data: { name: 'notregister', userarray: notregisterPeople }, width: '500px', panelClass: 'deletemod', disableClose: false });
      ConfirmationDiaBox.afterClosed().subscribe(result => {
        this.submitted = false;

        if (result) {
          if (this.Sharetype === 'Review' && !this.dailogdata.multi) { this.Share_for_Review(formFeilds); }
          if (this.Sharetype === 'Signature' && !this.dailogdata.multi) { this.sharing(formFeilds); }
          if (this.Sharetype === 'Review' && this.dailogdata.multi) { this.multi_Share_for_Review(formFeilds); }
        }
      });
    } else {
      if (this.Sharetype === 'Review' && !this.dailogdata.multi) { this.Share_for_Review(formFeilds); }
      if (this.Sharetype === 'Signature' && !this.dailogdata.multi) { this.sharing(formFeilds); }
      if (this.Sharetype === 'Review' && this.dailogdata.multi) { this.multi_Share_for_Review(formFeilds); }
    }


  };

  /**
   * Function name : sharing
   * Input{formdata} : (Shareform) submitted form details
   * Output : share the document in signature mode
   */
  sharing = async function (form) {
    let profileInfo;
    this.sharepasswordcheck = false;
    if (this.pin) { if (!this.filepassword || this.filepassword.length<6) { this.sharepasswordcheck = true; } }
    // check user exists or not
    if (this.users.length > 0) {
      // password field check
      if (!this.sharepasswordcheck) {
        // check for versionid present or not
        if (this.dailogdata.content.versionid) {
          this.documentService.getCurrentVersionDocFieldOptions({
            documentid: this.dailogdata.content._id,
            versionid: this.dailogdata.content.versionid
          }).subscribe(currentVersionDocFieldOptions => {
            this.currentVersionDocFieldOptionsResult = currentVersionDocFieldOptions;
            // ======================//if versionid //======================================================================//
            if (this.currentVersionDocFieldOptionsResult && this.currentVersionDocFieldOptionsResult.fields.length) {
              this.fields = this.currentVersionDocFieldOptionsResult.fields;
              form.value.title = this.Sharetype;
              form.value.access = this.access;
              if (form.value.shareAccess) {
                form.value.shareAccess.forEach(element => {
                  if (element) { form.value[element] = true; }
                });
              }
              if (this.filepassword) { form.value.filepassword = this.filepassword; }
              form.value.user = this.users;
              this.formSubmitted = true;
              if (this.dailogdata.content.isFile) {
                form.value.fileid = this.dailogdata.content;
                form.value.fileencryptedid = this.dailogdata.content.encryptedid;
              } else { form.value.folderid = this.dailogdata.content; }
              if (this.users.length > 0 && !this.emailvalid) {
                this.isEmail = false;
                this.formSubmitted = false;
                this.dailogdata.content.isSent = true;
                this.documentService.updatefolder(this.dailogdata.content).subscribe(data => { });
                form.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
                this.documentService.sharing(form.value).subscribe(data => {
                  this.sharingdoc = data;
                  this.submitted = false;
                  this.dialogRef.close(data);
                  this.documentService.openSnackBar('Shared Successfully', 'X');
                  this.documentService.getsharingpeople(this.dailogdata.content).subscribe(data => {
                    if (data[0].fileid.status === 'Waiting for Sign'
                      || data[0].fileid.status === 'Review' || data[0].fileid.status === 'upload') {
                      data[0].fileid.status = 'Waiting for Sign';
                    } else if (data[0].fileid.status === 'Partially completed' || data[0].fileid.status === 'Completed') {
                      data[0].fileid.status = 'Partially completed';
                    }
                    this.documentService.updatefolder(data[0].fileid).subscribe(updatedData => { });
                  });
                  // create notification
                  profileInfo = JSON.parse(localStorage.getItem('currentUser'));
                  if (profileInfo) { var fromemail = this.userService.decryptData(profileInfo.email); }
                  this.sharingdoc.forEach(element => {
                    const result = {
                      fromid: element.fromid,
                      fromemail: fromemail,
                      toid: element.toid ? element.toid : null,
                      toemail: element.toemail,
                      sharingPeopleId: element._id,
                      documentid: element.fileid,
                      type: 'Shared',
                    };
                    if (element.toemail) {
                      this.generalService.createnotification(result).subscribe(response => {
                      });
                    }
                    if (element.toid) { var toid = element.toid; }
                    // create mouse
                    const mousedata = {
                      uid: element.fromid,
                      documentid: element.fileid,
                      folderid: element.folderid,
                      message: 'Shared',
                      toemail: element.toemail,
                      toid: toid,
                      email: element.fromid ? element.fromid.email : undefined,
                      isFile: true,
                      latitude: this.latitude,
                      longitude: this.longitude,
                      IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' '
                    };
                    this.documentService.savemousemovement(mousedata).subscribe(dataResult => { });
                  });
                });
              } else {
                setTimeout(() => {
                  this.emailvalid = true;
                  this.submitted = false;
                  if (this.users.length > 0 && this.addEmailChips) {
                    this.submitted = true;
                    this.emailvalid = false;
                    this.isEmail = false;
                    this.formSubmitted = false;
                    this.dailogdata.content.isSent = true;
                    this.documentService.updatefolder(this.dailogdata.content).subscribe(data => { });
                    form.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
                    this.documentService.sharing(form.value).subscribe(data => {
                      this.dialogRef.close(data);
                      this.documentService.openSnackBar('Shared Successfully', 'X');
                      this.submitted = false;
                      this.documentService.getsharingpeople(this.dailogdata.content).subscribe(data => {
                        if (data[0].fileid.status === 'Waiting for Sign'
                          || data[0].fileid.status === 'Review' || data[0].fileid.status === 'upload') {
                          data[0].fileid.status = 'Waiting for Sign';
                        } else if (data[0].fileid.status === 'Partially completed' || data[0].fileid.status === 'Completed') {
                          data[0].fileid.status = 'Partially completed';
                        }
                        this.documentService.updatefolder(data[0].fileid).subscribe(updatedData => { });
                      });
                      this.sharingdoc = data;
                      // create notification
                      profileInfo = JSON.parse(localStorage.getItem('currentUser'));
                      if (profileInfo) { var fromemail = this.userService.decryptData(profileInfo.email); }
                      this.sharingdoc.forEach(element => {
                        const result = {
                          fromid: element.fromid,
                          fromemail: fromemail,
                          toid: element.toid,
                          sharingPeopleId: element._id,
                          documentid: element.fileid,
                          type: 'Shared',
                        };
                        if (element.toid) { this.generalService.createnotification(result).subscribe(response => { }); }
                        if (element.toid) { var toid = element.toid; }
                        // create mouse movement
                        const mousedata = {
                          uid: element.fromid,
                          documentid: element.fileid,
                          folderid: element.folderid,
                          message: 'Shared',
                          toemail: element.toemail,
                          toid: toid,
                          email: element.fromid ? element.fromid.email : undefined,
                          isFile: true,
                          latitude: this.latitude,
                          longitude: this.longitude,
                          IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' '
                        };
                        this.documentService.savemousemovement(mousedata).subscribe(dataResult => { });
                      });
                    });
                  }
                }, 1000);

              }
            } else {
              this.submitted = false;
              const filedata = {
                fileid: this.dailogdata.content._id
              };
              this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
                if (this.userType === 'individual') {
                  this.router.navigate(['individual/filecont/' + data.encryptdata]);
                } else if (this.userType === 'organisation' || this.userType === 'employee') {
                  this.router.navigate(['organization/filecont/' + data.encryptdata]);
                }

                this.documentService.openSnackBar('add fields in document', 'X');
                this.dialogRef.close(false);
              });
            }
          });
        } else {
          const filedata = {
            fileid: this.dailogdata.content._id
          };
          this.submitted = false;
          this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
            if (this.userType === 'individual') {
              this.router.navigate(['individual/filecont/' + data.encryptdata]);
            } else if (this.userType === 'organisation' || this.userType === 'employee') {
              this.router.navigate(['organization/filecont/' + data.encryptdata]);
            }
            this.dialogRef.close(false);
          });
        }
      } else { this.submitted = false; }
    } else { this.emailvalid = true; this.submitted = false; }
  };

  // Email autoselecte filter
  displayFn(user?: User): string | undefined {
    return user ? user.email : undefined;
  }

  // filer for matchips
  filter(value: any): any[] {
    return this.alluseremails.filter(x => x.email && x.email.toLowerCase().includes(value.toLowerCase()));
  }

  /**
   * Function name : savechanges
   * Input{formdata} : (shareEditForm) shareEditForm*-submitted form details or particular shared user details
   * Output : update the already sharedpeople access
   */
  savechanges = async function (shareEditForm) {
    let status;
    if (this.testdata) {
      shareEditForm.revoke = this.testdata;
    }
    if (shareEditForm.Sharetype) { shareEditForm.title = shareEditForm.Sharetype; }
    this.accessCode.forEach(code => {
      if (shareEditForm.shareAccess.some(x => x === code.value)) {
        shareEditForm[code.value] = true;
      } else { shareEditForm[code.value] = false; }
    });
    if (shareEditForm.pin) {
      if (shareEditForm.filepassword === undefined || shareEditForm.filepassword === '' || shareEditForm.filepassword.length<6) {
        shareEditForm.passwordcheck = true;
        this.filepasswordcheck = false;
      } else { shareEditForm.passwordcheck = false; }
    } else { shareEditForm.filepassword = undefined; }
    if (!shareEditForm.passwordcheck) {
      this.documentService.sharingupdate(shareEditForm).subscribe(async (updateddat) => {
        shareEditForm.revokeStatus = null;
        this.documentService.openSnackBar('Changes are updated', 'X');
        await this.getSharedPeopleDocs();
        if (!(shareEditForm.signed && shareEditForm.reviewed)) {
          this.documentService.getSharedDoc(shareEditForm._id).subscribe(async (data: any) => {
            if (data.view || !data.view) {
              let filledFieldCount = 0;
              let reviewedPeoples;
              let signedPeoples;
              let shareForReviews = [];
              let shareForSignatures = [];
              shareForSignatures = this.sharedPeople.filter(element => !element.view);
              shareForReviews = this.sharedPeople.filter(element => element.view);
              signedPeoples = this.sharedPeople.filter(element => (element.signed && !element.view));
              reviewedPeoples = this.sharedPeople.filter(element => (element.reviewed && element.view));
              if (this.sharedPeople.length && this.userDoc.length) {
                if (this.sharedPeople.length === 1 && !reviewedPeoples.length && !signedPeoples.length) {
                  status = 'Waiting for Sign';
                } else if ((signedPeoples.length === shareForSignatures.length && reviewedPeoples.length === shareForReviews.length)) {
                  status = 'Completed';
                } else {
                  await this.userDoc.forEach((field) => {
                    if (field.insertedemail) {
                      if (field.value || field.signatureId || field.stampId || field.photoId) {
                        filledFieldCount++;
                      }
                    }
                  });
                  const fieldsExceptLabel = this.userDoc.filter(field => field.type !== 'label');
                  if (fieldsExceptLabel.length === filledFieldCount &&
                    (signedPeoples.length === shareForSignatures.length && reviewedPeoples.length === shareForReviews.length)) {
                    status = 'Completed';
                  } else if ((reviewedPeoples.length > 0 || signedPeoples.length > 0)) {
                    status = 'Partially completed';
                  } else if (!reviewedPeoples.length && !signedPeoples.length) {
                    if (shareEditForm.Sharetype === 'Signature') {
                      status = 'Waiting for Sign';
                    } else if (shareEditForm.Sharetype === 'Review') { status = 'Review'; }
                  }

                }
              }
              this.documentService.updatefolder({ _id: shareEditForm.fileid._id, status: status }).subscribe(updatedData => { });
            }
          });
        }
      });
    }
  };

  /**
   * Function name : RemoveShareduser
   * Input{object} : (doc)  doc*-selected employee data
   * Output : Remove selected employee from shared users
   */
  RemoveShareduser(doc) {
    let deleteDoc = true;
    let dependDoc=false
    if (this.userDocList.some(x => x === doc.toemail)) { deleteDoc = false; }
    if (this.dependencyDocList.some(x => x === doc.toemail)) { dependDoc = true; }
    if(dependDoc){
      const dialogRef22 = this.dialog.open(CommonDialogComponent,
        {
          data: { name: 'fields', cancel: false, content: doc.name + ' have dependency with field(s), to check with field(s), click below ' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef22.afterClosed().subscribe(res1 => {
        var field = this.userDoc.find(x => x.dependency == doc.toemail)
        const filedata = {
          fileid: this.dailogdata.content._id,
          sharedid: field.id
        };

        var originUrl = this.router.url.split('/');
        if (originUrl[3] == 'myfiles') {
          this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
            if (res1) {
              this.dialogRef.close(false);
              if (this.userType === 'individual') {
                this.router.navigate(['individual/filecont/' + data.sharedid + '/' + data.fileid]);
              } else if (this.userType === 'organisation' || this.userType === 'employee') {
                this.router.navigate(['organization/filecont/' + data.sharedid + '/' + data.fileid]);
              }
            }
          }) 
        }
        else {
        this.dialogRef.close({type: 'dependency', field: field.id });
        }
     });
    
    }
    else if(!deleteDoc && !doc.revoke) {
      const dialogRef22 = this.dialog.open(CommonDialogComponent,
        {
          data: { name: 'fields', cancel: false, content: doc.name + ' has assigned with field, you can\'t delete it.' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef22.afterClosed().subscribe(res1 => {
        dialogRef22.close();
      });
    }
    else {
      const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
        { data: { name: 'delete1' }, width: '500px', panelClass: 'deletemod', disableClose: false });
      ConfirmationDiaBox.afterClosed().subscribe(result => {
        let docData = {};
        if (result) {
          this.sharedPeople.splice(this.sharedPeople.indexOf(doc), 1);
          let completedEmails = this.sharedPeople.filter(email =>
            ((email.signed && email.reviewed) || (email.signed && !email.view) || (email.reviewed && email.view)));
          if (this.sharedPeople.length === 0) {
            docData = { _id: this.dailogdata.content._id, status: 'upload' };
          } else if (completedEmails.length === this.sharedPeople.length) {
            docData = { _id: this.dailogdata.content._id, status: 'Completed' };
          } else if (completedEmails.length !== 0 && completedEmails.length < this.sharedPeople.length) {
            docData = { _id: this.dailogdata.content._id, status: 'Partially completed' };
          } else if (completedEmails.length === 0) {
            docData = { _id: this.dailogdata.content._id, status: 'Waiting for Sign' };
          }
          if (this.dailogdata.isFolder) {
            docData['isFolder'] = true;
          } else {
            docData['isFolder'] = false;
          }
          this.documentService.RemoveShareduser(doc).subscribe(data => {
            this.expanded = false;
            this.documentService.openSnackBar('Shared email removed the access on document', 'X');
            this.documentService.updatefolder(docData).subscribe(resp => {
            });
          });
        }
      });
    } 
     
  }

  /**
   * Function name : add
   * Input{event} : (event)  event*-MatChipInputEvent
   * Output : mat chip adding email address
   */
  add(event: MatChipInputEvent): void {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/);
    const input = event.input;
    const value = event.value;
    this.emailvalid = false;
    if ((value || '').trim()) {
      if (event.value) {
        console.log(event.value)
        if (!(regexp.test(event.value))) { 
          this.emailvalid = true; }
           else {
          this.emailvalid = false;
          let present = (this.users.some(element => element.email === event.value));  // to check already exists in array
          if (!this.dailogdata.multi) {
            if (!present) { present = (this.sharedPeople.some(element => element.toemail === event.value)); }
            if (!present) {
              this.isEmail = false;
              const register = (this.registeredusers.find(element => element.email === event.value)); // checking registered user or not
              if (register !== undefined) {
                if (register.type === 'organisation') {
                  this.users.push({ name: register.companyname, email: register.email, _id: register._id });
                } else if (register.type === 'individual') {
                  this.users.push({ name: register.name, email: register.email, _id: register._id });
                } else { this.users.push({ name: register.fname + ' ' + register.lname, email: register.email, _id: register._id }); }
              } else {
                this.users.push({ name: event.value, email: event.value });
              }
            }
          } else {
            if (!present) {
              this.isEmail = false;
              const register = (this.registeredusers.find(element => element.email === event.value)); // checking registered user or not
              if (register !== undefined) {
                if (register.type === 'organisation') {
                  this.users.push({ name: register.companyname, email: register.email, _id: register._id });
                } else if (register.type === 'individual') {
                  this.users.push({ name: register.name, email: register.email, _id: register._id });
                } else {
                  this.users.push({ name: register.fname + ' ' + register.lname, email: register.email, _id: register._id });
                }
              } else {
                this.users.push({ name: event.value, email: event.value });
              }
            }
          }
          // Reset the input value
          if (input) { input.value = ''; }
          this.elementctrl.setValue(null);
        }
      }
      console.log(this.users)
    }
  }

  // mat chip removing email address
  remove(email, indx): void {
    if( !this.userDoc.some(field => field.dependency === email.email || (field.people === email.email && field.required))){
      this.users.splice(indx, 1);
    }
    else{
      if(this.userDoc.some(field => field.dependency === email.email )) this.documentService.openSnackBar('User have dependency','x') 
      else if(this.userDoc.some(field => (field.people === email.email && field.required))) this.documentService.openSnackBar('User assigned with field','x')
    }

  }

  /**
   * Function name : selected
   * Input{event} : (event)  event*-MatAutocompleteSelectedEvent
   * Output : add email address in mat chips by MatAutocompleteSelectedEvent
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    const viewValue = event.option.viewValue.split(/[<,>]+/);
    let present;
    this.emailvalid=false
    if (!this.dailogdata.multi) {

      const shared = (this.sharedPeople.some(element => element.toemail === viewValue[1]));
      if (!shared) {
        present = (this.users.some(element => element.email === viewValue[1]));
        const oldpresent = (this.sharedPeople.some(element => element.toemail === viewValue[1]));
        if (!present && !oldpresent) {
          this.isEmail = false;
          this.users.push({ name: viewValue[0], email: viewValue[1], _id: event.option.value });
          this.emailvalid = false;
        }
        if (oldpresent) {
          this.emailvalid = false;
          this.documentService.openSnackBar('Already document has been shared', 'X');
        }
      }
      if (shared) {
        this.expanded = true;
        this.emailvalid = false;
        this.documentService.openSnackBar('Already document has been shared', 'X');
      }
    } else {
      this.emailvalid = false;
      present = (this.users.some(element => element.email === viewValue[1]));
      if(!present){
        this.emailvalid = false;
        this.users.push({ name: viewValue[0], email: viewValue[1], _id: event.option.value });

      }
    }
    this.userEmail.nativeElement.value = '';
    this.elementctrl.setValue(null);
  }

  /**
   * Function name : Share_for_Review
   * Input{formdata} : (Shareform) Shareform*-submitted formdetails
   * Output : share the file in review mode
   */

  Share_for_Review = function (form) {
    let profileInfo;
    this.sharepasswordcheck = false;
    form.value.title = this.Sharetype;
    form.value.user = this.users;
    form.value.access = this.access;
    this.emailvalid = false;
    if (form.value.shareAccess) {
      form.value.shareAccess.forEach(element => {
        if (element) { form.value[element] = true; }
      });
    }
    this.formSubmitted = true;
    if (this.dailogdata.content.isFile) {
      form.value.fileid = this.dailogdata.content;
      form.value.fileencryptedid = this.dailogdata.content.encryptedid;
    } else { form.value.folderid = this.dailogdata.content; }
    if (form.value.access_expirydate) { form.value.access_expirydate = this.access_expirydate; }
    if (this.pin) { if (!this.filepassword) { this.sharepasswordcheck = true; } }
    if (this.filepassword) { form.value.filepassword = this.filepassword; }
    if (this.users.length > 0) {
      if (this.sharepasswordcheck === false) {
        this.isEmail = false;
        this.dailogdata.content.isSent = true;
        this.documentService.updatefolder(this.dailogdata.content).subscribe(data => { });
        form.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
        this.documentService.sharing(form.value).subscribe(data => {
          this.submitted = false;
          this.sharingdoc = data;
          this.dialogRef.close(data);
          this.documentService.openSnackBar('Shared Successfully', 'X');
          this.documentService.getsharingpeople(this.dailogdata.content).subscribe(data => {
            if (data[0].fileid) {
              if (data[0].fileid.status === 'Waiting for Sign'
                || data[0].fileid.status === 'Review' || data[0].fileid.status === 'upload') {
                data[0].fileid.status = 'Review';
              } else if (data[0].fileid.status === 'Partially completed' || data[0].fileid.status === 'Completed') {
                data[0].fileid.status = 'Partially completed';
              }
              this.documentService.updatefolder(data[0].fileid).subscribe(updatedData => { });
            }
          });
          // create notification
          profileInfo = JSON.parse(localStorage.getItem('currentUser'));
          if (profileInfo) { var fromemail = this.userService.decryptData(profileInfo.email); }
          this.sharingdoc.forEach(element => {
            const result = {
              fromid: element.fromid,
              fromemail: fromemail,
              toid: element.toid,
              sharingPeopleId: element._id,
              documentid: element.fileid,
              folderid: element.folderid,
              type: 'Shared'
            };
            if (element.toid) { this.generalService.createnotification(result).subscribe(response => { }); }
            if (element.toid) { var toid = element.toid; }
            // create mouse movement
            const mousedata = {
              uid: element.fromid,
              documentid: element.fileid,
              folderid: element.folderid,
              message: 'Shared',
              toid: toid,
              toemail: element.toemail,
              email: element.fromid ? element.fromid.email : undefined,
              isFile: element.fileid ? true : undefined,
              isFolder: element.folderid ? true : undefined,
              latitude: this.latitude,
              longitude: this.longitude,
              IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' '
            };
            this.documentService.savemousemovement(mousedata).subscribe(resultData => { });
          });
        });
      } else { this.submitted = false; }
    } else {
      this.submitted = false;
      this.emailvalid = true;
    }
  };

  /**
   * Function name : multi_Share_for_Review
   * Input{formdata} : (Shareform) Shareform*-submitted formdetails
   * Output : share multiple files in review mode
   */
  multi_Share_for_Review(form) {
    let profileInfo;
      this.sharepasswordcheck = false;
      form.value.title = this.Sharetype;
      form.value.user = this.users;
      form.value.access = this.access;
      form.value.file = this.dailogdata.content.files;
      form.value.folder = this.dailogdata.content.folders;
      this.emailvalid = false;
      if (form.value.shareAccess) {
        form.value.shareAccess.forEach(element => {
          if (element ) { form.value[element] = true; }
        });
      }
      
      if (form.value.access_expirydate) { form.value.access_expirydate = this.access_expirydate; }
      if (this.pin) { if (!this.filepassword) { this.sharepasswordcheck = true; this.submitted = false; } }
      if (this.filepassword) { form.value.filepassword = this.filepassword; }
      if (this.users.length > 0) {
        if (this.sharepasswordcheck === false) {
          this.isEmail = false;
          form.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
          this.documentService.multisharing(form.value).subscribe(data => {
            this.submitted = false;
            this.sharingdoc = data;
            this.dialogRef.close(data);
            this.documentService.openSnackBar('Shared Successfully', 'X');
            // create notification
            profileInfo = JSON.parse(localStorage.getItem('currentUser'));
            if (profileInfo) { var fromemail = this.userService.decryptData(profileInfo.email); }
            this.sharingdoc.forEach(element => {
              const result = {
                fromid: element.fromid,
                fromemail: fromemail,
                toid: element.toid,
                sharingPeopleId: element._id,
                documentid: element.fileid,
                folderid: element.folderid,
                type: 'Shared'
              };
              if (element.toid) { this.generalService.createnotification(result).subscribe(response => { }); }
              if (element.toid) { var toid = element.toid; }
              // create mouse movement
              const mousedata = {
                uid: element.fromid,
                documentid: element.fileid,
                folderid: element.folderid,
                message: 'Shared',
                toid: toid,
                toemail: element.toemail,
                email: element.fromid ? element.fromid.email : undefined,
                isFile: element.fileid ? true : undefined,
                isFolder: element.folderid ? true : undefined,
                latitude: this.latitude,
                longitude: this.longitude,
                IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' '
              };
              this.documentService.savemousemovement(mousedata).subscribe(resultData => { });
            });
          });
        }
      } else {
        this.submitted = false;
        this.emailvalid = true;
      }
    
  }
  

  /**
   * Function name : Radiochange
   * Input{string} :(Sharetype) Sharetype*-sharing type 'Review' or 'signature'
   * Output : update the radio button value to the  departments
   */
  Radiochange(Sharetype) {
    if (Sharetype === 'Review') { this.dailogdata.title = 'Review'; }
    if (Sharetype === 'Signature') {
      if (this.currentVersionFieldValues && this.currentVersionFieldValues.length) {
        this.Sharetype = 'Review';
        this.dailogdata.title = 'Review';
      } else {
        this.dailogdata.title = 'Signature';
      }
      setTimeout(() => {
        if ((this.userDoc && this.userDoc.length === 0) || !this.userDoc) { this.addFeildsPopUp(); }
      }, 1000);

    }
  }
  /**
   * Function name : shareRadioChange
   * Input{object,string} :((info, title)info*-selected employee
   *                                    title*-sharing type 'Review' or 'signature'
   * Output : update the radio button value to the  employee
   */
  shareRadioChange(info, title) {
    if (title === 'Signature') {
      if (this.currentVersionFieldValues && this.currentVersionFieldValues.length && (info.view)) {
        const dialogRef = this.dialog.open(CommonDialogComponent,
          {
            data: { title: 'dependency', name: 'dependency', content: 'The Document is already authorized' },
            width: '500px', panelClass: 'deletemod', disableClose: false
          });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            info.Sharetype = 'Review';
          }
        });
      }
      setTimeout(() => {
        if ((this.userDoc && this.userDoc.length === 0) || !this.userDoc) { this.addShareFeildsPopUp(info); }
      }, 10);
    }
  }

  /**
   * Function name : addFeildsPopUp
   * Input:null
   * Output : open popup to add fields if shae mode is in signature and fields are null
   */
  addFeildsPopUp() {
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
    dialogRef.afterClosed().subscribe(res => {
      const filedata = {
        fileid: this.dailogdata.content._id
      };
      this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
        if (res) {
          this.dialogRef.close(false); if (this.userType === 'individual') {
            this.router.navigate(['individual/filecont/' + data.encryptdata]);
          } else if (this.userType === 'organisation' || this.userType === 'employee') {
            this.router.navigate(['organization/filecont/' + data.encryptdata]);
          }
        } else { this.Sharetype = 'Review'; this.dailogdata.title = 'Review'; }

      });
    });
  }
  /**
   * Function name : addShareFeildsPopUp
   * Input{object}:(i) i*-selected employee details
   * Output :  to check the document has fields or not while changing mode for shared people
   */
  addShareFeildsPopUp(i) {
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents in Signature mode' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
    dialogRef.afterClosed().subscribe(res => {
      const filedata = {
        fileid: this.dailogdata.content._id
      };
      this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
        if (res) {
          this.dialogRef.close(false);
          if (this.userType === 'individual') {
            this.router.navigate(['individual/filecont/' + data.encryptdata]);
          } else if (this.userType === 'organisation' || this.userType === 'employee') {
            this.router.navigate(['organization/filecont/' + data.encryptdata]);
          }
        } else { i.Sharetype = 'Review'; }
      });

    });
  }
  /**
   * Function name : revokeFun
   * Input{object} : (i)  i*-selected employee details
   * Output : update the revoke status of selected employee
   */
  revokeFun(i) {
    let revokeStatus;
    if (i.revoke) {
      revokeStatus = 'Un Revoke';
    } else {
      revokeStatus = 'Revoke';
    }
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'fields', cancel: true, content: 'Are you sure want to ' + revokeStatus + ' the Sharing' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) { 
      i.revokeStatus = revokeStatus;
        i.revoke = !i.revoke;
       }
    });

  }

  /**
   * Function name : getDocPassword
   * Input{object}:(data) data*-selected document details
   * Output : get decrypted password
   */
  getDocPassword(data) {
    data.title = 'getpassword';
    this.documentService
      .getSearch('sharingpeoples/checkpassword/' + data._id + '/' + data.filepassword + '/' + data.title)
      .subscribe((passworddata: any) => {
        data.filepassword = passworddata.password;
      });
  }

  // To Validate entered PIN for Shared records
  modelChanged(event, index) {
    if (!this.PINPattern.test(event.trim())) {
      this.PINDisable[index] = true;
    } else {
      this.PINDisable[index] = false;
    }
  }

  // To Validate entered PIN for Sharing records
  ModelChange(event) {
    if (!this.PINPattern.test(event.trim())) {
      this.pinDisable = true;
    } else {
      this.pinDisable = false;
    }
  }

  //Radio button change detection
  RadioButtonchange(){
    if(this.pin) {
      this.pinDisable = true;
    } else {
      this.pinDisable = false;
    }
  }
  /**
   * Function name : hideShowPassword
   * Input :null
   * Output :Password show hide 
   */
  hideShowPassword() {
    if (this.passwordtype == 'password') {
      this.passwordtype = 'text';
      this.passwordIcon = 'fa fa-eye';
    }
    else {
      this.passwordtype = 'password';
      this.passwordIcon = 'fa fa-eye-slash';
    }
  }
  /**
   * Function name : hideShowPasswordUpdate
   * Input :Shared document
   * Output :Password show hide for particular shared document
   */
    hideShowPasswordUpdate(element)
    {
      if (element.passwordtype == 'password') {
        element.passwordtype = 'text';
        element.passwordIcon = 'fa fa-eye';
      }
      else {
        element.passwordtype = 'password';
        element.passwordIcon = 'fa fa-eye-slash';
      }
    }
    /*
    Input : entered text
    Output : type number will be output
  */
  // ---------------function called for allowing
  // input type only as number ---------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}

export interface User {
  email: string;
  _id: string;
  shareoption: string;
}

export interface DialogData {
  title: string;
  content: string;
}
