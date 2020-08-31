import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FileQueueObject, FileuploadService } from '../../fileupload.service';
import { Observable } from 'rxjs/Observable';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { UserService } from '../../user.service';
declare var $: any;

@Component({
  selector: 'app-common-dialog',
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.css']
})

export class CommonDialogComponent implements OnInit {

  constructor(public userService: UserService,
    private router: Router,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<CommonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogdata,
    public uploader: FileuploadService) {
  }

  queue: Observable<FileQueueObject[]>;
  private modals: any[] = [];
  header: boolean
  renameerrorshow = false
  folderName: string;
  filesToUpload: any;
  documentdata: any
  profileData: any
  filedata: any
  show = false
  hide = false
  percentDone: any;
  folderdata: any;
  delete = false
  makecopy = false
  deleteAll = false
  show1 = false
  show2 = false
  requestlogin = false
  trashdelete = false
  restore = false
  restore1 = false
  delete1 = false
  exitdialog = false
  folder1 = false
  fields: boolean = false
  deletefolder = false
  sharesubmit: boolean = false
  expired: boolean = false
  videorecord = false
  protection: boolean = false
  dependency: boolean = false
  errorshow: boolean = false
  errorshow1: boolean = false
  deletedepartment: boolean = false
  watermark: boolean = false
  sharetonew: boolean = false
  newfilename: boolean = false
  notregister: boolean = false
  aiauthenticate: boolean = false
  needToBlockAccount: boolean = false
  DisplayContent
  mobilelinkexpire: boolean = false
  NameContent;
  foldererror = false;
  invaliderror = false;
  leavepage=false;
  ngOnInit() {
    $('div.cdk-overlay-container').removeClass('checking');
    if (this.dialogdata.name == 'Rename') {
      this.header = true
      this.show = false
      this.delete = false
      this.delete1 = false
      this.fields = false
      this.makecopy = false
      this.deleteAll = false
      this.deletefolder = false
      this.renameerrorshow = true
      this.show1 = true
      this.expired = false
      this.videorecord = false
      this.protection = false
      this.dependency = false
      this.errorshow1 = false
      this.sharetonew = false
      this.newfilename = false
      this.notregister = false
      this.mobilelinkexpire = false
      this.aiauthenticate = false
      this.needToBlockAccount = false
      var rename = this.dialogdata.folder.name.split('.')
      this.folderName = rename[0];
      setTimeout(() => {
        $("#renamefield").focus();
        $("#renamefield").select();

      }, 500);
    }
    else if (this.dialogdata.name == 'create') {
      this.header = false
      this.show = false
      this.delete1 = false
      this.fields = false
      this.deletefolder = false
      this.delete = false
      this.makecopy = false
      this.deleteAll = false
      this.exitdialog = false
      this.renameerrorshow = false
      this.errorshow1 = true
      this.sharesubmit = false
      this.expired = false
      this.videorecord = false
      this.protection = false
      this.dependency = false
      this.sharetonew = false
      this.newfilename = false
      this.notregister = false
      this.mobilelinkexpire = false
      this.aiauthenticate = false
      this.needToBlockAccount = false
      setTimeout(() => {
        $("#CreateNewFolder").focus();
      }, 500);
    }
    else if (this.dialogdata.name == 'Folderupload') {
      this.header = false
      this.show = true
      this.delete = false
      this.delete1 = false
      this.fields = false
      this.deletefolder = false
      this.makecopy = false
      this.deleteAll = false
      this.renameerrorshow = false
      this.sharesubmit = false
      this.expired = false
      this.videorecord = false
      this.protection = false
      this.dependency = false
      this.sharetonew = false
      this.newfilename = false
      this.notregister = false
      this.mobilelinkexpire = false
      this.aiauthenticate = false
      this.needToBlockAccount = false
    }
    else if (this.dialogdata.name == 'DeleteTemplate') {
      this.delete = true
      this.makecopy = false;
    }
    else if (this.dialogdata.name == 'delete') {
      this.delete = true
      this.delete1 = false
      this.deletefolder = false
    }
    else if (this.dialogdata.name == 'delete1') {
      this.delete1 = true
    }
    else if (this.dialogdata.name == 'deletedepartment') {
      this.deletedepartment = true

    }
    else if (this.dialogdata.name == 'exitdialog') {
      this.exitdialog = true;
      this.makecopy = false;
    }
    else if (this.dialogdata.name == 'deletefolder') {
      this.deletefolder = true
    }

    else if (this.dialogdata.name == 'deleteMultiFilesandFolders') {
      this.deletefolder = true
    }
    else if (this.dialogdata.name == 'deleteMultiFiles') {
      this.deletefolder = true
    }
    else if (this.dialogdata.name == 'deleteMultiFolders') {
      this.deletefolder = true
    }
    else if (this.dialogdata.name == 'makecopy') {
      this.makecopy = true
    }
    else if (this.dialogdata.name == 'trashdelete') {
      this.trashdelete = true
    }
    else if (this.dialogdata.name == 'restore') {
      this.restore = true
    }
    else if (this.dialogdata.name == 'restore1') {
      this.restore1 = true
    }
    else if (this.dialogdata.name == 'requestlogin') {
      this.requestlogin = true
    }
    else if (this.dialogdata.name == 'fields') {
      this.fields = true
    }
    else if (this.dialogdata.name == 'sharesubmit') {
      this.sharesubmit = true
    }
    else if (this.dialogdata.name == 'expired') {
      this.expired = true
    }
    else if (this.dialogdata.name == 'videorecord') {
      this.videorecord = true
    }
    else if (this.dialogdata.name == 'protection') {
      this.protection = true
    }
    else if (this.dialogdata.name == 'dependency') {
      this.dependency = true
    }
    else if (this.dialogdata.name == 'sharetonew') {
      this.sharetonew = true
    }
    else if (this.dialogdata.name == 'newfilename') {
      this.newfilename = true
    }
    else if (this.dialogdata.name == 'notregister') {
      this.notregister = true
    }
    else if (this.dialogdata.name == "aiauthenticate" || this.dialogdata.name === 'FileRename' || this.dialogdata.name === 'FolderRename' || this.dialogdata.name === 'TemplateRename') {
      this.aiauthenticate = true
      if (this.dialogdata.name === "aiauthenticate") {
        this.DisplayContent = 'Are you sure want to continue with facial authentication?'
      } else if (this.dialogdata.name === 'TemplateRename') {
        this.NameContent = 'There is already a ' + this.dialogdata.name.split('R')[0] + ' with the same name'
        if (this.dialogdata.newName) {
          this.DisplayContent = 'Do you want to rename to ' + this.dialogdata.newName + '?'
        } else {
          this.DisplayContent = 'Do you want to continue' + '?'
        }
      } else {
        this.DisplayContent = 'Do you want to rename ' + this.dialogdata.oldName + ' to ' + this.dialogdata.newName + '?'
        this.NameContent = 'There is already a ' + this.dialogdata.name.split('R')[0] + ' with the same name in this location'
      }
    }
    else if (this.dialogdata.name == "needtoblockaccount") {
      this.needToBlockAccount = true
      if (this.dialogdata.blockMsg) this.DisplayContent = this.dialogdata.blockMsg
      else this.DisplayContent = 'Are you sure want to continue'
    }
    else if (this.dialogdata.name == "mobilelinkexpire") {
      this.mobilelinkexpire = true
    }
    else if(this.dialogdata.name=='leavepage'){
      this.leavepage=true;
    }
  }

