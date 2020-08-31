import {
    Injectable
} from '@angular/core';
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { UserService } from './user.service';
import { GeneralService } from './general.service';
import { DocumentService } from './document.service';
import { MatDialog } from '@angular/material';
import { CommonDialogComponent } from 'src/app/public/common-dialog/common-dialog.component';


@Injectable()
export class PushNotificationsService {
    public permission: Permission;
    constructor(private router: Router, private userservice: UserService, private generalservice: GeneralService,private documentservice :DocumentService,private dialog: MatDialog,) {
        this.permission = this.isSupported() ? 'default' : 'denied';
    }
    public isSupported(): boolean {
        return 'Notification' in window;
    }
    // Ask notification permission to browser
    requestPermission(): void {
        let self = this;
        if ('Notification' in window) {
            Notification.requestPermission(function (status) {
                return self.permission = status;
            });
        }
    }
    profile: any
    chatdoc: any
    chatres: any
    profiledata:any;
    create(title: string, options?: PushNotification): any {
        let self = this;

        return new Observable(function (obs) {
            let _notify

            if (!('Notification' in window)) {
                obs.complete();
            }
            // check browser permission for notifications
            if (self.permission !== 'granted') {
                Notification.requestPermission().then(function (result) {
                    _notify = new Notification(title, options);
                });
                obs.complete();
            }
            else {
                console.log(options)
                _notify = new Notification(title, options);
                self.userservice.getProfile().subscribe(data => {
                    self.profile = data;
                    /**
                    * Function name : getnotification
                    * Input : {String} login userid
                    * Output :{array} notifications of particular user
                    * Desc : get notifications from notification collection
                    */
                    self.generalservice.getnotification().subscribe(result => {

                        var messages: any = result;
                        for (const message of messages) {
                            if (message.toid && message.toid._id == self.profile._id && !message.read && message.type == 'Share' && message.active == true) {
                                message.read = true;
                            }
                            if (message.fromid && message.fromid._id == self.profile._id && !message.read && message.type == 'submit' && message.active == true) {
                                message.read = true;
                            }
                            if (message.fromid && message.fromid._id == self.profile._id && !message.read && message.type == 'closed' && message.active == true) {
                                message.read = true;
                            }
                            if (message.fromid && message.fromid._id == self.profile._id && !message.read && message.type == 'reviewed' && message.active == true) {
                                message.read = true;
                            }
                        }
                    });

                })
            }

            _notify.onshow = function (e) {
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclick = function (e) {
                _notify.close();
              console.log(_notify.data)
                if(_notify && _notify.data && _notify.data.type=='Shared'){
                  if(_notify.data.sharingPeopleId  && _notify.data.sharingPeopleId.active && _notify.data.documentid){
                    var encryptdata = {
                      sharedid:_notify.data.sharingPeopleId._id,
                      fileid: _notify.data.documentid
                    }
                    const dialogRef = self.dialog.open(CommonDialogComponent, {
                      data: { name: 'leavepage'},
                      disableClose: false, width: '500px', panelClass: 'deletemod'
                    });
                    dialogRef.afterClosed().subscribe(res => {
                      if(res){
                    self.documentservice.encryptedvalues(encryptdata).subscribe((data: any) => {
                      if(data.sharedid &&data.fileid ){
                        if (self.profile.type == 'individual'){
                          self.router.navigate(['/individual/sharereview/' + data.sharedid + '/' + data.fileid]);
                        } 
                        else if (self.profile.type == 'organisation' || self.profile.type== 'employee'){
                          self.router.navigate(['/organization/sharereview/' + data.sharedid + '/' + data.fileid]);
                        } 
                      }  
                    })
                  }
                })   
                  } 
                  else if(_notify.data.sharingPeopleId  && !_notify.data.sharingPeopleId.active && _notify.data.sharingPeopleId.fileid){
                    self.documentservice.openSnackBar("Sharing Access Removed by Owner", "X");
                  } 
                  if (_notify.data.sharingPeopleId  && _notify.data.sharingPeopleId.active && _notify.data.sharingPeopleId.folderid){
                const dialogRef = self.dialog.open(CommonDialogComponent, {
                  data: { name: 'leavepage'},
                  disableClose: false, width: '500px', panelClass: 'deletemod'
                });
                dialogRef.afterClosed().subscribe(res => {
                  if(res){
                    var folderid ={
                      fileid:_notify.data.folderid
                    } 
                    self.documentservice.encryptedvalues(folderid).subscribe((encrypt:any)=>{
                      if (self.profile.type == 'individual'){
                        self.router.navigate(['individual/home/shareddocument/'+encrypt.encryptdata]);
                      }else if (self.profile.type== 'organisation' || self.profile.type == 'employee'){
                        self.router.navigate(['organization/home/shareddocument/'+encrypt.encryptdata]);
                      }
            
                    })
                  }})
                  }else if(_notify.data.sharingPeopleId  &&! _notify.data.sharingPeopleId.active && _notify.data.sharingPeopleId.folderid){
                    this.documentservice.openSnackBar("Sharing Access Removed by Owner", "X");
                  }
                    
                } 
               else if(_notify && _notify.data && _notify.data.type=='closed' && _notify.data.active){
               
                        var sampledata ={
                          fileid:_notify.data.documentid
                        }
                        const dialogRef = self.dialog.open(CommonDialogComponent, {
                            data: { name: 'leavepage'},
                            disableClose: false, width: '500px', panelClass: 'deletemod'
                          });
                          dialogRef.afterClosed().subscribe(res => {
                            if(res){
                            self.documentservice.encryptedvalues(sampledata).subscribe((data:any)=>{
                              if (self.profile && self.profile.type== 'individual'){
                                self.router.navigate(['individual/filecont/'+data.encryptdata]);
                              }else if (self.profile.type == 'organisation' || self.profile.type == 'employee'){
                                self.router.navigate(['organization/filecont/'+data.encryptdata]);
                              }
                            })
                          }
                        })

                } 
                else if(_notify && _notify.data && _notify.data.type=='submit' && _notify.data.active){
                    var sampledata ={
                        fileid:_notify.data.documentid
                      }
                      const dialogRef = self.dialog.open(CommonDialogComponent, {
                        data: { name: 'leavepage'},
                        disableClose: false, width: '500px', panelClass: 'deletemod'
                      });
                      dialogRef.afterClosed().subscribe(res => {
                        if(res){
                          self.documentservice.encryptedvalues(sampledata).subscribe((data:any)=>{
                            if (self.profile && self.profile.type== 'individual'){
                              self.router.navigate(['individual/filecont/'+data.encryptdata]);
                            }else if (self.profile.type == 'organisation' || self.profile.type == 'employee'){
                              self.router.navigate(['organization/filecont/'+data.encryptdata]);
                            }
                          })
                        } 
                    });  
                } 
                else if(_notify && _notify.data && _notify.data.type=='reviewed' && _notify.data.active){
                    var sampledata ={
                        fileid:_notify.data.documentid
                      }          
                      const dialogRef = self.dialog.open(CommonDialogComponent, {
                        data: { name: 'leavepage'},
                        disableClose: false, width: '500px', panelClass: 'deletemod'
                      });
                      dialogRef.afterClosed().subscribe(res => {
                        if(res){
                          self.documentservice.encryptedvalues(sampledata).subscribe((data:any)=>{
                            if (self.profile && self.profile.type== 'individual'){
                              self.router.navigate(['individual/filecont/'+data.encryptdata]);
                            }else if (self.profile.type == 'organisation' || self.profile.type == 'employee'){
                              self.router.navigate(['organization/filecont/'+data.encryptdata]);
                            }
                          })
                        }
                    });
                } else if(_notify && _notify.data && _notify.data.type=="chat" && _notify.data.active){
               
                  var sampledata ={
                    fileid:_notify.data.documentid
                  }
                  const dialogRef = self.dialog.open(CommonDialogComponent, {
                      data: { name: 'leavepage'},
                      disableClose: false, width: '500px', panelClass: 'deletemod'
                    });
                    dialogRef.afterClosed().subscribe(res => {
                      if(res){
                      self.documentservice.encryptedvalues(sampledata).subscribe((data:any)=>{
                        if (self.profile && self.profile.type== 'individual'){
                          self.router.navigate(['individual/filecont/'+data.encryptdata]);
                        }else if (self.profile.type == 'organisation' || self.profile.type == 'employee'){
                          self.router.navigate(['organization/filecont/'+data.encryptdata]);
                        }
                      })
                    }
                  })
          } 
            };
            _notify.onerror = function (e) {
                return obs.error({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclose = function () {
                return obs.complete();
            };
        });
    }
    // set options for notification
    generateNotification(source: Array<any>): void {
        console.log(source)
        let self = this;
        source.forEach((item) => {
            let options = {
                body: item.alertContent,
                icon: "assets/images/Group2244.png",
                data: item.data,
        
            };
            let notify = self.create(item.title, options).subscribe();
        })
    }
}
export declare type Permission = 'denied' | 'granted' | 'default';
export interface PushNotification {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    renotify?: boolean;
    silent?: boolean;
    sound?: string;
    noscreen?: boolean;
    sticky?: boolean;
    dir?: 'auto' | 'ltr' | 'rtl';
    lang?: string;
    vibrate?: number[];
    document?:any;
}