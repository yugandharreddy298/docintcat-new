import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../../user.service';
import { OrganizationService } from '../../organization.service';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DocumentService } from '../../document.service';
import { Observable } from 'rxjs';
import { MatAutocomplete } from '@angular/material';
import { ViewChild, ElementRef } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as _moment from 'moment';
import * as _ from 'lodash';
import { SharepopupComponent } from '../../sharing/sharepopup/sharepopup.component';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { Router } from '@angular/router';
import { GeneralService } from '../../general.service';
import { Overlay } from '@angular/cdk/overlay';
declare var $: any;
const moment = (_moment as any).default ? (_moment as any).default : _moment;
declare var H: any;
@Component({
  selector: 'app-organization-file-sharing',
  templateUrl: './organization-file-sharing.component.html',
  styleUrls: ['./organization-file-sharing.component.css']
})
export class OrganizationFileSharingComponent implements OnInit {
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('fruitInput') fruitInput: ElementRef;
  @ViewChild('mySelect') mySelect;
  stateGroups: any = [];
  organisation = false;
  individual = false;
  selectall = true;
  hlevelad: boolean;
  individualclick: boolean;
  organisationclick: boolean;
  departments = [];
  departmentlevels = [];
  employees: any;
  updatedepartment = false; // For open the depatment edit
  employees1: any;
  employeevalues = [];
  employeedata: any = [];
  employeedata1: any = [];
  access = 'Allowusers';
  shareoption = 'View';
  sharedwith: any;
  allDepartments: any;
  SharedDepartments = [];
  Sharedpeople: any;
  user: any;
  hlevel: any;
  dept: any;
  filteredemail: Observable<any[]>;
  elementctrl = new FormControl();
  alluseremails: any = [];
  useremail: any = [];
  employeeemail: any = [];
  accessexpiry;
  shareAccess = []; // stores the list of share access to particular user
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  selected1;
  userDoc: any;  // consists of current version document
  currentVersionDocFieldOptionsResult;
  filteredvalue: any[] = [];
  pen = true;
  showselection = false;
  sharedata: any;
  fields: any;
  isloading = false; // For loading purpose
  title: any;
  Sharetype: any;
  latitude: any;
  longitude: any;
  geocoder: any;
  platform: any;
  sharingdoc: any;
  userDocList: any = []; // consists of list of feilds assigned user in document
  IpAddress;
  minDate;
  sharingpeople;
  currentVersionFieldValues;
  sharedemails;
  EnterFirstTime = false; // For open the email edit at one time when came from edit icon from the right side of the agreementcopy
  departmenthierarchy = [];
  selectdept = [];
  dependencyDocList:any = []; //consists of list of feilds dependency user in document
  accesmodeList: any = [{ name: 'Download', value: 'Download' },
  { name: 'Comment', value: 'Comment' },
  { name: 'Version Access', value: 'VersionAccess' },
  { name: 'Chat', value: 'Chat' },
  { name: 'Heatmaps', value: 'heatmaps' },
  { name: 'Video Record', value: 'VideoRecord' }];
  submitted = false;
  hide = true;
  hide1 = true;
  hide2 = true;
  hide3 = true;
  PINPattern = new RegExp('^[0-9]{6}$');
  pinDisable = false;
  PINDisable = [];
  SharedPINDisable = [];
  passwordtype = 'password';
  passwordIcon = 'fa fa-eye-slash';
  userType :any
  constructor(
    private router: Router,
    private userservice: UserService,
    private dialog: MatDialog,
    private documentservice: DocumentService,
    private organizationService: OrganizationService,
    public dialogRef: MatDialogRef<OrganizationFileSharingComponent>,
    @Inject(MAT_DIALOG_DATA) public dailogdata: any,
    private generalService: GeneralService, private overlay: Overlay) { }

