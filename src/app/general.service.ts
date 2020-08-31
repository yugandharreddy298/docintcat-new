import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import * as socketIo from 'socket.io-client';
import { Socket } from './shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { FrontEndConfig } from "./frontendConfig"
import { DocumentService } from './document.service';
import { CommonDialogComponent } from 'src/app/public/common-dialog/common-dialog.component';
import { MatDialog } from '@angular/material';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})

export class GeneralService {

  type
  outsideUserSocket: Socket;
  observer: any
  // For getting the backend server URL
  serverurl = this.frontendconfig.getserverurl();
  profiledata: any;
  userType: any;
  userid : any;
  useremail : any;
  constructor(private http: HttpClient,
    private router: Router,
    private frontendconfig: FrontEndConfig, 
    public documentservice: DocumentService,
    public dialog: MatDialog,
    private userService: UserService) {
    if (localStorage.getItem('loggedIn') == 'true') {
    }
  }
  // Socket connection
  Connectsocket(type): Observable<number> {
    Observable.create(observer => {
      this.observer = observer;
    });
    if (type.type == 'connect') {
      this.outsideUserSocket = socketIo(this.serverurl);
    }
    if (type.type == 'disconnect') {
      this.outsideUserSocket.emit("onDisconnect", '')
    }
    return this.createObservable();
  }

  //  when user sending data for contact us, will send notification to our end mail
  contact(user) {
    return this.http.post(this.serverurl + '/api/users/contact', user);
  }

