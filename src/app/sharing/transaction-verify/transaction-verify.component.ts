import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from "@angular/router";
import { DocumentService } from '../../document.service';
import * as _moment from 'moment';
import { UserService } from '../../user.service';

const moment = (_moment as any).default ? (_moment as any).default : _moment;

@Component({
  selector: 'app-transaction-verify',
  templateUrl: './transaction-verify.component.html',
  styleUrls: ['./transaction-verify.component.css']
})

export class TransactionVerifyComponent implements OnInit, OnDestroy {

  id: any;
  type: any;
  valueRecord: any
  data: any;
  content: any;
  valid;
  notvalid;
  documentid
  logdata
  log
  encrtptid
  encrtpttype
  encrtptdocid
  loggedIn
  profiledata
  userEmail
  clearintervaldata

  constructor(public userservice: UserService, 
    public activatedroute: ActivatedRoute, 
    private router: Router, 
    public documentservice: DocumentService) {
    var urldata = this.router.url.split('/');
    this.encrtptid = urldata[4];
    this.encrtptdocid = urldata[5];
    this.encrtpttype = urldata[3];
  }

  ngOnInit() {
    this.loggedIn = localStorage.getItem('loggedIn')
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'));
    if (this.encrtptid && this.encrtpttype && this.encrtptdocid) {
      var data = { id: this.encrtptid, type: this.encrtpttype, docid: this.encrtptdocid }
      this.documentservice.decryptedvalues(data).subscribe((data: any) => {
        if (data) {
          this.id = data.id;
          this.type = data.type
          this.documentid = data.docid
        }
        if (this.id)
          this.securityverify();
        if (this.documentid)
          this.docLogs();
      })
    }
    if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
      this.clearintervaldata = setInterval(() => {
        this.ccb();
      }, 100);
    }
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
   * Function name : docLogs
   * Input : null
   * Output : Log deatils
   * Desc : To get log details.
   */
  docLogs() {
    var doc = { _id: this.documentid }
    this.documentservice.getDocumentLogs(doc).subscribe(data => {
      this.logdata = data
      if (data) {
        if (this.type == "signature" || this.type == "initial" || this.type == "Signature" || this.type == "Initial")
          this.log = this.logdata.find(x => x.signatureId == this.id);
        if (this.type == "Stamp") this.log = this.logdata.find(x => x.stampId == this.id);
        if (this.type == "Photo") this.log = this.logdata.find(x => x.photoId == this.id);
      }
    });
  }

  /**
   * Function name : securityverify
   * Input : null
   * Output : Expiry date checking.
   * Desc : We are checking with the type for expiry date.
   */
  async securityverify() {
    if (this.type == "signature" || this.type == "initial" || this.type == "Signature" || this.type == "Initial") {
      await this.documentservice.getSignature(this.id).subscribe((res: any) => {
        this.valueRecord = res;
        this.verify();
      });
    } else if (this.type == "Stamp") {
      await this.documentservice.getStamp(this.id).subscribe(res => {
        this.valueRecord = res;
        this.verify();
      });
    } else if (this.type == "Photo") {
      await this.documentservice.getPhoto(this.id).subscribe(res => {
        this.valueRecord = res;
        this.verify();
      });
    }
  }

  

  /**
   * Function name : verify
   * Input : null
   * Output : Validation
   * Desc : To check expiry date for the fields.
   */
  verify() {
    var time = moment().format();
    if (time >= this.valueRecord.expirydate) this.notvalid = true;
    else this.valid = true;
  }

  /**
   * Function name : navigatetofiles
   * Input : null
   * Output : Navigation to myfiles page.
   * Desc : To navigate to myfiles page, when user clicks on docintact image.
   */
  navigatetofiles() {
    if (this.loggedIn && this.profiledata && this.profiledata.email && this.log) {
      this.userEmail = this.userservice.decryptData(this.profiledata.email);
      if (this.userEmail == this.log.email) {
        this.router.navigate(['/home/myfiles/']);
      } else {
        this.router.navigate(['/']);
      }
    }
    else {
      this.router.navigate(['/']);
    }
  }

}
