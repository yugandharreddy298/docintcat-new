import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { FrontEndConfig } from './frontendConfig';
import { Subject, Observable } from 'rxjs'

export enum FileQueueStatus {
  Pending,
  Success,
  Error,
  Progress,
  Complete,
}

export class FileQueueObject {
  public file: any;
  public id: any = Math.random()
  public status: FileQueueStatus = FileQueueStatus.Pending;
  public progress: number = 0;
  public completeall: number = 0;
  public count: number = 0;
  public request: Subscription = null;
  public response: HttpResponse<any> | HttpErrorResponse = null;
  public responsedata: any;
  public responsefile: any;
  public type: any
  public size: any

  constructor(file: any) {
    this.file = file;
  }

  // actions
  public upload = () => { /* set in service */ };
  public cancel = () => { /* set in service */ };
  public remove = () => { /* set in service */ };

  // statuses
  public isPending = () => this.status === FileQueueStatus.Pending;
  public isSuccess = () => this.status === FileQueueStatus.Success;
  public isComplete = () => this.status === FileQueueStatus.Complete;
  public isError = () => this.status === FileQueueStatus.Error;
  public inProgress = () => this.status === FileQueueStatus.Progress;
  public isUploadable = () => this.status === FileQueueStatus.Pending || this.status === FileQueueStatus.Error;
}

@Injectable({
  providedIn: 'root'
})

export class FileuploadService {

  public totalfilesize: any;
  public remTime: any;
  private subject = new Subject<any>();
  private Response = new Subject<any>();
  private singleResponse = new Subject<any>();
  private _queue: BehaviorSubject<FileQueueObject[]>;
  private _files: FileQueueObject[] = [];
  count = 0;
  index: number;
  errorOnUpload: boolean = false
  serverurl = this.frontendconfig.getserverurl();
  progress
  url: any;
  array1;
  continue: boolean = true
  testingdata
  private filesData = new Subject<any>();
  private openModalvalue = new Subject<any>();

  constructor(private http: HttpClient,
    public frontendconfig: FrontEndConfig) {
    this._queue = <BehaviorSubject<FileQueueObject[]>>new BehaviorSubject(this._files);
  }


  // Sending uploaded status to subject to continue the process
  sendUploadSuccess(message: any) {
    this.subject.next(message);
  }

  // get subject observable data
  getUploadSuccess(): Observable<any> {
    return this.subject.asObservable();
  }

  // Sending uploaded response to Response to continue the process
  sendUploadresponse(data: any) {
    this.Response.next(data);
  }

  // get Response observable data
  getUploadResponse(): Observable<any> {
    return this.Response.asObservable();
  }

  // get singleResponse observable data
  oncomplete_Singlefile() {
    return this.singleResponse.asObservable()
  }

  // get the queue
  public get queue() {
    return this._queue.asObservable();
  }

  // public events
  public onCompleteItem(queueObj: FileQueueObject, response: any): any {
    if (queueObj.isComplete) {
      this.singleResponse.next(queueObj)
    }
  }

  // add file to the queue
  public addToQueue(data: any) {
    _.each(data, (file: any) => this._addToQueue(file));
  }

  // clear the queue
  public clearQueue() {
    this._files = [];
    this._queue.next(this._files);
  }

  // remove the queue
  public removequeue() {
    this._files = []
    this._queue.asObservable()
  }

  // upload all except already successfull or in progress

  public uploadAll = async function () {
    var queueObj: FileQueueObject
    console.log(this._files)
   if(this._files) this.filesData.next(this._files)
    for (queueObj of this._files) {
      if (!queueObj.count) {
        var result = await this._upload(queueObj);
        if (result.progress == 0 && queueObj.status == 2) {
          this.index = this._files.indexOf(queueObj);
          return false
        }
      }
    }
  }
  openModal(msg)
  {
    this.openModalvalue.next(msg);
  }
  getopenModal(): Observable<any> {
    return this.openModalvalue.asObservable();
  }
  //It will take message as input and retuen the same for the next
  sendFilesUpload(message) {
    this.filesData.next(message);
  }
  // It will retuen subject data
  getFilesUpload(): Observable<any> {
    console.log(this.filesData)
    return this.filesData.asObservable();
  }