  /**
   * Function name : selectTypeIndividual
   * Input : null
   * Output : navigate to sharepop
   */
  selectTypeIndividual() {
    this.dialogRef.close('true');
    setTimeout(() => {
      $('body').css('overflow', 'hidden');
    }, 100);
    const dialogRef = this.dialog.open(SharepopupComponent, {
      width: '848px',
      disableClose: false,
      autoFocus: false,
      panelClass: 'orgn',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      data: this.dailogdata
    });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');
      }, 10);
    });
  }

  /**
   * Function name : selectTypeOrganization
   * Input : null
   * Output : Organisation sharepop is selected
   */
  selectTypeOrganization() {
    this.title = 'Organisation';
    if ((this.dailogdata.content.folders && this.dailogdata.content.folders.length > 0) && (this.dailogdata.content.files && this.dailogdata.content.files.length > 0)) {
      const dialogRef = this.dialog.open(CommonDialogComponent,
        {
          data: { title: 'dependency', name: 'dependency', content: 'Share access is applicable only to files and not folders' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          // this.multi_share_file_folder(Shareform)
        }
        else{
          this.submitted = false
        }
      });
    }
    this.getorgnisationrecords();
    if (this.dailogdata.content.isFolder) { this.folderChecking(this.dailogdata.content._id); }
  }
  ngOnInit() {
    this.isloading = true;
   
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.minDate = new Date();
    const profiledata = JSON.parse(localStorage.getItem('currentUser'));
    if (profiledata) { this.userType = this.userservice.decryptData(profiledata.type); }
    if (this.dailogdata.SharedRecordEdit) { // For editing the organization shared emails
      this.selectTypeOrganization();
    }
    this.shareAccess.push('Download', 'Comment');   // default share access options
    if (!this.dailogdata.title) { this.Sharetype = 'Review'; }// if title is not present ,sharetype is setted to review
    if (this.dailogdata.title) { this.Sharetype = this.dailogdata.title; } // if title is present ,sharetype is setted to Signature
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
        this.documentservice.openSnackBar('Your Location is Blocked please Allow for security reasons', 'X');
        this.latitude = undefined;
        this.longitude = undefined;
      });
    }
    this.IpAddress = JSON.parse(localStorage.getItem('myip'));
    const data = localStorage.getItem('ipaddress');
    if (!this.IpAddress) { this.IpAddress = this.userservice.decryptData(data); }
  }

  /**
   * Function name : getorgnisationrecords
   * Input : null
   * Output : load  datas regarding Organisation
   */
  getorgnisationrecords() {
    this.getAllDepartments();
    if (this.dailogdata.title) {
      setTimeout(() => { this.getUserDocList(); }, 100);
    } else { this.getUserDocList(); }
  }

  /**
   * Function name : getAllDepartments
   * Input : null
   * Output : Retrive all departments of the organisation
   */
  getAllDepartments() {
    this.organizationService.getDepartments().subscribe(data => {
      this.allDepartments = data;
      if (this.dailogdata.multi) {
        this.departments = this.allDepartments;
        this.isloading = false;
      } else {
        const depart = { allDepartmentss: this.allDepartments, document: this.dailogdata.content };
        this.getSharedDepartment(depart);
      }
    });
  }

  /**
   * Function name : folderChecking
   * Input {Srting}: (folderId) folderId*-selected folder id
   * Output : checking of folder whether folder contain files or not
   */
  folderChecking(folderId) {
    this.documentservice.isEmptyfolder(folderId).subscribe((data: any) => {
      if (!data) {
        const dialogRef = this.dialog.open(CommonDialogComponent,
          {
            data: { title: 'dependency', name: 'dependency', content: 'Are you sure?  You want to share empty folder!' ,folder:true},
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
   * Function name : getSharedDepartment
   * Input{json} : (depart) depart*-contains all department and file data
   * Output : gets already shared department and employee details
   */
  getSharedDepartment(depart) {
    let found;
    this.organizationService.SharedWith_Departments(depart).subscribe(data => {
      this.sharedwith = data;
      this.isloading = false;
      const depIds = [];
      this.allDepartments.forEach((element: any) => {
        found = this.sharedwith.some(x => x.department_id === element._id);
        if (!found) {
          depIds.push(element._id);
        } else { this.SharedDepartments.push(element); }
      });
      this.userservice.getDepartments({ departments: depIds }).subscribe((departments: any) => {
        this.departments = departments;
      });
      if (this.sharedwith.length === 0) {
        if (document.getElementById('myback')) {
          document.getElementById('myback').click();
        }
      }
      if (!this.EnterFirstTime && this.dailogdata.SharedRecordEdit && this.dailogdata.SharedRecordEdit._id &&
        this.dailogdata.SharedRecordEdit.departmentid && this.dailogdata.SharedRecordEdit.departmentid._id) {
        found = this.sharedwith.find(x => x.department_id === this.dailogdata.SharedRecordEdit.departmentid._id);
        if (found) {
          this.departmentdetail(found.Sharedwith);
          this.updatedepartment = true;
        }
      }
    });
  }

  /**
   * Input{string} : (mode) mode*-selected accessmode
   * Output : Assign the selected accessmode to employees in a department
   */
  accessmodechanges(mode) {
    this.employeevalues.forEach(element => {
      element.shareoption = mode;
    });

  }
  /**
   * Input{string} : (share) share*-selected shareaccess
   * Output : Assign the selected shareaccess to employees in a department
   */
  shareaccesschanges(share) {
    this.employeevalues.forEach(element => {
      element.shareAccess = share;
    });

  }
  /**
   * Input{string} : (access) access*-selected accessoption
   * Output : Assign the selected accessoption to employees in a department
   */
  accessoptionchanges(access) {
    this.employeevalues.forEach(element => {
      element.access = access;
    });

  }
  /**
   * Input{string} : (expire) expire*-selected expirydate
   * Output : Assign the selected expirydate to employees in a department
   */
  expirydatechanges(expire) {
    const date = moment(expire);
    this.employeevalues.forEach(element => {
      element.access_expirydate = date._d;
    });
    this.accessexpiry = date._d;

  }
  /**
   * Input{string} : (pass) pass*-Entered password data
   * Output : Append password to employees in a department
   */
  passwordupdatechanges(pass) {
    if (!this.PINPattern.test(pass.trim())) {
      this.pinDisable = true;
    } else {
      this.pinDisable = false;
      this.employeevalues.forEach(element => {
        element.filepassword = pass;
      });
    }

  }
  /**
   * Input{string} : (msg) msg*-Entered message data
   * Output : Append message to employees in a department
   */
  messagechanges(msg) {
    this.employeevalues.forEach(element => {
      element.message = msg;
    });
  }

  /**
   * Input{boolean} : (pin) pin*-Whether pin is checked or not
   * Output : Append pin to employees in a department
   */
  pinchange(pin) {
    if (pin) {
      this.pinDisable = true;
    } else {
      this.pinDisable = false;
    }
    this.employeevalues.forEach(element => {
      element.pin = pin;
    });
  }

  /**
   * Input{number,string} : (i, value) i*-index of selected employee
   *                                       value*-selected expirydate
   * Output : Append expirydate to selected employee
   */
  singleexpirydatechanges(i, value) {
    const date = moment(value);
    this.employeevalues[i].access_expirydate = date._d;
  }
  /**
   * Input{number,boolean} : (i, value) i*-index of selected employee
   *                                        value*-checkbox value
   * Output : Append checkbox value to selected employee
   */
  singlecheckboxchanges(i, value) {
    this.employeevalues[i].checkbox = value;
    const v = this.employeevalues.filter(element => element.checkbox);
    if (this.employeevalues) {
      if (v.length !== this.employeevalues.length || v === undefined) {
        this.selectall = false;
      } else if (v.length === this.employeevalues.length) {
        this.selectall = true;
      }
    }
  }
  /**
   * Input{boolean,string} : (value,type)  value*-checkbox value
   *                                       type*-Which type to update
   * Output : select all employees based on type
   */
  selectallchange(value, type) {
    if (type === 'share') {
      this.employeevalues.forEach(element => {
        element.checkbox = value;
      });
    }
    if (type === 'update') {
      this.employees.forEach(element => {
        element.checkbox = value;
      });
    }
  }
  /**
   * Input{object} : (i)  i*-selected department
   * Output : append all data to the department employees
   */
  departmentdetail(i) {
    this.employees = i;
    this.employees.forEach(element => {
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
      if (element.view) { element.Sharetype = 'Review'; }
      if (element.edit) { element.Sharetype = 'Signature'; }
      element.checkbox = true;
      if (!this.EnterFirstTime && this.dailogdata.SharedRecordEdit && this.dailogdata.SharedRecordEdit._id === element._id) {
        this.EnterFirstTime = true;
        this.updatedepartment = true;
        setTimeout(() => {
          const id = this.dailogdata.SharedRecordEdit._id;
          element.cross = true;
          document.getElementById(id).click();
        }, 10);
      }
    });

  }

  /**
   * Function name : Share
   * Input{formdata} : (formFeilds) formFeilds*-submitted formdetails
   * Output : validate the form details amd shares the file
   */
  Share(formFeilds) {
    if (this.employees === undefined || this.employees.length === 0) {
      this.documentservice.openSnackBar('Please select department', 'x');
    } else if (this.employees && this.employees.length !== 0) {
      const checkBoxData = this.employees.filter(emp => emp.checkbox === true);
      if (this.departmenthierarchy.length === 0) {
        this.documentservice.openSnackBar('Please select department', 'x');
      } else if (checkBoxData.length === 0) {
        this.documentservice.openSnackBar('Please select employee', 'x');
      } else {
        this.submitted = true;
        if (this.Sharetype === 'Review' && !this.dailogdata.multi) { this.Share_for_Review(formFeilds); }
        if (this.Sharetype === 'Signature' && !this.dailogdata.multi) { this.Sharetodepartment(formFeilds); }
        if (this.Sharetype === 'Review' && this.dailogdata.multi) { this.multi_Share_for_Review(formFeilds); }
      }
    }
  }

  /**
   * Function name : multi_Share_for_Review
   * Input{formdata} : (Shareform) Shareform*-submitted formdetails
   * Output : share multiple files in review mode
   */
  multi_Share_for_Review(Shareform) {
    this.departmentlevels = [];
    let profileInfo;
    let fromemailid;
    const uniq = _.uniqBy(this.departmenthierarchy, 'value');
    if (this.departmenthierarchy.length > 1 && this.departmenthierarchy[0].value
      && this.departmenthierarchy[1].value && uniq.length !== this.departmenthierarchy.length) {
      this.documentservice.openSnackBar('Same department has been selected', 'x');
    } else {
      this.employeedata = [];
      this.employeevalues.forEach(element => {
        if (element.checkbox === true) {
          element.title = element.Sharetype;
          this.employeedata.push(element);
        }
      });
      this.departmenthierarchy.forEach(element => {
        if (element.value) { this.departmentlevels.push(element); }
      });
      this.sharedata = {
        employees: this.employeedata,
        departmentlevels: this.departmentlevels,
      };
      this.sharedata.file = this.dailogdata.content.files;
      this.sharedata.folder = this.dailogdata.content.folders;
      this.sharedata.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
      this.sharedata.organizationShare = true;
      this.organizationService.multiShareto_Department(this.sharedata).subscribe(data => {
        this.sharingdoc = data;
        if (data) { this.submitted = false; }
        this.dialogRef.close(true);
        this.documentservice.openSnackBar('Shared Successfully', 'x')
        profileInfo = JSON.parse(localStorage.getItem('currentUser'));
        if (profileInfo) { fromemailid = this.userservice.decryptData(profileInfo.email); }
        this.sharingdoc.forEach(element => {
          const result = {
            fromid: element.fromid,
            fromemail: fromemailid,
            toid: element.toid,
            toemail: element.toemail,
            sharingPeopleId: element._id,
            documentid: element.fileid,
            type: 'Shared',
          };
          if (element.toid) { this.generalService.createnotification(result).subscribe(response => { }); }
          if (element.toid) { var to_id = element.toid; }
          // create mouse movement
          const mousedata = {
            uid: element.fromid,
            documentid: element.fileid,
            folderid: element.folderid,
            message: 'Shared',
            toemail: element.toemail,
            toid: to_id,
            email: element.fromid ? element.fromid.email : undefined,
            isFile: true,
            latitude: this.latitude,
            longitude: this.longitude,
            IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' '
          };
          this.documentservice.savemousemovement(mousedata).subscribe(data => { });
        });
      });
    }
    
  }
 
  /**
   * Function name : Share_for_Review
   * Input{formdata} : (Shareform) Shareform*-submitted formdetails
   * Output : share the file in review mode
   */
  Share_for_Review = function (Shareform) {
    let profileInfo;
    this.departmentlevels = [];
    const uniq = _.uniqBy(this.departmenthierarchy, 'value');
    if (this.departmenthierarchy.length > 1
      && this.departmenthierarchy[0].value && this.departmenthierarchy[1].value && uniq.length !== this.departmenthierarchy.length) {
      this.documentservice.openSnackBar('Same department has been selected', 'x');
    } else {
      this.employeedata = [];
      this.employeevalues.forEach(element => {
        if (element.checkbox === true) {
          element.title = element.Sharetype;
          this.employeedata.push(element);
        }
      });
      this.departmenthierarchy.forEach(element => {
        if (element.value) { this.departmentlevels.push(element); }
      });
      this.sharedata = {
        employees: this.employeedata,
        departmentlevels: this.departmentlevels,
      };
      if (this.dailogdata.content.isFile) {
        this.sharedata.fileid = this.dailogdata.content;
        this.sharedata.fileencryptedid = this.dailogdata.content.encryptedid;
      } else { this.sharedata.folderid = this.dailogdata.content; }
      this.sharedata.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
      this.sharedata.organizationShare = true;
      this.organizationService.Shareto_Department(this.sharedata).subscribe(data => {
        profileInfo = JSON.parse(localStorage.getItem('currentUser'));
        if (profileInfo) { var fromemail = this.userservice.decryptData(profileInfo.email); }
        if (data) { this.submitted = false; }
        this.dialogRef.close(true);
        data.forEach(element => {
          const result = {
            fromid: element.fromid,
            fromemail: fromemail,
            toid: element.toid,
            toemail: element.toemail,
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
          this.documentservice.savemousemovement(mousedata).subscribe(data1 => { });
        });
        this.documentservice.openSnackBar('Shared Successfully', 'x');

        this.documentservice.getsharingpeople(this.dailogdata.content).subscribe(data => {
          if (data && data.length !== 0) {
            if (data[0].fileid) {
              if (data[0].fileid.status === 'Waiting for Sign' || data[0].fileid.status === 'Review' || data[0].fileid.status === 'upload') {
                data[0].fileid.status = 'Review';
              } else if (data[0].fileid.status === 'Partially completed' || data[0].fileid.status === 'Completed') {
                data[0].fileid.status = 'Partially completed';
              }
              data[0].fileid.isSent = true
              this.documentservice.updatefolder(data[0].fileid).subscribe(updatedData => { });
            }
            else if (data[0].folderid) {
              this.sharedata.folderid.isSent = true
              this.documentservice.updatefolder(this.sharedata.folderid).subscribe(updatedData => { });
            }
          }
        });
      });
    }
  };

  /**
   * Function name : departmentSelection
   * Input{array} : (department)  department*-selected department
   * Output : employees for selected department
   */
  departmentSelection(department) {
    this.employeedata = [];
    this.employeedata1 = [];
    this.departmenthierarchy = [];
    this.useremail = [];
    this.employeevalues = [];
    if (this.employeevalues.length === 0) { this.showselection = false; this.mySelect.close(); }
    this.departmentemails(department);
    department.forEach(element => {
      this.organizationService.getShareable_employees(element).subscribe(data => {
        this.employees = data;
        const departmentvalue = this.departments.find(x => x._id === element);
        if (!this.check(departmentvalue._id)) {
          this.employeedata.push({
            department_id: departmentvalue._id,
            department_name: departmentvalue.deptname, employees: this.employees
          });
          this.departmenthierarchy.push({ value: '', level: null });
          this.mySelect.close();
          this.employeevalues = [];
          this.employeedata.forEach(element => {
            element.employees.forEach(element1 => {
              element1.access = this.access;
              element1.Sharetype = this.Sharetype;
              element1.shareoption = this.shareoption;
              element1.checkbox = true;
              element1.shareAccess = this.shareAccess;
              element1.fileid = this.dailogdata.content;
              element1.passwordIcon='fa fa-eye-slash';
              element1.passwordtype='password';
              this.employeevalues.push(element1);
            });
            if (this.employeevalues.length > 0) { this.showselection = true; }
            if (this.employeevalues.length === 0) { this.documentservice.openSnackBar('No employees found to share', 'x'); }
          });
        }
      });
    });
  }
  // to close the dialog
  close() {
    this.dialogRef.close(true);
  }

  /**
   * Function name : removesharing
   * Input{number} : (index)  index*-selected employee insex
   * Output : Remove selected employee
   */
  removesharing(index) {
    const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
      {
        data: {
          name: 'fields', cancel: true,
          content: ' Are you sure to remove this employee for share.'
        }, width: '500px', panelClass: 'deletemod'
      });
    ConfirmationDiaBox.afterClosed().subscribe(result => {
      if (result) {
        this.employeevalues.splice(index, 1);
      }
    });
  }

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
          data: { name: 'fields', cancel: false, content: doc.name + ' has dependency with field,to check with field click on' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef22.afterClosed().subscribe(res1 => {
       var field= this.userDoc.find(x=>x.dependency==doc.toemail)
        const filedata = {
          fileid: this.dailogdata.content._id,
           sharedid:field.id
        };
        var originUrl = this.router.url.split('/');
        if (originUrl[3] == 'myfiles') {
          this.documentservice.encryptedvalues(filedata).subscribe((data: any) => {
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
          data: { name: 'fields', cancel: false, content: doc.name + ` has assigned with field, you can't delete it.` },
          width: '500px', panelClass: 'deletemod'
        });
      dialogRef22.afterClosed().subscribe(res1 => {
        dialogRef22.close();
      });
    }
    else {
      const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
        { data: { name: 'delete1' }, width: '500px', panelClass: 'deletemod' });
      ConfirmationDiaBox.afterClosed().subscribe(result => {
        let docData;
        if (result) {
          this.employees.splice(this.employees.indexOf(doc), 1);
          const completedEmails = this.employees.filter(email =>
            ((email.reviewed && email.signed) || (email.signed && !email.view) || (email.reviewed && email.view)));
          if (this.employees.length === 0) {
            docData = { _id: this.dailogdata.content._id, isSent: false, status: 'upload' };
          } else if (completedEmails.length === this.employees.length) {
            docData = { _id: this.dailogdata.content._id, status: 'Completed' };
          } else if (completedEmails.length !== 0 && completedEmails.length < this.employees.length) {
            docData = { _id: this.dailogdata.content._id, status: 'Partially completed' };
          } else if (completedEmails.length === 0) {
            docData = { _id: this.dailogdata.content._id, status: 'Waiting for Sign' };
          }
          if (this.dailogdata.isFolder) {
            docData.isFolder = true;
          } else {
            docData.isFolder = false;
          }
          this.documentservice.RemoveShareduser(doc).subscribe(data => {
            this.documentservice.openSnackBar('Shared email removed the access on document', 'X');
            this.documentservice.updatefolder(docData).subscribe(resp => {
            });
          });
        }
        this.getAllDepartments();
      });
    }
  }

  /**
   * Function name : removedepart
   * Input{object,object} : (member,doc) member*-selected department employee
   *                         doc*-selected department data
   * Output : Remove selected department from shared departments
   */
  removedepart(member, doc) {
    var deleteDoc = true;
    const result = member.filter(o1 => this.userDocList.some(o2 => o1.toemail === o2));
    if (result && result.length !== 0) { deleteDoc = false; }
    if (deleteDoc) {
      // submission completed email data
      const DeptEmails = member.filter(Deptemails => Deptemails.reviewed || Deptemails.signed);
      if (DeptEmails.length === 0) {
        const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
          { data: { name: 'deletedepartment' }, width: '500px', panelClass: 'deletemod' });
        ConfirmationDiaBox.afterClosed().subscribe(dailogBoxResult => {
          if (dailogBoxResult) {
            // Delete case, if any one of those not submitted
            this.organizationService.removedepartsharing(doc).subscribe(data => {
              this.employees = [];
              this.documentservice.getsharingpeople(this.dailogdata.content._id).subscribe(data => {
                this.sharedemails = data;
                // to get the document status
                let docStatus;
                let isSentt = true;
                const completedEmails = this.sharedemails.filter(email =>
                  ((email.signed && email.reviewed) || (email.signed && !email.view) || (email.reviewed && email.view)));
                if (this.sharedemails.length === 0) {
                  isSentt = false;
                  docStatus = 'upload';
                } else if (completedEmails.length === this.sharedemails.length) {
                  docStatus = 'Completed';
                } else if (completedEmails.length !== 0 && completedEmails.length < this.sharedemails.length) {
                  docStatus = 'Partially completed';
                } else if (completedEmails.length === 0) {
                  docStatus = 'Waiting for Sign';
                }
                this.documentservice.updatefolder({ _id: this.dailogdata.content._id, status: docStatus, isSent: isSentt })
                  .subscribe(resp => { });
              });
              this.getAllDepartments();
              this.documentservice.openSnackBar('Shared department has been removed from access on document', 'X');
            });
          }
        });
      } else {
        const dialogRef22 = this.dialog.open(CommonDialogComponent,
          {
            data: {
              name: 'fields', cancel: false,
              content: `Shared department has been started submission process, you can't delete it.`
            },
            width: '500px', panelClass: 'deletemod'
          });
        dialogRef22.afterClosed().subscribe(res1 => {
          dialogRef22.close();
        });
      }
    } else {
      let name = '';
      result.forEach(element => {
        name = name.concat(element.toid.fname + ',');
      });
      name = name.substring(0, name.length - 1);
      const dialogRef22 = this.dialog.open(CommonDialogComponent,
        {
          data: { name: 'fields', cancel: false, content: name + `has assigned with field, you can't delete it.` },
          width: '500px', panelClass: 'deletemod'
        });
      dialogRef22.afterClosed().subscribe(res1 => {
        dialogRef22.close();
      });
    }
  }

  /**
   * Function name : departmentemails
   * Input{array} : (department) department*-selected departments
   * Output : get all employee in selected departments
   */
  departmentemails(department) {
    department.forEach(element => {
      this.organizationService.getShareableemails(element).subscribe(data1 => {
        this.employees1 = data1;
        const departmentvalue = this.departments.find(x => x._id === element);
        if (!this.check1(departmentvalue._id)) {
          this.employeedata1.push({
            department_id: departmentvalue._id,
            department_name: departmentvalue.deptname, employees: this.employees1
          });
          this.stateGroups = this.employeedata1;
          this.employees1.forEach(employee => {
            this.useremail.push(employee);
          });
        }
      });
    });
  }

  // to check Whether already employee has been selected to share
  check(departmentId) {
    return this.employeedata.some(x => x.department_id === departmentId);
  }

  // to check Whether already employee has been shared
  check1(departmentId) {
    return this.employeedata1.some(x => x.department_id === departmentId);
  }

  /**
   * Function name : Sharetodepartment
   * Input{formdata} : (Shareform) submitted form details
   * Output : share the document in signature mode
   */
  Sharetodepartment(Shareform) {
    this.departmentlevels = [];
    let profileInfo;
    if (this.dailogdata.content.versionid) {
      this.documentservice.getCurrentVersionDocFieldOptions({
        documentid: this.dailogdata.content._id,
        versionid: this.dailogdata.content.versionid
      }).subscribe(currentVersionDocFieldOptions => {
        this.currentVersionDocFieldOptionsResult = currentVersionDocFieldOptions;
        // ====================== // if versionid // ======================================================================//
        if (this.currentVersionDocFieldOptionsResult && this.currentVersionDocFieldOptionsResult.fields.length) {
          this.fields = this.currentVersionDocFieldOptionsResult.fields;
          this.dailogdata.content.isSent = true;
          this.documentservice.updatefolder(this.dailogdata.content).subscribe(folderdata => { });
          const uniq = _.uniqBy(this.departmenthierarchy, 'value');
          if (this.departmenthierarchy.length > 1 && this.departmenthierarchy[0].value
            && this.departmenthierarchy[1].value && uniq.length !== this.departmenthierarchy.length) {
            this.documentservice.openSnackBar('Same department has been selected', 'x');
          } else {

            this.employeedata = [];
            this.employeevalues.forEach(element => {
              if (element.checkbox === true) {
                element.title = element.Sharetype;
                this.employeedata.push(element);
              }
            });
            this.departmenthierarchy.forEach(element => {
              if (element.value) { this.departmentlevels.push(element); }
            });
            this.sharedata = {
              employees: this.employeedata,
              fileid: this.dailogdata.content._id,
              departmentlevels: this.departmentlevels
            };

            if (this.dailogdata.content.isFile) {
              this.sharedata.fileid = this.dailogdata.content;
              this.sharedata.fileencryptedid = this.dailogdata.content.encryptedid;
            } else { this.sharedata.folderid = this.dailogdata.content; }
            this.sharedata.IpAddress = (this.IpAddress) ? this.IpAddress.ip : ' ';
            this.sharedata.organizationShare = true;
            this.organizationService.Shareto_Department(this.sharedata).subscribe(data => {
              this.sharingdoc = data;
              if (data) { this.submitted = false; }
              this.dialogRef.close(true);
              this.documentservice.openSnackBar('Shared Successfully', 'x');
              this.documentservice.getsharingpeople(this.dailogdata.content).subscribe(data => {
                if (data[0].fileid.status === 'Waiting for Sign'
                  || data[0].fileid.status === 'Review' || data[0].fileid.status === 'upload') {
                  data[0].fileid.status = 'Waiting for Sign';
                } else if (data[0].fileid.status === 'Partially completed' || data[0].fileid.status === 'Completed') {
                  data[0].fileid.status = 'Partially completed';
                }
                this.documentservice.updatefolder(data[0].fileid).subscribe(updatedData => { });
              });
              profileInfo = JSON.parse(localStorage.getItem('currentUser'));
              if (profileInfo) { var fromemail = this.userservice.decryptData(profileInfo.email); }
              this.sharingdoc.forEach(element => {
                const result = {
                  fromid: element.fromid,
                  fromemail: fromemail,
                  toid: element.toid,
                  toemail: element.toemail,
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
                  IpAddress: (this.IpAddress) ? this.IpAddress.ip : ' ',
                };
                this.documentservice.savemousemovement(mousedata).subscribe(mousedataValue => { });
              });
            });
          }

        } else {
          const data = {
            fileid: this.dailogdata.content._id
          };
          this.documentservice.encryptedvalues(data).subscribe((filedata: any) => {
            this.router.navigate(['organization/filecont/' + filedata.encryptdata]);
            this.documentservice.openSnackBar('add fields in document', 'X');
            this.dialogRef.close(false);
          });
        }
      });
    } else {
      const data = {
        fileid: this.dailogdata.content._id
      };
      this.documentservice.encryptedvalues(data).subscribe((filedata: any) => {
        this.router.navigate(['organization/filecont/' + filedata.encryptdata]);
        this.dialogRef.close(false);
      });
    }
  }

  /**
   * Function name : getlevel
   * Input{number,object,number,number} :(level, dept, index, index1)level*-hierarchy level
   *                                                                 dept*-selected department
   *                                                                 index*-hierarchy index
   *                                                                 index1*-selected department index
   * Output : share the document in signature mode
   */
  getlevel(level, dept, index, index1) {
    if (this.departmenthierarchy.some((x, i) => x.value === dept && i !== index)) {
      this.departmenthierarchy[index] = {};
      this.documentservice.openSnackBar('Same department has been selected', 'x');
    } else {
      this.departmenthierarchy[index].value = dept;
      this.departmenthierarchy[index].level = level;
    }
  }

  // Assign selected department to Sharedpeople variable
  sharepeopled(sharedwidth) {
    this.Sharedpeople = sharedwidth;
  }

  /**
   * Function name : savechanges
   * Input{object,string,Number} : (user, update, index) user*-selected employee
   *                                                     update*-update type
   *                                                     index*-selected employee index
   * Output : update the individual employee details
   */
  savechanges(user, update, index) {
    if (update === 'singleupdate') {
      user.title = user.Sharetype;
      this.accesmodeList.forEach(code => {
        if (user.shareAccess.some(x => x === code.value)) {
          user[code.value] = true;
        } else { user[code.value] = false; }
      });

      this.organizationService.updatesharedpeople(user).subscribe((data: any) => {
        user.revokeStatus = null;
        if (data === 'updated') {
          document.getElementById(user._id).click();
          this.documentservice.openSnackBar('changes are updated', 'x');
          this.documentstatusChanges(user, data);
        }
      });
    } else {
      user.title = user.Sharetype;
      this.employeevalues[index] = user;
      document.getElementById(user._id).click();
    }
  }

  /**
   * Function name : documentstatusChanges
   * Input{object} : (user)  user*-selected document data
   * Output : update the status of the document
   */
  documentstatusChanges(user, data) {
    this.documentservice.getsharingpeople(user.fileid).subscribe((sharerecords: any) => {
      this.sharingpeople = sharerecords;
      if (!(user.signed && user.reviewed)) {
        let filledFieldCount = 0;
        let reviewedPeoples;
        let signedPeoples;
        let shareForReviews = [];
        let shareForSignatures = [];
        shareForSignatures = this.sharingpeople.filter(element => !element.view);
        shareForReviews = this.sharingpeople.filter(element => element.view);
        signedPeoples = this.sharingpeople.filter(element => (element.signed && !element.view));
        reviewedPeoples = this.sharingpeople.filter(element => (element.reviewed && element.view));
        if (this.sharingpeople.length && this.userDoc.length) {
          if (this.sharingpeople.length === 1 && !reviewedPeoples.length && !signedPeoples.length) {
            status = 'Waiting for Sign';
          } else if ((signedPeoples.length === shareForSignatures.length && reviewedPeoples.length === shareForReviews.length)) {
            status = 'Completed';
          } else {
            this.userDoc.forEach((field) => {
              if (field.insertedemail) {
                if (field.value || field.signatureId || field.stampId || field.photoId) {
                  filledFieldCount++;
                }
              }
            });
            const fieldsExceptLabel = this.userDoc.filter(field => field.type !== 'label');
            if (fieldsExceptLabel.length === filledFieldCount && (signedPeoples.length === shareForSignatures.length
              && reviewedPeoples.length === shareForReviews.length)) {
              status = 'Completed';
            } else if ((reviewedPeoples.length > 0 || signedPeoples.length > 0)) {
              status = 'Partially completed';
            } else if (!reviewedPeoples.length && !signedPeoples.length) {

              status = 'Waiting for Sign';
            }

          }
        }
        this.documentservice.updatefolder({ _id: user.fileid, status: status }).subscribe(updatedData => { });
      }
    });
  }

  /**
   * Function name : updateAll
   * Input{formdata} : (updateform)  updateform*-submitted form details
   * Output : update the shared departments
   */
  updateAll(updateform) {
    let allemployees = [];
    let filepassword;
    this.employees.forEach((element, inx) => {
      if (element.checkbox === true) {
        if (this.SharedPINDisable[inx]) {
          element.pin = false;
          element.filepassword = '';
        }
        allemployees.push(element);
      }
    });

    if (updateform.value.filepassword) {
      filepassword = updateform.value.filepassword;
    } else { filepassword = undefined; }
    this.sharedata = {
      employees: allemployees,
      accesstype: updateform.value.access,
      filepassword: updateform.value.filepassword,
      access_expirydate: this.accessexpiry,
      pin: updateform.value.pin,
      Sharetype: this.Sharetype,
      shareAccess: updateform.value.shareAccess
    };
    if (this.dailogdata.content.isFile) {
      this.sharedata.fileid = this.dailogdata.content._id;
      this.sharedata.fileencryptedid = this.dailogdata.content.encryptedid;
    } else { this.sharedata.folderid = this.dailogdata.content._id; }

    this.accesmodeList.forEach(code => {
      if (this.sharedata.shareAccess.some(x => x === code.value)) {
        this.sharedata[code.value] = true;
      } else { this.sharedata[code.value] = false; }
    });
    this.organizationService.AllSharedpeopleupdate(this.sharedata).subscribe(data => {
      this.dialogRef.close(true);
      this.documentservice.openSnackBar('changes are updated', 'x');
      this.documentstatusChanges({ fileid: this.dailogdata.content._id }, data);
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
      i.revokeStatus = 'Un Revoke';
    } else {
      revokeStatus = 'Revoke';
      i.revokeStatus = 'Revoke';
    }
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: {
          name: 'fields', cancel: true,
          content: 'Are you sure want to ' + revokeStatus + ' the Sharing'
        }, width: '500px', panelClass: 'deletemod'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) { i.revoke = !i.revoke; }
    });

  }
  /**
   * Function name : getUserDocList
   * Input :null
   * Output : selected file current version fields
   */
  getUserDocList() {
    if (!this.dailogdata.multi) {
      this.documentservice.getsharingpeople(this.dailogdata.content).subscribe((data: any) => {
        this.currentVersionFieldValues = data.filter(sharedDoc => sharedDoc.signed);
        if (this.currentVersionFieldValues && this.currentVersionFieldValues.length) {
          this.Sharetype = 'Review';
        }
        this.documentservice.getCurrentVersionDocFieldWithValues({
          documentid: this.dailogdata.content._id,
          versionid: this.dailogdata.content.versionid
        }).subscribe(response => {
          this.userDoc = response;
          if (((this.userDoc && this.userDoc.fields && this.userDoc.fields.length === 0)
            || !this.userDoc || this.userDoc.length === 0) && this.Sharetype === 'Signature') {
            this.addFeildsPopUp();
          }
          if (this.userDoc) {
            this.userDoc.forEach(docs => {
              if (docs.people) { if (!this.userDocList.some(x => x === docs.people)) { this.userDocList.push(docs.people); } }
              if (docs.dependency) { if (!this.dependencyDocList.some(x => x === docs.dependency)) { this.dependencyDocList.push(docs.dependency); } }

            });
          }
        });
      });
    }
  }

  /**
   * Function name : Radiochange
   * Input{string} :(Sharetype) Sharetype*-sharing type 'Review' or 'signature'
   * Output : update the radio button value to the  departments
   */
  Radiochange(Sharetype) {
    this.employeevalues.forEach(element => {
      element.Sharetype = Sharetype;
    });

    if (Sharetype === 'Review') { this.dailogdata.title = 'Review'; }
    if (Sharetype === 'Signature') {
      if (this.currentVersionFieldValues && this.currentVersionFieldValues.length) {
        this.Sharetype = 'Review';
        this.dailogdata.title = 'Review';
      }
      this.dailogdata.title = 'Signature';
      setTimeout(() => {
        if (((this.userDoc && this.userDoc.fields && this.userDoc.fields.length === 0)
          || !this.userDoc || this.userDoc.length === 0)) { this.addFeildsPopUp(); }
      }, 1000);
    }
  }

  /**
   * Function name : addFeildsPopUp
   * Input:null
   * Output : open popup to add fields if shae mode is in signature and fields are null
   */
  addFeildsPopUp() {
    const dialogRef = this.dialog.open(CommonDialogComponent,
      { data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents' }, width: '500px', panelClass: 'deletemod' });
    dialogRef.afterClosed().subscribe(res => {
      const data = {
        fileid: this.dailogdata.content._id
      };
      this.documentservice.encryptedvalues(data).subscribe((filedata: any) => {
        if (res) {
          this.dialogRef.close(false); this.router.navigate(['organization/filecont/' + filedata.encryptdata]);
        } else { this.Sharetype = 'Review'; this.dailogdata.title = 'Review'; }
      });
    });
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
        if ((this.userDoc && this.userDoc.fields && this.userDoc.fields.length === 0)
          || !this.userDoc || this.userDoc.length === 0) { this.addShareFeildsPopUp(info); }
      }, 10);
    }
  }

  /**
   * Function name : addShareFeildsPopUp
   * Input{object}:(i) i*-selected employee details
   * Output : open popup to add fields if shae mode is in signature and fields are null
   */
  addShareFeildsPopUp(i) {
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents in Signature mode' },
        width: '500px', panelClass: 'deletemod'
      });
    dialogRef.afterClosed().subscribe(res => {
      const data = {
        fileid: this.dailogdata.content._id
      };
      this.documentservice.encryptedvalues(data).subscribe((filedata: any) => {
        if (res) {
          this.dialogRef.close(false); this.router.navigate(['organization/filecont/' + filedata.encryptdata]);
        } else { i.Sharetype = 'Review'; }
      });
    });
  }

  /**
   * Function name : getDocPassword
   * Input{object}:(data) data*-selected document details
   * Output : get decrypted password
   */
  getDocPassword(data) {
    data.title = 'getpassword';
    this.documentservice
      .getSearch('sharingpeoples/checkpassword/' + data._id + '/' + data.filepassword + '/' + data.title)
      .subscribe((passworddata: any) => {
        data.filepassword = passworddata.password;
      });
  }

  // To Validate entered PIN for Sharing records
  PINModelChange(event, index) {
    if (!this.PINPattern.test(event.trim())) {
      this.PINDisable[index] = true;
    } else {
      this.PINDisable[index] = false;
    }
  }

  //Radio button change detection for Sharing records
  RadioChange(pin, index) {
    if (pin) {
      this.PINDisable[index] = true;
    } else {
      this.PINDisable[index] = false;
    }
  }

  // To Validate entered PIN for Shared records
  PINModelChangeShared(event, index) {
    if (!this.PINPattern.test(event.trim())) {
      this.SharedPINDisable[index] = true;
    } else {
      this.SharedPINDisable[index] = false;
    }
  }

  //Radio button change detection for Shared records
  RadioChangeShared(pin, index) {
    if (pin) {
      this.SharedPINDisable[index] = true;
    } else {
      this.SharedPINDisable[index] = false;
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