  // When any save change in 'comment' detects, the method will get called
  newCommentReceived() {
    let observable = new Observable<any>(observer => {
      this.outsideUserSocket.on('comment:save', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  // When any save change in 'chat' detects, the method will get called
  newChatReceivedRefresh() {
    let observable = new Observable<any>(observer => {
      if (this.outsideUserSocket) {
        this.outsideUserSocket.on('chat:save', (data) => {
          observer.next(data);
        });
      }
    });
    return observable;
  }

  // When any save change in 'onlineuser' detects, the method will get called
  onlineUserRefresh() {
    let observable = new Observable<any>(observer => {
      this.outsideUserSocket.on('onlineuser:save', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  // create an observerable
  createObservable(): Observable<number> {
    return new Observable<number>(observer => {
      this.observer = observer;
    });
  }

  // For setting of token in local storage
  setUserLoggedIn(data) {
    var userToken = data
    localStorage.setItem('currentUser', JSON.stringify(userToken))
  }

  // To make the token null and logout the user
  logout() {
    var userToken = { 'token': null }
    localStorage.setItem('currentUser', JSON.stringify(userToken))
    this.router.navigate(['/']);
  }

  // For user Login 
  checkLogin(user) {
    return this.http.post(this.serverurl + '/auth/local', user);
  }

  // Google login
  googlelogin() {
    return this.http.get(this.serverurl + '/auth/google');
  }

  // Notification creation
  createnotification(i) {
    return this.http.post(this.serverurl + '/api/notifications/', i);
  }
  createnotificationForChat(data){
    return this.http.post(this.serverurl + '/api/notifications/createnotificationForChat/', data);

  }
  // Get list of notifications
  getnotification() {
    return this.http.get(this.serverurl + '/api/notifications/');
  }

  // get all the active notifications
  getOfflinenotification() {
    return this.http.get(this.serverurl + '/api/notifications/getOfflinenotification/');
  }

  //  get selected notifications
  getnotificationbyId(id) {
    return this.http.get(this.serverurl + '/api/notifications/' + id);
  }

  // update notification
  markedread(i) {
    return this.http.put(this.serverurl + '/api/notifications/' + i._id, i)
  }

  // clearing notifications
  clearAllNotifications(i) {
    var title
    if(i.title == 'chat') title = 'chat'
    else if(i.title == 'notification') title = 'notification'
    var i1 = {
      title :title
    }
    return this.http.post(this.serverurl + '/api/notifications/clearAll/Notifications', i1);
  }

  // clearing notifications
  clearAllNotificationsactive(i) {
    i = {};
    return this.http.post(this.serverurl + '/api/notifications/clearAllNotificationsactive', i);
  }

  // get the count for notifications
  countNotifications() {
    return this.http.get(this.serverurl + '/api/notifications/count/');
  }

  // create online users
  onlineuser(log) {
    return this.http.post(this.serverurl + '/api/onlineusers', log);
  }

  // get list of online users
  GetonlineUsers(doc) {
    return this.http.get(this.serverurl + '/api/onlineusers/' + doc);
  }

  // Updating document logs data
  updatetime(documentlog, endtime) {
    documentlog.endTime = endtime
    return this.http.put(this.serverurl + '/api/documentlogs/' + documentlog._id, documentlog)
  }

  // Updating online users data
  offline(Data) {
    Data.viewStatus = false
    return this.http.put(this.serverurl + '/api/onlineusers/' + Data._id, Data);
  }
    /**
   * Function name : NotificationNavigate
   * Input{object}: notification record
   * Output : navigate to respective file or folder when click on respective notification
   */
  NotificationNavigate(data,fileid){   
    
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'));
    this.userType = this.userService.decryptData(this.profiledata.type);
    this.userid = this.userService.decryptData(this.profiledata.id);
    this.useremail = this.userService.decryptData(this.profiledata.email);
    localStorage.removeItem('currentpath')
    if(data.type=="submit" || data.type=="closed" || data.type=="reviewed"){
      if(data.documentid && data.documentid._id){
        if(data&& data.documentid.active){
          var sampledata ={
            fileid:data.documentid._id
          }
          const dialogRef = this.dialog.open(CommonDialogComponent, {
            data: { name: 'leavepage'},
            disableClose: false, width: '500px', panelClass: 'deletemod'
          });
          dialogRef.afterClosed().subscribe(res => {
            if(res){
              this.documentservice.encryptedvalues(sampledata).subscribe((data:any)=>{
                if (this.userType == 'individual'){
                  this.router.navigate(['individual/filecont/'+data.encryptdata]);
                }else if (this.userType == 'organisation' || this.userType == 'employee'){
                  this.router.navigate(['organization/filecont/'+data.encryptdata]);
                }
              })
            }
          }); 
        }else{
          this.documentservice.openSnackBar("Document doesn't exists", "X");
        }

      }
    } else if(data.type=="Shared"){
      if(data.documentid && data.documentid._id && data.sharingPeopleId && data.sharingPeopleId.active){
        var encryptdata = {
          sharedid: data.sharingPeopleId._id,
          fileid: data.documentid._id
        }
        const dialogRef = this.dialog.open(CommonDialogComponent, {
          data: { name: 'leavepage'},
          disableClose: false, width: '500px', panelClass: 'deletemod'
        });
        dialogRef.afterClosed().subscribe(res => {
          if(res){
        this.documentservice.encryptedvalues(encryptdata).subscribe((data: any) => {
          if(data.sharedid &&data.fileid ){
            if (this.userType == 'individual') this.router.navigate(['/individual/sharereview/' + data.sharedid + '/' + data.fileid]);
            else if (this.userType == 'organisation' || this.userType== 'employee') this.router.navigate(['/organization/sharereview/' + data.sharedid + '/' + data.fileid]);
          }  
        })
      }
    })
        
      } else if(data.documentid && data.sharingPeopleId && !data.sharingPeopleId.active){
        this.documentservice.openSnackBar("Sharing Access Removed by Owner", "X");
      } 
      if (data.folderid && data.sharingPeopleId && data.sharingPeopleId.active){
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'leavepage'},
      disableClose: false, width: '500px', panelClass: 'deletemod'
    });

    dialogRef.afterClosed().subscribe(res => {
      if(res){
        var folderid ={
          fileid:data.folderid._id,
          sharedid:data.sharingPeopleId._id
        } 

        
        this.documentservice.encryptedvalues(folderid).subscribe((encrypt:any)=>{
        localStorage.setItem('folder', encrypt.sharedid)

          if (this.userType == 'individual'){
            this.router.navigate(['individual/home/shareddocument/'+encrypt.fileid]);
          }else if (this.userType == 'organisation' || this.userType == 'employee'){
            this.router.navigate(['organization/home/shareddocument/'+encrypt.fileid]);
          }

        })
      }})
      }else if(data.folderid && data.sharingPeopleId && !data.sharingPeopleId.active){
        this.documentservice.openSnackBar("Sharing Access Removed by Owner", "X");
      }
      if(!data.documentid && !data.folderid && data.fromEmail){
        this.documentservice.openSnackBar("Document Deleted By Shared Owner", "X");

      }
    }else  if(data.type=="chat"){
      sessionStorage.setItem("chatid", data.documentid._id);
      if(fileid && data.documentid && data.documentid._id && data.documentid._id == fileid){
      }
      else{
        if(data&& data.documentid.active){
          var sampledata ={
            fileid:data.documentid._id
          }
          const dialogRef = this.dialog.open(CommonDialogComponent, {
            data: { name: 'leavepage'},
            disableClose: false, width: '500px', panelClass: 'deletemod'
          });
          dialogRef.afterClosed().subscribe(res => {
            if(res){
              this.documentservice.encryptedvalues(sampledata).subscribe((encrypteddata:any)=>{
                console.log(encrypteddata)
                if(data.documentid.uid ==  this.userid){
                  if (this.userType == 'individual'){
                    this.router.navigate(['individual/filecont/'+encrypteddata.encryptdata]);
                  }else if (this.userType == 'organisation' || this.userType == 'employee'){
                    this.router.navigate(['organization/filecont/'+encrypteddata.encryptdata]);
                  }
                }
                else 
                {
                  this.getsharingDocumentForchat(data).subscribe((shareddata:any) =>{
                    console.log(shareddata)
                    if(shareddata && shareddata.active && shareddata._id){
                      var sampledata ={
                        fileid:shareddata._id
                      }
                      this.documentservice.encryptedvalues(sampledata).subscribe((encryptedsharedrecord:any)=>{
                      if (this.userType == 'individual') this.router.navigate(['/individual/sharereview/' + encryptedsharedrecord.encryptdata + '/' + encrypteddata.encryptdata]);
                      else if (this.userType == 'organisation' || this.userType== 'employee') this.router.navigate(['/organization/sharereview/' + encryptedsharedrecord.encryptdata + '/' + encrypteddata.encryptdata]);
                      })  
                    } else {

                    this.documentservice.openSnackBar("Sharing  doesn't exists", "X");
                    sessionStorage.removeItem("chatid")

                    }
                  })  
                }
               
                // this.documentservice.sendnotificationData(data);

              })
            }
            else{
              sessionStorage.removeItem("chatid")
            }
          }); 
    }else{
     if(sessionStorage.getItem("chatid")) sessionStorage.removeItem("chatid")
      this.documentservice.openSnackBar("Document doesn't exists", "X");
    }
  }
}
  }

  getsharingDocumentForchat(data)
  {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getsharedDocumet/'  +data.documentid._id+'/'+data.toemail)
  }
}