  // Continue the process for the data, which are in queue
  continueQueue = async function () {
    var queueObj: FileQueueObject
    var checkarray
    checkarray = Object.assign([], this._files)
    console.log(queueObj)
    checkarray.splice(0, this.index + 1)
    for (queueObj of checkarray) {
      if (!queueObj.isSuccess()) {        
        var result = await this._upload(queueObj);
        if (result.progress == 0 && queueObj.status == 2) {
          this.index = this._files.indexOf(queueObj);
          return false
        }
      }
      else return false
    }
  }

  // push to the queue/Adding uploaded file to queue
  public _addToQueue(file: any) {
    console.log(file)
    const queueObj = new FileQueueObject(file);
    var filetype = queueObj.file.name.split('.')
    queueObj.type = filetype[filetype.length - 1]
    queueObj.size = (queueObj.file.size / 1024) / 1024
    queueObj.upload = () => this._upload(queueObj);
    queueObj.remove = () => this._removeFromQueue(queueObj);
    queueObj.cancel = () => this._cancel(queueObj);
    this._files.push(queueObj);
    this._queue.next(this._files);
  }

  // Copying file
  makecopy(id) {
    var data = { id: id }
    return this.http.post(this.serverurl + '/api/documents/makecopy', data)
  }

  // Copying multiple file
  multimakecopy(data) {
    var obj = {
      files: data
    }
    return this.http.post(this.serverurl + '/api/documents/multimakecopy', obj)
  }

  // Remove file from queue
  private _removeFromQueue(queueObj: FileQueueObject) {
    _.remove(this._files, queueObj);
  }

