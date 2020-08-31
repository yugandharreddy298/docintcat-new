import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import * as _ from 'lodash';
import { FrontEndConfig } from './frontendConfig';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { saveAs } from 'file-saver';

export enum FileQueueStatus {
  Pending,
  Success,
  Error,
  Progress,
  Complete
}

@Injectable({
  providedIn: 'root'
})

export class DocumentService {

  serverurl = this.frontendconfig.getserverurl();
  folders
  progress
  isPending
  isSuccess = 0
  isError
  inProgress = true
  i = 1;
  array1;
  starturl
  private subject = new Subject<any>();

  constructor(private http: HttpClient,
    private frontendconfig: FrontEndConfig,
    public snackBar: MatSnackBar) { }

  // It will recieve starturl and storing in starturl variable
  sendStartUrl(starturl) {
    this.starturl = starturl
  }

  // It will return starturl
  getStartUrl() {
    return this.starturl
  }

  // It will take message as input and retuen the same for the next
  sendFileData(message) {
    this.subject.next(message);
  }

  // It will retuen subject data
  getFileData(): Observable<any> {
    return this.subject.asObservable();
  }

  // Result of particular SharedRecord Password
  checkpassword(password: any) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/checkpassword/' + password)
  }

  // create a document for draganddrop file
  savedragedFiles(queueObj: any) {
    return this.http.post(this.serverurl + '/api/documents/dragcreate', queueObj)
  }

  // Creates a new document in the document collection
  saveFiles(queueObj: any) {
    const req = new HttpRequest('POST', this.serverurl + '/api/documents', queueObj, {
      reportProgress: true,
    });
    return this.http.request(req)
  }

  // Get list of fields for document with specific version
  getCurrentVersionDocFields(data) {
    return this.http.post(this.serverurl + '/api/fieldoption/CurrentVersionDocFields/', data)
  }

  // Get list of documents
  getuserfiles() {
    return this.http.get(this.serverurl + '/api/documents/')
  }

  // remove document from document collection,docimages collection and from S3 server
  getDeleteFiles(id) {
    return this.http.get(this.serverurl + '/api/documents/getDeleteFiles/' + id)
  }

  // create SharedRecords
  sharing(data) {
    return this.http.post(this.serverurl + '/api/sharingpeoples', data)
  }

  // Request Shared Document information
  getsharingpeople(id) {
    if (id._id)
      return this.http.get(this.serverurl + '/api/sharingpeoples/getsharingpeople/' + id._id)
    else
      return this.http.get(this.serverurl + '/api/sharingpeoples/getsharingpeople/' + id)
  }
  // Request Shared Document information of folder

  getfoldersharingRecord(id){
    return this.http.get(this.serverurl + '/api/sharingpeoples/getfoldersharingpeople/' + id)

  }

  // Get latest 6 records from document collection
  recentfiles() {
    return this.http.get(this.serverurl + '/api/documents/recentfiles/')
  }

  // encrypt url
  encryptedvalues(data) {
    return this.http.post(this.serverurl + '/api/documents/encrypt/', data)
  }

  // decrypt url
  decryptedvalues(data) {
    return this.http.post(this.serverurl + '/api/documents/decrypt/', data)
  }

  // Request Shared  Document  information
  getsharingdocs() {
    return this.http.get(this.serverurl + '/api/sharingpeoples/')
  }

  // Request emails of shared  information
  getSharePeopleEmails() {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getSharePeopleEmails/')
  }

  // Request Passwords SharedRecords
  decryptfileid(id) {
    var v = { 'id': id }
    return this.http.post(this.serverurl + '/api/sharingpeoples/fileid', v)
  }

  // Revoking a document
  RevokeFile(doc) {
    return this.http.get(this.serverurl + '/api/documents/revokeFile/' + doc)
  }

  // Checking revocation status of a document
  checkRevokeFileStatus(doc) {
    return this.http.get(this.serverurl + '/api/documents/checkRevokeFileStatus/' + doc)
  }

  // Request Passwords SharedRecords
  decryptfileid1(id) {
    var v = { 'id': id }
    return this.http.post(this.serverurl + '/api/sharingpeoples/fileid1', v)
  }

  // create Folder Douments
  createfolder(folderdetail) {
    return this.http.post(this.serverurl + '/api/folders', folderdetail)
  }

  // Request folder  Documents  information 
  getparentfolders(id) {
    return this.http.get(this.serverurl + '/api/folders/getparentfolders/' + id)
  }

  // get folder information
  getfolder() {
    return this.http.get(this.serverurl + '/api/folders')
  }

  // changing active status in sharingpeople
  deletefolder(delete_element) {
    if (delete_element.isFile) return this.http.put(this.serverurl + '/api/documents/deletefile/' + delete_element._id, delete_element)
    else return this.http.put(this.serverurl + '/api/folders/deletefolder/' + delete_element._id, delete_element)
  }

  // Request to delete SharedRecords
  multiShareFolderDelete(sharefolders) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/multiFolder/ShareDelete/', sharefolders)
  }

  // update multiple files active status
  multiFileDelete(files) {
    return this.http.post(this.serverurl + '/api/documents/multiFileDelete/', files)
  }

  // Request to delete selected folders
  multiFolderDelete(folders) {
    return this.http.post(this.serverurl + '/api/folders/multiFolderDelete/', folders)
  }

  // Request to update selected folders
  multiselectmove(data) {
    return this.http.post(this.serverurl + '/api/folders/multiselectmove/', data)
  }

  // Request to delete permanantly selected folders
  multiselect_Permenant_Delete(data) {
    return this.http.post(this.serverurl + '/api/folders/multiselect_Permenant_Delete/', data)
  }

  // Get deleted files and folders
  trashfiles() {
    return this.http.get(this.serverurl + '/api/documents/trashbin/')
  }

  // Request to search the deleted files and folders
  trashfolders() {
    return this.http.get(this.serverurl + '/api/folders/trashbin/')
  }

  // Request to delete folders permanantly
  folderDeletion(id, del) {
    var data = { id: id, value: del }
    return this.http.post(this.serverurl + '/api/folders/permanentFolderDeletion/', data)
  }

  // To extract the files from zip 
  downloadfiles(file) {
    location.href = this.serverurl + '/api/documents/downloadfiles/' + file._id
  }

  // upload a zip file
  saveZipfiles(file: any) {
    return this.http.post(this.serverurl + '/api/documents/zipuploads', file)
  }

  // extract Zip file
  extractZipfiles(event) {
    const req = new HttpRequest('POST', this.serverurl + '/api/documents/extractzipfiles', event, {
      reportProgress: true,
    });
    return this.http.request(req);
  }

  // removing file/folder from bin
  deleteBin(doc) {
    if (doc.isFile) return this.http.delete(this.serverurl + '/api/documents/' + doc._id)
    else return this.http.delete(this.serverurl + '/api/folders/' + doc._id)
  }

  // Update  particular file/folder document while moving
  updatefolderOnMove(update) {
    if (update.element.isFolder) {
      return this.http.put(this.serverurl + '/api/folders/move/update/' + update.element._id, update)
    }
    else {
      return this.http.put(this.serverurl + '/api/documents/move/update/' + update.element._id, update)
    }
  }

  // Update  particular file/folder document
  updatefolder(update) {
    if (update.isFolder) {
      return this.http.put(this.serverurl + '/api/folders/' + update._id, update)
    }
    else {
      return this.http.put(this.serverurl + '/api/documents/' + update._id, update)
    }
  }

  // restore deleted document
  updatefolder1(update) {
    return this.http.post(this.serverurl + '/api/documents/restore', update)
  }

  // restore deleted folder
  restorefolder(update) {
    return this.http.post(this.serverurl + '/api/folders/restore', update)
  }

  // delete multiple files from sentfile 
  multipleRemovesent(data) {
    return this.http.put(this.serverurl + '/api/documents/multiple/remove/sentfiles', data)
  }

  // Request to delete files/folders in sent items 
  updatesentfolder(update) {
    if (update.isFolder) {
      return this.http.put(this.serverurl + '/api/folders/removeSentFolder/' + update._id, update)
    }
    else {
      return this.http.put(this.serverurl + '/api/documents/removeSentFile/' + update._id, update)
    }
  }

  // update document in DB
  updatefiledata(file) {
    return this.http.put(this.serverurl + '/api/documents/check/' + file._id, file)
  }

  // Request Shared  Document  information
  getfilepassword(id) {
    return this.http.get(this.serverurl + '/api/sharpingpeoples/' + id)
  }

  //get shared floderfiles
  getfolderfiles(id) {
    return this.http.get(this.serverurl + '/api/documents/' + id)
  }

  //get all folders for move tp
  getallfolders() {
    return this.http.get(this.serverurl + '/api/folders/getallfolders/')
  }

  // get selected documents
  getSelectedDoc(id,type) {
    console.log(id)
    if(type == 'Allowusers')
    return this.http.get(this.serverurl + '/api/documents/' + id)
    else if(type == 'public')
    return this.http.get(this.serverurl + '/api/documents/publicdoc/' + id)
  }

  //get shared floders data
  getfolderdetails(id) {
    return this.http.get(this.serverurl + '/api/folders/' + id)
  }

  // update document
  upload(files) {
    return this.http.post(this.serverurl + '/api/documents', files)
  }

  // to check whether folder exists or not
  isFolderIsExist(data) {
    return this.http.post(this.serverurl + '/api/folders/isFolderIsExist', data)
  }

  // Update individual SharedRecords
  sharingupdate(doc) {
    return this.http.put(this.serverurl + '/api/sharingpeoples/' + doc._id, doc)
  }

  // Getting the HTML file content.
  getFileContent(content) {
    return this.http.get(this.serverurl + '/api/documents/getcontent/' + content)
  }

  // Update All SharedRecords
  RemoveShareduser(doc) {
    return this.http.delete(this.serverurl + '/api/sharingpeoples/' + doc._id)
  }

  // snack bar to show message to user
  openSnackBar(message, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['bar-color'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  // snack bar to show message to user
  openActionSnackBar(message, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['bar-color'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',

    });
  }

  // Creates a new fieldoption.
  saveFieldOptions(data) {
    return this.http.post(this.serverurl + '/api/fieldoption/', data);
  }

  // Get a single fieldoption
  getFileReviewContent(id) {
    return this.http.get(this.serverurl + '/api/fieldoption/' + id)
  }

  // Creates a new fieldoption
  emailsearch(email) {
    return this.http.post(this.serverurl + '/api/fieldoption/emailcheck', email);
  }

  // updates fieldvalues.
  updateFieldValues(data) {
    return this.http.post(this.serverurl + '/api/fieldvalues/updateFieldValues', data);
  }

  // Get list fieldvalues for specific document
  getFieldValues(data) {
    return this.http.post(this.serverurl + '/api/fieldvalues/getvalues/', data)
  }

  // Get a related document all fieldvalue records
  getDocFieldValueRecords(data) {
    return this.http.post(this.serverurl + '/api/fieldvalues/getDocFieldValueRecords/', data)
  }

  // Request to Shared Document information
  getSharedDoc(id) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getSharedDoc/' + id)
  }

  // Get a single document record
  getDocumentRecord(id) {
    return this.http.get(this.serverurl + '/api/documents/getDocumentRecord/' + id)
  }

  // Request Shared  Document  information
  getpass(id) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/' + id)
  }

  // Creates a new signature in the DB.
  saveSignatureimages(selectedFiles: any) {
    return this.http.post(this.serverurl + '/api/signatures/', selectedFiles)
  }

  // Creates a new photo in the DB.
  savePhotoimages(selectedFiles: any) {
    return this.http.post(this.serverurl + '/api/photos/', selectedFiles)
  }

  // Creates a new stamp in the DB.
  saveStampimages(selectedFiles: any) {
    return this.http.post(this.serverurl + '/api/stamps/', selectedFiles)
  }

  // get Selected document record
  publicgetSelectedDoc(id) {
    return this.http.get(this.serverurl + '/api/documents/publicdoc/' + id)
  }

  // create version
  saveVersion(data) {
    return this.http.post(this.serverurl + '/api/versions/', data)
  }

  // Request All versions information
  getAllDocVersions(docId) {
    return this.http.get(this.serverurl + '/api/versions/AllDocVersions/' + docId)
  }

  // creates a new fieldlogs
  createfieldlogs(data) {
    return this.http.post(this.serverurl + '/api/documentlogs/fieldlogs/', data)
  }

  // creates a new fieldlogs on Bulk amount
  createBulkFieldLogs(data) {
    return this.http.post(this.serverurl + '/api/documentlogs/createBulkFieldLogs/', data)
  }

  // Get list of fields for document with specific version
  getCurrentVersionDocFieldOptions(data) {
    return this.http.post(this.serverurl + '/api/fieldoption/CurrentVersionDocFields/', data)
  }

  // Get list of fields with values for document with specific version
  getCurrentVersionDocFieldWithValues(data) {
    return this.http.post(this.serverurl + '/api/fieldoption/versionDocfieldvalues/', data)
  }

  // updates fieldvalues in DB
  updateSharedFieldsValue(data) {
    return this.http.post(this.serverurl + '/api/fieldvalues/updateSharedFields', data)
  }

  // Update individual Version document
  editVersionName(data) {
    return this.http.put(this.serverurl + '/api/versions/' + data._id, data)
  }

  // Get a related document all current version fieldvalue records
  getCurrentVersionDocFieldValues(data) {
    return this.http.post(this.serverurl + '/api/fieldvalues/getCurrFieldVal', data)
  }

  // Request to Shared Document information
  getCurVerSharedPeopleList(data) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/getCurVerSharedPeopleList/', data)
  }

  // Update Current Version Shared People List
  updateDocVersionInSharedPeople(data) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/updateCurVerSharedPeopleList/', data)
  }

  // Get list of current user signatures
  ListOfSignatures(email) {
    return this.http.get(this.serverurl + '/api/signatures/' + email)
  }

  // Get list of current user Initials
  ListOfInitials(email) {
    return this.http.get(this.serverurl + '/api/signatures/initialList/' + email)
  }

  // Get list of current user photos
  ListOfPhotos(email) {
    return this.http.get(this.serverurl + '/api/photos/' + email)
  }

  // Get list of current user stamps
  ListOfStamps(email) {
    return this.http.get(this.serverurl + '/api/stamps/' + email)
  }

  // Creates a new mobilelink and sending.
  sendingLink(data) {
    return this.http.post(this.serverurl + '/api/mobilelinks/', data)
  }

  // Get list of mobilelinks
  getMobileLink(id) {
    return this.http.get(this.serverurl + '/api/mobilelinks/' + id)
  }

  // Updates an existing mobilelink
  updateMobileLink(data) {
    return this.http.put(this.serverurl + '/api/mobilelinks/' + data._id, data)
  }

  // Creates a new signature from mobilelink
  saveSignatureFromMobileLink(data) {
    return this.http.post(this.serverurl + '/api/signatures/createfrommobilelink/', data)
  }

  // creating photo, when we upload from mobile
  savePhotoFromMobileLink(data) {
    return this.http.post(this.serverurl + '/api/photos/createfrommobilelink/', data)
  }

  // Creates a new stamp from mobilelink
  saveStampFromMobileLink(data) {
    return this.http.post(this.serverurl + '/api/stamps/createfrommobilelink/', data)
  }

  // Creates a new documentlogs of upload video in the DB.
  uploadVideo(formdata) {
    return this.http.post(this.serverurl + '/api/documentlogs/uploadvideo/', formdata)
  }

  // Updates an existing signature for the setDefault/setDelete signature.
  setSignatureDefaultSettings(data) {
    return this.http.put(this.serverurl + '/api/signatures/setDefaultSetting/' + data._id, data)
  }

  // Updates an existing photo for the setDefault/setDelete photo.
  setPhotoDefaultSettings(data) {
    return this.http.put(this.serverurl + '/api/photos/setDefaultSetting/' + data._id, data)
  }

  // Updates an existing stamp for the setDefault/setDelete stamp.
  setStampDefaultSettings(data) {
    return this.http.put(this.serverurl + '/api/stamps/setDefaultSetting/' + data._id, data)
  }

  // get default signature
  getDefaultSignature(data) {
    return this.http.post(this.serverurl + '/api/signatures/getDefault/' + data.email, data)
  }

  // get default photo
  getDefaultPhoto(id) {
    return this.http.get(this.serverurl + '/api/photos/getDefault/' + id)
  }

  // get default stamp
  getDefaultStamp(id) {
    return this.http.get(this.serverurl + '/api/stamps/getDefault/' + id)
  }

  // Creates a bottlenecks to the photo
  bottlenecksCreationForPhoto(data) {
    return this.http.post(this.serverurl + '/api/photos/bottlenecksCreation/', data)
  }

  // Creates a new comment in the DB.
  postcomments(data) {
    return this.http.post(this.serverurl + '/api/comments/', data)
  }

  // updating outside comments
  postcommentsoutside(data) {
    return this.http.post(this.serverurl + '/api/comments/postcommentsoutside', data)
  }

  // get list of comments
  getcomments(data) {
    return this.http.post(this.serverurl + '/api/comments/getcomments/', data)
  }

  // updating comments
  deletecomments(data, title) {
    var v = { id: data, status: title }
    return this.http.post(this.serverurl + '/api/comments/commentupdate', v)
  }

  // updating comments for a particular document
  editcomments(data) {
    var comment = {
      comment: data.comment
    }
    return this.http.put(this.serverurl + '/api/comments/' + data.documentid, comment)
  }

  // storing recievers comments
  replycomments(data) {
    return this.http.post(this.serverurl + '/api/comments/replycomments/', data)
  }

  // storing outside recievers comments in DB
  replycommentsoutside(data) {
    return this.http.post(this.serverurl + '/api/comments/replycommentsoutside/', data)
  }

  // Request to folder information 
  getnavigationfolder(id) {
    return this.http.get(this.serverurl + '/api/folders/getnavigationfolder/' + id)
  }

  // updating sharing people record
  deleteshared(id) {
    return this.http.delete(this.serverurl + '/api/sharingpeoples/' + id)
  }

  // Creates a new documentlogs
  savemousemovement(data) {
    return this.http.post(this.serverurl + '/api/documentlogs/', data)
  }

  // Get selected signature
  getSignature(id) {
    return this.http.get(this.serverurl + '/api/signatures/getsignature/' + id)
  }

  // Get selected stamp
  getStamp(id) {
    return this.http.get(this.serverurl + '/api/stamps/getstamp/' + id)
  }

  // Get selected photo
  getPhoto(id) {
    return this.http.get(this.serverurl + '/api/photos/getphoto/' + id)
  }

  // Get selected document logs
  getDocumentLogs(doc) {
    return this.http.get(this.serverurl + '/api/documentlogs/' + doc._id)
  }

  // Get document logs
  getSingleLog(id) {
    return this.http.get(this.serverurl + '/api/documentlogs/getSingleLog/' + id);
  }

  // Request Shared Document audit log information
  getSharingPeoples(doc) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getsharingpeople/auditlog/' + doc)
  }

  //  To download original file
  DownloadDocInAuditLog(doc) {
    return this.http.get(this.serverurl + '/api/documents/Download/OriginalPDF/' + doc._id).subscribe((data: any) => {
      var data1 = this.serverurl + '/uploads/' + data.path;
      saveAs(data1, doc.name);
    })
  }

  // Creates a new favorite in the DB.
  createfavorite(data) {
    return this.http.post(this.serverurl + '/api/favorites/', data)
  }

  // Get list of favorites
  getfavorites() {
    return this.http.get(this.serverurl + '/api/favorites/')
  }

  // Updates an existing favorite
  removefavorite(data) {
    return this.http.delete(this.serverurl + '/api/favorites/' + data._id)
  }


  // Get partcular selected favorite
  getparticularfavorite(data) {
    return this.http.get(this.serverurl + '/api/favorites/' + data)
  }

  // upload file from google drive
  googleupload(file) {
    return this.http.post(this.serverurl + '/api/documents/googledrive', file)
  }

  // get selected template
  getSelectedTemplate(data) {
    return this.http.get(this.serverurl + '/api/fieldoption/getSelectedTemplate/' + data)
  }

  // Get list templates for specific user
  gettempltes() {
    return this.http.get(this.serverurl + '/api/fieldoption/gettempltes')
  }

  // Updates an existing fieldoption
  edittemplate(data) {
    return this.http.put(this.serverurl + '/api/fieldoption/' + data._id, data)
  }

  // ovveride template
  overridetemplate(data) {
    return this.http.put(this.serverurl + '/api/fieldoption/overridetemplate/' + data._id, data)
  }

  // Request to search the deleted folders
  searchfolders(data) {
    return this.http.post(this.serverurl + '/api/folders/searchfiles/', data)
  }

  // Request to search the deleted files
  searchfiles(data) {
    return this.http.post(this.serverurl + '/api/documents/searchfiles/', data)
  }

  // search a file or folder from given text
  searchdocuments(searchdata) {
    return this.http.post(this.serverurl + '/api/documents/searchdocuments/', searchdata)
  }

  // Request all sent folders
  getSentDocs() {
    return this.http.get(this.serverurl + '/api/folders/getSentDocs/sent')
  }

  // get logs data
  documentlogs(apiname, newcoords) {
    return this.http.post(this.serverurl + apiname, newcoords)
  }

  // It will take endpoint as input and gives api response depends on Input API
  search(api, data) {
    return this.http.post(this.serverurl + '/api/' + api, data);
  }

  // It will take endpoint as input and gives api response depends on Input API
  getSearch(api) {
    return this.http.get(this.serverurl + '/api/' + api);
  }

  // It will take endpoint as input and gives api response depends on Input API
  put(api, data) {
    return this.http.put(this.serverurl + '/api/' + api, data)
  }

  // To dowload pdf 
  pdfDownload(downData) {
    return this.http.post(this.serverurl + '/api/documents/pdfDownload/', downData);
  }

  // To dowload pdf 
  pdfPrint(filedata) {
    var printdata: any = {
      id: filedata._id
    }
    return this.http.post(this.serverurl + '/api/documents/pdfDownload/', printdata)
  }

  // To dowload pdf 
  newCompletedDocImgs(data) {
    return this.http.post(this.serverurl + '/api/documents/pdfDownload/', data)
  }

  // Request folder Documents information
  getFolderRecord(id) {
    return this.http.get(this.serverurl + '/api/folders/folder/info/' + id)
  }

  // Get list of docimages
  getDocumentImages(id) {
    return this.http.get(this.serverurl + '/api/docimages/getDocumentImages/' + id);
  }

  // Removing Deocument and Folder data
  deleteAllFilesFolder() {
    return this.http.delete(this.serverurl + '/api/folders/filesFolder/delete');
  }

  // making multi files as favourites
  multiFavorite(data) {
    return this.http.post(this.serverurl + '/api/favorites/multifavorite', data);
  }

  // multishare Request to multishare of file
  multisharing(data) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/multishare', data);
  }

  // verification of document
  verifydocument(data) {
    return this.http.post(this.serverurl + '/api/documents/verifydocument/', data)
  }

  // Get all documents for specific user
  getFolderFiles(folderid) {
    return this.http.get(this.serverurl + '/api/documents/getFolderFiles/' + folderid)
  }

  // It will return device data
  getdevice(data) {
    return this.http.post(this.serverurl + '/api/documentlogs/getdevice', data)
  }

  // Get a single document log based on message
  getDocumentSingleLog(data) {
    return this.http.post(this.serverurl + '/api/documentlogs/getDocumentSingleLog/', data)
  }

  // updating sharing people record
  updateSharingpeopleRecord(data) {
    return this.http.patch(this.serverurl + '/api/sharingpeoples/' + data._id, data)
  }

  // to get files an folders
  getFoldersAndFiles(docId) {
    return this.http.get(this.serverurl + '/api/folders/getFoldersAndFiles/' + docId)
  }
 
  // to check Whether folder is Empty or not
  isEmptyfolder(folderid) {
  return this.http.get(this.serverurl + '/api/folders/isEmptyfolder/' + folderid)
}
editTemplateDoc(pageNo,templatename)
{
  var data = {pageNo:pageNo,templatename:templatename}
  return this.http.post(this.serverurl + '/api/documents/editTemplateDoc/',data)
}
isFilenameExits(filedata)
{
  return this.http.post(this.serverurl + '/api/documents/isFilenameExits/',filedata)

}
getVideoLog(id){
return this.http.get(this.serverurl+'/api/documentlogs/getVideoLog/'+id)
}
// It will take message as input and retuen the same for the next
sendnotificationData(message) {
  console.log(message)
  this.subject.next(message);
}

// It will retuen subject data
getnotificationData(): Observable<any> {
  return this.subject.asObservable();
}
}


