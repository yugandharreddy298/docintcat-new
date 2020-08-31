import { Component, OnInit, Output, EventEmitter, NgZone, ViewChild } from '@angular/core';
import { DocumentService } from '../../document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FrontEndConfig } from '../../frontendConfig';
import { UserService } from '../../user.service';
import { DataService } from '../../core/data.service';
import { MatDialog, MatAccordion } from '@angular/material';

declare var gapi: any; //google-drive
declare var $: any; //jquery

@Component({
  selector: 'app-auditlog',
  templateUrl: './auditlog.component.html',
  styleUrls: ['./auditlog.component.css']
})
export class AuditlogComponent implements OnInit {
  showVideoRecord: boolean;
  videoPlayer:any;
  playButton: boolean=false;
  pauseButton: boolean = true;
  allFields: any;
  path= [];
  reviewOrSignature: any;
  documentViewFor: string;
  constructor(private documentservice: DocumentService,
    public activatedroute: ActivatedRoute,
    private frontendconfig: FrontEndConfig,
    private userService: UserService,
    private _ngZone: NgZone,
    private dataService: DataService,
    public router: Router,
    public dialog: MatDialog) {
    this.refresh();
  }

  auditdata;
  documentLogs;
  SingleData;
  sharingPeoples;
  id;
  downloadType
  downloadFile
  withlog
  pdfPinSet
  pdfPin
  element
  userEmail: any;  // stores user email
  profiledata: any; // stores profile date
  userName: any; //stores user name
  isloading: boolean = true; //loading variable
  displaySigners: any; // stores all the sharing people (In Signature mode)
  docStatus: any; // document status
  serverurl = this.frontendconfig.getserverurl();
  email
  type: any;
  // panelOpenState = false;
  viewTimeLoader = false
  documentviewtimebtn = [];
  replayButton:boolean=false;
  filteredata
  videorecord
  videourl
  clearintervaldata
  reviewedemails
  iebrowser // detect IE browser
  fromComponent = 'My Files'
  prevURL;
  myPageInfo = []
  totalTime: any
  logs: any
  userId : any
  clientid = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  @Output() maps = new EventEmitter<{ data: string }>();
  @ViewChild('accordion') accordion:MatAccordion
  folderfiles:any;
  ngOnInit() {
    this.prevURL = this.documentservice.getStartUrl()
    if (this.prevURL && this.prevURL.split('/')[3] === 'sentfiles') {
      this.fromComponent = 'Sent Files'
    }
    if (this.prevURL && this.prevURL.split('/')[3] === 'favorites') {
      this.fromComponent = 'Favourites'
    }
    var urldata = this.router.url.split('/');
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'))
    this.userEmail = this.userService.decryptData(this.profiledata.email);
    this.userName = this.userService.decryptData(this.profiledata.name);
    this.userId = this.userService.decryptData(this.profiledata.id);
    this.profiledata.type = this.userService.decryptData(this.profiledata.type);
    var data = {
      fileid: urldata[4]
    }
    this.documentservice.decryptedvalues(data).subscribe((data: any) => {
      this.id = data.decryptdata
      this.type = urldata[5];
      if (this.type == 'File') this.getDocumentDetails('');
      else this.getFolderDetails('');
    }, error => {
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/myfiles'])
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/myfiles'])
    })
    if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
      this.clearintervaldata = setInterval(() => {
        this.ccb();
      }, 100);
    }
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true
    }
    else this.iebrowser = false
  }

  ngOnDestroy() {
    clearInterval(this.clearintervaldata);
  }

  /**
   * Function name : clearData
   * Input : null
   * Output : Clipboard data will be cleared.
   * Desc : To clear Clipboard data.
   */
  clearData() {
    window["clipboardData"].setData('text', '')
  }

  /**
   * Function name : ccb
   * Input : null
   * Output : Clipboard data will be cleared.
   * Desc : To clear Clipboard data.
   */
  ccb() {
    if (window["clipboardData"]) {
      window["clipboardData"].clearData();
    }
  }

  /**
   * Function name : getDocumentDetails
   * Input : null
   * Output : Document data and logs.
   * Desc : To get Document data and logs.
   */
  getDocumentDetails(file) {
    this.documentservice.getDocumentRecord(this.id).subscribe((data:any) => {
      if(data.uid == this.userId){
        this.auditdata = data
       if(file=='') this.pushToPath(this.auditdata)
        this.folderfiles=[]
        this.getDocumentLogs();
      }
      else{
        this.urlMismatch()
      }
    }, error => {
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/myfiles'])
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/myfiles'])
    });
  }

  /**
   * Function name : getFolderDetails
   * Input : null
   * Output : Folder data and logs.
   * Desc : To get folder data and logs.
   */
  getFolderDetails(folder) {
    this.documentservice.getFolderRecord(this.id).subscribe(data => {
      this.auditdata = data
     if(folder=='') this.pushToPath(this.auditdata)
      this.documentservice.getparentfolders(this.id).subscribe(filedata => {
        this.folderfiles = filedata
      })

      this.getDocumentLogs();
      this.sharingPeople();
    }, error => {
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/myfiles'])
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/myfiles'])
    });
  }

  /**
   * Function name : refresh
   * Input : null
   * Output : autoRefresh.
   * Desc : autoRefresh to get file and folders data.
   */
  refresh() {
    this.dataService.documentUpdate().subscribe(data => {
      if (data._id == this.id) {
        this.auditdata = data
        this.docStatus = (this.auditdata && this.auditdata.status) ? (this.auditdata.status == 'Completed' ? "Completed" : (this.auditdata.status == 'Partially completed' ? 'In Progress' : ((this.auditdata.status == 'Waiting for Sign' || this.auditdata.status == 'Review') ? 'Waiting' : undefined))) : undefined;
      }
    });
    this.dataService.documentLogsUpdate().subscribe(data => {
      if (data.documentid == this.id) {
        this.getDocumentLogs();
      }
    })
    if (this.type == 'File')
      this.dataService.FieldsValueUpdate().subscribe(data => {
        if (data.documentid == this.id) {
          this.currentVersionDocField();
        }
      })
  }

  /**
   * Function name : sharingPeople
   * Input : null
   * Output : Sharing people details.
   * Desc : To get sharing people details.
   */
  sharingPeople() {
  
    this.viewTimeLoader = true
    this.documentservice.getSharingPeoples(this.auditdata._id).subscribe(data => {
      this.sharingPeoples = data;
      this.isloading = false
      this.documentviewtimebtn = this.sharingPeoples.sharingpeoples
      this.showVideoRecord=this.documentviewtimebtn.some(x=>x.VideoRecord)
      this.displaySigners = JSON.parse(JSON.stringify(this.sharingPeoples.sharingpeoples.filter(x => x.signed || !x.view)));
      this.reviewedemails = JSON.parse(JSON.stringify(this.sharingPeoples.sharingpeoples.filter(x => x.view || x.reviewed)));   
      console.log(this.reviewedemails,this.displaySigners)   
      if(this.sharingPeoples.sharingpeoples && this.documentLogs )
      {
        var Reviewer=this.documentLogs.find(x=> this.sharingPeoples.sharingpeoples.some(x1=>x.toemail === x1.toemail && x.message=='Reviewed'));
        if(Reviewer) 
        {
          var index = this.reviewedemails.findIndex(x=>x.toemail==Reviewer.toemail);
         if(this.reviewedemails[index]&& !this.reviewedemails[index].IP ) this.reviewedemails[index].IP=Reviewer.IpAddress;
         if(this.reviewedemails[index]&& !this.reviewedemails[index].latitude )  this.reviewedemails[index].latitude=Reviewer.latitude || undefined;
         if(this.reviewedemails[index]&& !this.reviewedemails[index].longitude )  this.reviewedemails[index].longitude=Reviewer.longitude || undefined;
         if(this.reviewedemails[index]&& !this.reviewedemails[index].created_at )  this.reviewedemails[index].created_at= Reviewer.created_at;
 
      }
      }
      this.sharingpeoplesview();
      if (this.type == 'File' && this.auditdata.versionid) this.currentVersionDocField();
      if (this.type == 'File' && !this.auditdata.versionid) {
        this.docStatus = (this.auditdata && this.auditdata.status) ? (this.auditdata.status == 'Completed' ? "Completed" : (this.auditdata.status == 'Partially completed' ? 'In Progress' : ((this.auditdata.status == 'Waiting for Sign' || this.auditdata.status == 'Review') ? 'Waiting' : undefined))) : undefined;
      }
    });

  }

  /**
   * Function name : sharingpeoplesview
   * Input : null
   * Output : Sharing people details.
   * Desc : To get sharing people details.
   */
  sharingpeoplesview() {
    this.viewTimeLoader = true
    this.sharingPeoples.sharingpeoples.forEach((element, index) => {
      this.selectvideo(element.toemail, index)
    });
    this.reviewedemails.forEach((element,index) => {
      this.selectpeople(element.toemail,index,'Review')
    });
    this.displaySigners.forEach((element,index) => {
      this.selectpeople(element.toemail,index,'Signature')
    });
  }

   /**
   * Function name : getDocumentLogs
   * Input : null
   * Output : Document logs.
   * Desc : To get document logs.
   */
  getDocumentLogs() {
    this.viewTimeLoader = true
    this.documentservice.getDocumentLogs(this.auditdata).subscribe(data => {
      this.documentLogs = data;
      this.documentLogs = this.documentLogs.sort((a, b) => <any>new Date(a.created_at) - <any>new Date(b.created_at))
      this.documentLogs = this.documentLogs.filter(x => (x.message != 'selected' && x.message != 'Closed' && x.message!='Made copy' && x.message!='Moved '))
      this.documentLogs.forEach(element => {
        if (element.toid && element.toid.fname) element.toid.name = element.toid.fname + ' ' + element.toid.lname;
      });
      this.sharingPeople();
    });    
  }

  /**
   * Function name : currentVersionDocField
   * Input : null
   * Output : current version fields.
   * Desc : To get the fields for the current version.
   */
  
  currentVersionDocField() {
    this.documentservice.getCurrentVersionDocFieldWithValues({ documentid: this.auditdata._id, versionid: this.auditdata.versionid }).subscribe((data: any) => {
      var currentVersionDocFieldOptions = data;
      this.allFields=data
      this.displaySigners.forEach(element => {
        element.fieldsValues = currentVersionDocFieldOptions.filter(x => (((x.insertedemail == element.toemail) || (x.people == element.toemail)) && x.ownerField==false && x.type != 'label'));
        if(element && element.fieldsValues.length!=0){
          var datafields=element.fieldsValues.filter(x=> (x.type!="initial" && x.type!="signature" && x.type!="Photo" && x.type!="Stamp"))
          element.datafields=datafields?datafields.length:0
          element.fieldsValues = element.fieldsValues.filter(x=> (x.type=="initial"|| x.type=="signature" || x.type=="Photo" || x.type=="Stamp"))
          }
        element.status = currentVersionDocFieldOptions.some(x => x.insertedemail == element.toemail) ? 'Submitted' : 'Waiting';
        if(element.signed && element.fieldsValues && element.fieldsValues.length==0){
          element.emptyfields=this.documentLogs.find(x => x.message == 'Submitted' && x.toemail == element.toemail) ? this.documentLogs.find(x => x.message == 'Submitted' && x.toemail == element.toemail):''
        }
        if (this.documentLogs) element.IP = this.documentLogs.find(x => x.message == 'Submitted' && x.toemail == element.toemail) ? this.documentLogs.find(x => x.message == 'Submitted' && x.toemail == element.toemail).IpAddress : null;
        element.fieldvalues = element.fieldsValues.sort((a, b) => <any>new Date(a.created_at) - <any>new Date(b.created_at))
      });
      var filledFieldCount = 0
      currentVersionDocFieldOptions.forEach(field => {
        if ((field.value || field.signatureId || field.photoId || field.stampId)) filledFieldCount++
      });
      var docStatusFinished = -1;
      docStatusFinished = this.displaySigners.filter(x => x.status == 'Submitted').length;
      this.docStatus = (this.auditdata && this.auditdata.status) ? (this.auditdata.status == 'Completed' ? "Completed" : (this.auditdata.status == 'Partially completed' ? 'In Progress' : ((this.auditdata.status == 'Waiting for Sign' || this.auditdata.status == 'Review') ? 'Waiting' : undefined))) : undefined;
    });
    
  }

  /**
   * Function name : DownloadPDF
   * Input : null
   * Output : Downloaded pdf.
   * Desc : To download pdf.
   */
  DownloadPDF() {
    this.documentservice.DownloadDocInAuditLog(this.auditdata);
  }

  /**
   * Function name : validateValue
   * Input : field
   * Output : Navigation to transaction verify page with the selected filed id data.
   * Desc : To Navigate transaction verify page, when user clicks on signature/initial/Stamp/Photo id.
   */
  validateValue(field) {
    var id;
    field.type = field.type ? field.type : field.message;
    if (field.type == 'signature' || field.type == 'initial' || field.type == 'Signature' || field.type == 'Initial') id = field.signatureId;
    else if (field.type == 'Stamp') id = field.stampId;
    else if (field.type == 'Photo') id = field.photoId;
    if (id && field.type) {
      var data = {
        type: field.type,
        id: id,
        docid: this.auditdata._id
      }
      this.documentservice.encryptedvalues(data).subscribe((data: any) => {
        if (data) {
          if (this.profiledata.type == 'individual') window.open(this.frontendconfig.frontendurl + '/individual/transaction-verify/' + data.type + '/' + data.id + '/' + data.docid, '_blank');
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') window.open(this.frontendconfig.frontendurl + '/organization/transaction-verify/' + data.type + '/' + data.id + '/' + data.docid, '_blank');
        }
      })
    }
  }

  /**
   * Function name : setDownload
   * Input : data
   * Output : Downbload type data.
   * Desc : To set Download download type data
   */
  setDownload(data) {
    this.element = data
    this.downloadType = 'computer'
    this.downloadFile = 'current'
    this.withlog = false;
    this.pdfPinSet = false;
    this.pdfPin = '';
    this.email = '';
  }

  /**
   * Function name : pdfDownload
   * Input : token
   * Output : Downloaded pdf.
   * Desc : To download pdf.
   */
  pdfDownload(token) {
    if (this.downloadFile == 'withoutchanges') this.withlog = false
    var downloaddata = {
      id: this.element._id,
      name: this.element.name,
      downloadType: this.downloadType,
      downloadFile: this.downloadFile,
      withlog: this.withlog,
      pdfPinSet: this.pdfPinSet,
      pdfPin: this.pdfPin,
      access_token: '',
      scope: this.scopes,
      token_type: '',
      expiry_date: '',
      email: this.email
    }
    if (token) {
      downloaddata.access_token = token.access_token;
      downloaddata.token_type = token.token_type;
      downloaddata.expiry_date = token.expires_at;
    }
    if (this.downloadType != 'attachment') {
      document.getElementById('savetempclose').click()
      this.isloading = true
      this.documentservice.pdfDownload(downloaddata).subscribe((data: any) => {
        if (data.path && downloaddata.downloadType == "computer") {
          this.isloading = false
          this.documentservice.openSnackBar("File Downloaded Successfully", "X");
          var xhr = new XMLHttpRequest()
          xhr.open("GET", data.path)
          xhr.responseType = 'blob'
          xhr.onload = function () {
            saveAs(xhr.response, downloaddata.name);
          }
          xhr.send()
        }
        else if (downloaddata.downloadType == 'drive') {
          this.isloading = false
          if (!NgZone.isInAngularZone()) this._ngZone.run(() => {
            this.documentservice.openSnackBar("File Export To Drive", "X");
          });
        }
        else this.isloading = false
      });
    }
    if (this.downloadType == 'attachment') {
      if (this.email == null || this.email == '') {
        this.documentservice.openSnackBar("Please Enter Email", "X");
      }
      else {
        var regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
        if (regexp.test(this.email)) {
          document.getElementById('savetempclose').click()
          this.isloading = true
          this.documentservice.pdfDownload(downloaddata).subscribe((data: any) => {
            if (downloaddata.email && downloaddata.downloadType == "attachment" && data.path) {
              this.isloading = false
              this.documentservice.openSnackBar("File Sent To Email", "X");
            }
            else this.isloading = false
          });
        }
        else {
          this.documentservice.openSnackBar("Please Enter  Valid Email", "X");
        }
      }
    }
  }

  /**
   * Function name : exporttodrive
   * Input : null
   * Output : Export to drive.
   * Desc : Export to drive.
   */
  exporttodrive() {
    gapi.load('auth', { 'callback': this.onAuthApi.bind(this) });
  }

  /**
   * Function name : onAuthApi
   * Input : null
   * Output : Export to drive.
   * Desc : Export to drive.
   */
  onAuthApi() {
    gapi.auth.authorize(
      {
        client_id: this.clientid,
        scope: this.scopes,
        immediate: false
      },
      this.handleAuthResults);
  }

  /**
   * Function name : handleAuthResults
   * Input : authResult
   * Output : Export to drive.
   * Desc : Export to drive.
   */
  handleAuthResults = (authResult) => {
    if (authResult && authResult.access_token) this.pdfDownload(authResult)
  }

  /**
   * Function name : selectpeople
   * Input : email, index
   * Output : Document View time.
   * Desc : To show document view time in audit log page.
   */
  selectpeople(email, index,title) {
    this.myPageInfo = [];
    if (this.documentLogs)
      this.filteredata = this.documentLogs.filter(x => x.toemail == email && x.message == 'Viewed' && (x.pageInfo.length && x.pageInfo[0].type==title))
    this.logs = this.documentLogs.filter(x => x.toemail == email && x.message == 'Viewed' && (x.pageInfo.length && x.pageInfo[0].type==title))
    if (this.filteredata.length == 0 || (this.filteredata[0] && !this.filteredata[0].endTime) || this.filteredata == undefined) this.viewTimeLoader = false
    if (this.filteredata.length > 0 && !this.filteredata[0].endTime) this.filteredata.splice(index, 1)
    if (this.filteredata) {
      if (this.filteredata && this.filteredata.length) {
       if(title=="Review") this.reviewedemails[index].endTime = 0; 
       else if(title=='Signature')  {
         this.displaySigners[index].endTime = 0; 
        }
        for (var i = 0; i < this.filteredata[0].pageInfo.length; i++) {
          var time = 0
          this.filteredata.forEach(element => {
            var value = element.pageInfo[i] ? element.pageInfo[i].time : 0
            time += value
           if(title=="Review") this.reviewedemails[index].endTime += value;
           else if(title=='Signature')  this.displaySigners[index].endTime += value;
          })
          if (time > 0)
            this.myPageInfo.push({ time: this.hhmmss(time), pageNo: i + 1 })
        }
        if(title=="Review") this.reviewedemails[index].endTime = this.hhmmss(this.reviewedemails[index].endTime);
        else if(title=='Signature') this.displaySigners[index].endTime = this.hhmmss(this.displaySigners[index].endTime);
        this.viewTimeLoader = false
      }
    }
  }

  pad(num) {
    return ("0" + num).slice(-2);
  }

  /**
   * Function name : hhmmss
   * Input : secs
   * Output : Document View time.
   * Desc : To calculate view time.
   */
  hhmmss(secs) {
    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`;
  }

  /**
   * Function name : hhmmss
   * Input : secs
   * Output : Document view  time popup will be shown.
   * Desc : Adding click to pageviewtime button.
   */
  pageviewtime(view) {
    if(view) {
      this.reviewOrSignature = this.reviewedemails;
      this.documentViewFor='Review'
    }
    else{ this.reviewOrSignature=this.displaySigners
      this.documentViewFor='Signature'

    }
    document.getElementById('pageviewtime').click();
    this.accordion.closeAll()
  }

  /**
   * Function name : selectvideo
   * Input : email, index
   * Output : Document Video record.
   * Desc : To show recorded video in audit log page.
   */
  selectvideo(email, index) {
    this.videorecord = this.documentLogs.filter(x => x.email == email && x.message == 'Video Record')
  }

  showvideo(log) {
    if (this.profiledata.type == 'individual') {
      window.open('/individual/videoplay/' + log._id)
    }
    else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') {
      window.open('/organization/videoplay/' + log._id)
    }
  }

  clearprevious() {
    this.videourl = ''
  }
 // Opening URL mismatch popup
 urlMismatch()
 {
    this.isloading = false
    this.router.navigate(["/"], {skipLocationChange: true})
 }
 showviewdetails(element){
  this.sharingPeoples=[] 
  this.auditdata=[]
  this.folderfiles=[]
  this.documentLogs=[]
  this.id = element._id
  if (element.isFile) {
    this.type ='File'
    this.getDocumentDetails('');
  } else {
    this.type='Folder'
    this.getFolderDetails('');
    
  }

}

  
// Event is triggered on video end
videoEnded()
{
  this.replayButton=true;
  this.playButton=false;
  this.pauseButton=false;
}
// Event is triggered on video Pause

videoPause()
{
  this.replayButton=false;
  this.playButton=true;
  this.pauseButton=false;
}
// Event is triggered on video Play

videoPlay()
{
  this.replayButton=false;
  this.playButton=false;
  this.pauseButton=true;
}

  /**
   * Function name : showMoreFields
   * Input : sharingpeople, type(show, hide)
   * Desc : toggle data fields.
   */
  showMoreFields(signerdata, type) {
      this.displaySigners.forEach(element => {
        if (element._id == signerdata._id) {
          element.fieldsValues = this.allFields.filter(x => (((x.insertedemail == element.toemail) || (x.people == element.toemail)) && x.ownerField == false && x.type != 'label'));
          if (type == 'hide') {
            element.fieldsValues = element.fieldsValues.filter(x => (x.type == "initial" || x.type == "signature" || x.type == "Photo" || x.type == "Stamp"))
          }

        }
      });
    
  }
  /**
   * Function name : pushToPath
   * Input : file or Folder element
   * Desc : show name as breadcrumbs
   */
  pushToPath(element){
    this.path.push(element)
  }
   /**
   * Function name : removeFromPath
   * Input : file or Folder element
   * Desc : remove name from breadcrumbs
   */
  removeFromPath(element){
    var i = this.path.findIndex(x => x._id == element._id);
    this.path.splice(i + 1, this.path.length)
    this.id=element._id
    if(element.isFile){
      this.type="File"
      this.getDocumentDetails('file');
    }else{
      this.type='Folder'
      this.getFolderDetails('folder');
    }
  }
    /**
   * Function name : locationback
   * Input : {}
   * Desc : navigate back to previous page
   */
  locationback(){
    history.back();
  }
}