  // create form data for file
  private _upload(queueObj: FileQueueObject) {
    return new Promise(async (resolve, reject) => {
      const form = new FormData();
      if (queueObj.type == 'pdf') form.append("type", 'application/pdf')
      if (queueObj.type == 'doc') form.append("type", "application/msword")
      if (queueObj.type == 'docx') form.append("type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      if (queueObj.file.parentid) form.append("folderid", queueObj.file.parentid);
      else if (queueObj.file.folderid) form.append("folderid", queueObj.file.folderid);
      if ((queueObj.type == 'pdf' || queueObj.type == 'doc' || queueObj.type == 'docx') && queueObj.size <= 10) {
        if (queueObj.file.resultFileName)
          form.append("uploads[]", queueObj.file, queueObj.file.resultFileName);
        else
          form.append("uploads[]", queueObj.file, queueObj.file.name);
        // upload file and report progress
        let req = new HttpRequest('POST', this.serverurl + '/api/documents/', form, {
          reportProgress: true,
        });
        queueObj.request = this.http.request(req).subscribe(
          (event: any) => {
            queueObj.count = 1
            if (event.type === HttpEventType.UploadProgress) {
              this._uploadProgress(queueObj, event);
            } else if (event instanceof HttpResponse) {
              var res: any = queueObj.response;

              this._uploadComplete(queueObj, event);
              this.array1--;
              if (!this.array1) {
                if (this.errorOnUpload) setTimeout(() => { this.sendUploadSuccess(this._files) }, 60000)
                else setTimeout(() => { this.sendUploadSuccess(this._files) }, 5000)
              }
              resolve(queueObj)
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // A client-side or network error occurred. Handle it accordingly.
              this._uploadFailed(queueObj, err);
            } else {
              // The backend returned an unsuccessful response code.
              this._uploadFailed(queueObj, err);
            }
          }
        );
      }
      else {
        this.errorOnUpload = true
        this.array1--;
        if (!this.array1) {
          if (this.errorOnUpload) setTimeout(() => { this.sendUploadSuccess(this._files) }, 60000)
          else setTimeout(() => { this.sendUploadSuccess(this._files) }, 6000)
        }
        resolve(queueObj)
      }
    })
  }

  // update the FileQueueObject as cancelled
  private async _cancel(queueObj: FileQueueObject) {
      var index = this._files.indexOf(queueObj);
      queueObj.request.unsubscribe();
      queueObj.progress = 0;
      queueObj.status=FileQueueStatus.Error;
      this._queue.next(this._files);
       queueObj=this._files[index+1];
       for (var i=index+1; i<=this._files.length ;i++) {
        queueObj=this._files[i]
        await this.checkfileinqueue(queueObj)
        if ( queueObj && !queueObj.count) {
          var result :any = await this._upload(queueObj);
          if (result.progress == 0 && queueObj.status == 2) {
            this.index = this._files.indexOf(queueObj);
            return false
          }
        }
  
       }
  }
checkfileinqueue(queueObj,){
  for(var i; i<=this._files.length; i++){
    if(queueObj && queueObj.progress==100){
      queueObj=this._files[i];
    this._queue.next(this._files);
      break;
     }else if(queueObj && queueObj.progress==0 && !queueObj.isError()){
      queueObj=this._files[i]; 
    this._queue.next(this._files);
      break;
     }else if(queueObj && (queueObj.isSuccess || queueObj.isError())){
       queueObj=this._files[i++]
    this._queue.next(this._files);
       continue;
     }
   }
}
  // update the FileQueueObject with the current progress
  private _uploadProgress(queueObj: FileQueueObject, event: any) {
    var progress = Math.round(100 * event.loaded / event.total);
    progress = Math.round(progress - progress * (10 / 100))
    if (progress < 0) progress = 0
    queueObj.progress = progress;
    queueObj.status = FileQueueStatus.Progress;
    this._queue.next(this._files);
  }

  // update the FileQueueObject as completed
  private _uploadComplete(queueObj: FileQueueObject, response: HttpResponse<any>) {
    queueObj.progress = 100;
    queueObj.status = FileQueueStatus.Success;
    queueObj.response = response.body;
    queueObj.responsedata = response.body.Message;
    queueObj.responsefile = response.body.files;
    if (queueObj.responsedata === "PDF is password protected, please enter password") {
      queueObj.status = 2
      queueObj.progress = 0;
      this.continue = false
      this.errorOnUpload = true
      this.sendUploadresponse(queueObj);
    }
    else {
      this._queue.next(this._files);
      this.onCompleteItem(queueObj, response.body);
    }
  }

  // update the FileQueueObject as errored
  private _uploadFailed(queueObj: FileQueueObject, response: HttpErrorResponse) {
    queueObj.progress = 0;
    queueObj.status = FileQueueStatus.Error;
    queueObj.response = response;
    this._queue.next(this._files);
  }

  // to remove password after file uploading
  passwordremover(data) {
    var data1 = {
      file: data.file.responsefile,
      password: data.password,
      folderid: undefined,
    }
    if (data.file.file.folderid != undefined) data1.folderid = data.file.file.folderid
    this.http.post(this.serverurl + '/api/documents/passwordcheck', data1, { reportProgress: true, observe: 'events' })
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this._files.forEach(x => {
            if (x.id == data.file.id) {
              let response: HttpResponse<any> = event
              x.status = FileQueueStatus.Success;
              x.response = response.body;
              x.responsedata = response.body.Message;
              x.responsefile = response.body.files;
              if (x.responsedata == "Please check your password") {
                x.status = 2
                x.progress = 0;
                this.sendUploadresponse(x);
              }
              else {
                this._uploadComplete(x, event);
                this.continueQueue()
              }
            }
          })
        }
      });
    return data
  }

  // uploading file via url 
  urlcontent(value) {
    return this.http.post(this.serverurl + '/api/documents/url', value)
  }

  // file upload from one drive
  onedriveurlcontent(value) {
    return this.http.post(this.serverurl + '/api/documents/onedrive', value)
  }

}