  /**
   * Function name : CreateFolder
   * Input : folder, event
   * Output : createFolderDialogClose method will be called.
   * Desc : createFolderDialogClose method will be called when user clicks enter.
   */
  CreateFolder(folder, event) {
    if (this.folderName && this.folderName.length > 0 && event.key == 'Enter') {
      this.createFolderDialogClose(folder)
    }
  }

  /**
   * Function name : createFolderDialogClose
   * Input : folder1
   * Output : Valid folder name will be sent.
   * Desc : Checks whether given folder name is valid or not, if it is valid, it will sent. If not error will be thrown.
   */
  createFolderDialogClose(folder1) {
    if (folder1.invalid) this.foldererror = true;
    if (folder1.valid) {
      this.errorshow = false;
      this.errorshow1 = false;
      if (folder1.value != undefined) this.dialogRef.close(this.folderName);
    }
    if (folder1.value == undefined) {
      this.errorshow = true;
      this.errorshow1 = true;
    }
  }

  /**
   * Function name : renameFolderDialogClose
   * Input : folder1
   * Output : Valid folder name will be sent.
   * Desc : Checks whether given folder name is valid or not, if it is valid, it will sent. If not error will be thrown.
   */
  renameFolderDialogClose(folder1) {
    if (folder1.invalid) this.invaliderror = true
    if (folder1.valid) {
      this.errorshow = false;
      this.errorshow1 = false;
      if (folder1.value != undefined) this.dialogRef.close(this.folderName);
    }
    if (folder1.value == undefined) {
      this.errorshow = true;
      this.errorshow1 = true;
    }
  }

  /**
  * Function name : open
  * Input : content
  * Output : Content will be sent
  * Desc : Content will be sent
  */
  open(content) {
    this.modalService.open(content);
  }

  /**
  * Function name : rqstlogin
  * Input : null
  * Output : Navigate to Login page
  * Desc : Navigate to Login page when user clicks on 'Login'
  */
  rqstlogin() {
    this.router.navigate(['/']);
  }

  /**
  * Function name : Passwordsubmit
  * Input : Password
  * Output : Password will be sent, if it is valid
  * Desc : Password will be sent, if it is valid 
  */
  Passwordsubmit(Password) {
    if (Password.valid) this.dialogRef.close(Password.value.Password);
  }

  /**
  * Function name : filenamesubmit
  * Input : filename
  * Output : filename will be sent, if it is valid
  * Desc : filename will be sent, if it is valid 
  */
  filenamesubmit(filename) {
    if (filename.valid) this.dialogRef.close(filename.value.Filename);
  }

  /**
  * Function name : onNoClick
  * Input : null
  * Output : 'restore' will be sent
  * Desc : 'restore' will be sent
  */
  onNoClick(): void {
    this.dialogRef.close('restore');
  }

  /**
   * Function name : closeTemplateDialogue
   * Input : null
   * Output : 'DeletedTemplate' will be sent
   * Desc : 'DeletedTemplate' will be sent
   */
  closeTemplateDialogue(): void {
    this.dialogRef.close('DeletedTemplate');
  }

}



