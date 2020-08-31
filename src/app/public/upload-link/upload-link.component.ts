import { Component, OnInit, HostListener } from '@angular/core';
import { DocumentService } from '../../document.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
@Component({
  selector: 'app-upload-link',
  templateUrl: './upload-link.component.html',
  styleUrls: ['./upload-link.component.css']
})
export class UploadLinkComponent implements OnInit {

  constructor(private documentService: DocumentService,
    public activatedroute: ActivatedRoute,
    private http: HttpClient,
    public dialog: MatDialog) {
    this.getLocation();
  }

  signatureImage = null;
  paramid;
  mobileLinkData;
  imageFile
  isOpenPad: boolean = true;
  pencolor = '#000000'
  openCrop: boolean = false;
  submitted: boolean = false;
  expired: boolean = false;
  sample: String = 'mobileclearbtn'
  windowWidth: any;
  isloader = false;
  latitude: any;
  longitude: any;
  sharedRecord: any;
  locationInfo: any;
  signatureValidation: any
  croppedImage: any = '';
  cropimageData: any
  filesToUpload
  savedPhoto
  authenticate: Boolean = false
  authIput
  camLoaderSuccess: Boolean = false
  camLoaderFail: Boolean = false
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
  };
  public errors: WebcamInitError[] = [];
  // latest snapshot
  public webcamImage: WebcamImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  windowouterWidth = window.outerWidth
  @HostListener('window:resize', ['$event'])

 // Emits the active deviceId after the active video device has been switched.
  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }
 //  An Observable to trigger image capturing. When it fires, an image will be captured and emitted 
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  //Can be used to cycle through available cameras (true=forward, false=backwards), or to switch to a specific device by deviceId (string)
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  // triggers snapshot
  public triggerSnapshot(): void {
    this.trigger.next();
  }
  // toggle webcam on/off
  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  // Handle camera errors
  public handleInitError(error: WebcamInitError): void {
    var err;
    if (error.message.includes('Requested device not found') || error.message.includes('The object can not be found here.') || error.message.includes('Invalid constraint')) err = 'Camera not found'
    else if (error.message.includes('Permission dismissed')) err = 'Camera Permission dismissed'
    else if (error.message.includes('Permission denied') || error.message.includes('The request is not allowed by the user agent or the platform in the current context.') || error.message.includes('The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.')) err = 'Camera Permission denied'
    else if (error.message.includes('Could not start video source') || error.message.includes('Starting video failed')) err = 'Already camera running for other purpose'
    else if (error.message.includes('Only secure origins are allowed')) err = 'Only secure origins are allowed the camera'
    else if (error.message.includes('Mediainterface does not support') || !navigator.mediaDevices) err = "Your browser doesn't support MediaInterface to acces webcam"
    else err = error.message
    this.showWebcam = false
    if (err) this.documentService.openActionSnackBar(err, 'X')
    this.errors = []
    this.errors.push(error);
  }
  // true => move forward through devices
  // false => move backwards through devices
  // string => move to device with given deviceId
  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }
  // Assign image capture data to webcamImage variable
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        var query = this.latitude + ',' + this.longitude
      }, error => {
        this.latitude = this.locationInfo.latitude;
        this.longitude = this.locationInfo.longitude;
      });
    }
    if (window.innerWidth <= 820) this.windowWidth = window.outerWidth - 60;
    this.paramid = this.activatedroute.snapshot.paramMap.get("id");
    this.documentService.getMobileLink(this.paramid).subscribe((data: any) => {
      if (data && data.expired) this.expired = true
      else if (data) this.mobileLinkData = data;
    }, error => {
      this.documentService.openSnackBar(error, 'X')
    });
    this.getLocation();
  }

// set preview image width based on windowwidth
  onResize(event) {
    if (window.innerWidth <= 820) {
      if (this.mobileLinkData && (this.mobileLinkData.type == 'signature' || this.mobileLinkData.type == 'initial')) {
        if (!this.openCrop && this.windowouterWidth != window.outerWidth) {
          this.clearsign()
          this.windowouterWidth = window.outerWidth
        }
        this.windowWidth = window.outerWidth - 60;
      }
    }
  }

//To clear signature when window width is resized
  back() {
    this.openCrop = false;
    if (this.windowouterWidth != window.outerWidth) {
      this.clearsign()
      this.windowouterWidth = window.outerWidth
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));

      }, 100);
    }
  }

  // to set pencolor in signature pad
  colorcodefun(x) {
    this.pencolor = x
    this.isOpenPad = false;
    this.signatureValidation = null
    setTimeout(() => {
      this.isOpenPad = true;
      this.clearsign()
    }, 10);
  }

// To get location
  getLocation() {
    this.http.get('https://freegeoip.app/json/').subscribe((data: any) => {
      this.locationInfo = data;
    })
  }

  // Preview of signature from signature pad
  showImage(data) {
    if (this.signatureValidation && this.signatureValidation.length > 0) this.signatureImage = data;
  }

  // cropping of image
  imageCropped(event: ImageCroppedEvent) {
    this.cropimageData = event
    this.croppedImage = event.base64;
  }

// Image loading failed
  loadImageFailed() {
    this.documentService.openSnackBar('Choose only image file', 'X')
  }

  // To clear signature when window is resized
  clearsign() {
    this.signatureImage = null;
    this.cropimageData = null;
    this.croppedImage = null;
    this.signatureValidation = null
    this.signatureValidation = false
  }

// To show cropping on image
  signatureNext(title) {
    if (this.signatureImage) this.openCrop = true
    else this.documentService.openSnackBar('Draw Your ' + title, 'X')
  }
// call savePhoto/signatureSubmit/stampSubmit based on type
  Save() {
    if (this.mobileLinkData) {
      if (this.mobileLinkData.type == 'photo') this.savePhoto()
      else if (this.mobileLinkData.type == 'signature' || this.mobileLinkData.type == 'initial') this.signatureSubmit()
      else if (this.mobileLinkData.type == 'stamp') this.stampSubmit()
    }
    else
      this.documentService.openSnackBar('Link is expired', 'X')
  }

  /**
   * Function name : signatureSubmit
   * Input : field,title
   * Output :{json} created signature
   * Desc : save signature in signature collection
   */
  signatureSubmit() {
    this.isloader = true
    if (this.signatureImage && this.croppedImage && this.mobileLinkData) {
      var signatureData = { signdata: this.cropimageData, type: "signaturepad", signtype: this.mobileLinkData.type, email: this.mobileLinkData.email }
      this.documentService.saveSignatureimages(signatureData).subscribe((data: any) => {
        if (data) {
          this.mobileLinkData.signatureId = data._id;
          this.mobileLinkData.signaturebaseData = data.signaturebaseData;
          this.mobileLinkData.signatureType = data.type;
          this.mobileLinkData.pemFilePath = data.pemFilePath
          this.documentService.updateMobileLink(this.mobileLinkData).subscribe(res => {
            this.submitted = true;
            this.signatureImage = null;
            this.cropimageData = null;
            this.isloader = false;
            if (!this.locationInfo) {
              this.http.get('https://jsonip.com').subscribe(data => {
                this.locationInfo = data
              })
            }
            if (this.locationInfo) this.mobileLinkData.IpAddress = (this.locationInfo) ? this.locationInfo.ip : 'not Avilable'
            this.documentService.openSnackBar('Submited Successfully', 'X')
          })
        }
      })
    }
    else if (this.mobileLinkData) this.documentService.openSnackBar('Draw Your ' + this.mobileLinkData.type, 'X')
    else this.documentService.openSnackBar('Link is expired', 'X')
  }

// Assign filedata to filesToUpload variable
  onFileSelected(fileInput: any, title: any) {
    var filedata = <Array<File>>fileInput.target.files;
    if (filedata[0].type.split('/')[0] == 'image') {
      this.imageFile = fileInput
      this.filesToUpload = <Array<File>>this.imageFile.target.files;
      this.openCrop = true;

    }
    else {
      this.documentService.openSnackBar("Choose image file only", "X")
    }
  }

  /**
     * Function name : savedocLogs
     * Input : filedata,filepath,messgae
     * Output :{json} documentlog
     * Desc : save documentlogs in documentlog collection
     */
  savedocLogs(fileData, filepath, message) {
    var uid
    if (this.mobileLinkData.uid) uid = this.mobileLinkData.uid
    var signdata = {
      latitude: this.latitude,
      longitude: this.longitude,
      message: message,
      documentid: fileData.documentid,
      path: filepath.pemFilePath,
      uid: uid,
      email: fileData.email,
      photoId: fileData.photoId,
      stampId: fileData.stampId,
      signatureId: fileData.signatureId,
      created_at: fileData.created_at,
      IpAddress: (this.locationInfo) ? this.locationInfo.ip : 'not Avilable'
    };
    this.documentService.createfieldlogs(signdata).subscribe(data => {
    })
  }
  /**
  * Function name : stampSubmit
  * Input : field
  * Output :{json} created stamp
  * Desc : save stamp in stamp collection
  */
  stampSubmit = function () {
    this.isloader = true
    if (this.imageFile && this.cropimageData && this.croppedImage) {
      this.cropimageData.file.name = this.filesToUpload[0].name
      this.filesToUpload = this.cropimageData;
      const formData: any = new FormData();
      const files = this.filesToUpload;
      this.cropimageData.file.name = 'stamp.png'
      formData.append("uploads", this.filesToUpload.file, this.cropimageData.file.name);
      formData.append("type", "stampupload")
      formData.append("email", this.mobileLinkData.email)
      this.documentService.saveStampimages(formData).subscribe(data => {
        if (data) {
          this.isloader = false
          this.mobileLinkData.stampId = data._id
          this.mobileLinkData.path = data.path
          this.mobileLinkData.size = data.size
          this.mobileLinkData.name = data.name
          this.mobileLinkData.link = data.link
          this.mobileLinkData.encryptedid = data.encryptedid
          this.mobileLinkData.stampType = data.type
          this.mobileLinkData.pemFilePath = data.pemFilePath
          this.documentService.updateMobileLink(this.mobileLinkData).subscribe(res => {
            if (!this.locationInfo) {
              this.http.get('https://jsonip.com').subscribe(data => {
                this.locationInfo = data
              })
            }
            this.submitted = true;
            this.documentService.openSnackBar('Submited Successfully', 'X')
            this.cropimageData = null;
            this.imageFile = null;
            this.mobileLinkData.IpAddress = (this.locationInfo) ? this.locationInfo.ip : 'not Avilable'
          })
        }
      })
    }
    else
      this.documentService.openSnackBar('Upload Stamp', 'X')
  }
  TakePicture() {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }
  /**
   * Function name : photoSubmit
   * Input : field
   * Output :{json} created photo
   * Desc : save photo in photo collection
   */
  photoSubmit() {
    this.isloader = true
    if (this.cropimageData && (this.webcamImage)) {
      var files = []
      var blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
      files.push(blob);
      files.push(this.cropimageData.file)
      const formData: any = new FormData();
      files.forEach(element => {
        formData.append("uploads", element, element.name ? element.name : 'photo.png');
      })
      formData.append("type", "captured")
      formData.append("authentication", this.mobileLinkData.authentication == true ? true : false)
      formData.append("email", this.mobileLinkData.email)
      this.documentService.savePhotoimages(formData).subscribe((data: any) => {
        this.isloader = false
        this.savedPhoto = null
        if (data._id && data.authentication) {
          this.savedPhoto = data
          this.authenticateFun(data._id)
        }
        else if (data._id && !data.authentication) {
          this.savedPhoto = data
          this.setPhoto()
        }
        else if (data.message) {
          this.isloader = false
          this.documentService.openSnackBar('Choose other photo', "X")
        }
      }, error => {
        this.isloader = false
        this.documentService.openSnackBar(error, "X")
      })
    }
  }
  // shows photo field value from  submission
  setPhoto() {
    var data = this.savedPhoto
    if (data && this.mobileLinkData) {
      if (data._id) this.mobileLinkData.photoId = data._id
      if (data.type) this.mobileLinkData.photoType = data.type
      if (data.path) this.mobileLinkData.path = data.path
      if (data.size) this.mobileLinkData.size = data.size
      if (data.name) this.mobileLinkData.name = data.name
      if (data.link) this.mobileLinkData.link = data.link
      if (data.encryptedid) this.mobileLinkData.encryptedid = data.encryptedid
      if (data.photobaseData) this.mobileLinkData.photobaseData = data.photobaseData
      this.mobileLinkData.pemFilePath = data.pemFilePath
      this.documentService.updateMobileLink(this.mobileLinkData).subscribe(res => {
        this.submitted = true;
        this.documentService.openSnackBar("Photo saved successfully", "X");
        this.webcamImage = null;
        this.showWebcam = false;
        this.cropimageData = null;
        if (!this.locationInfo) {
          this.http.get('https://jsonip.com').subscribe(data => {
            this.locationInfo = data
          })
        }
        if (this.locationInfo) this.mobileLinkData.IpAddress = (this.locationInfo) ? this.locationInfo.ip : 'not Avilable'
      })
    }
  }
  // Convert base64 to blob
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }
  /**
   * Function name : savePhoto
   * Input : {json}  webcamdata
   * Output: {json}photo data
   * Desc : save photo in photo collection
   */
  savePhoto() {
    if (this.webcamImage) {
      var data = { photobaseData: this.webcamImage.imageAsDataUrl, type: "captured" }
      this.documentService.savePhotoFromMobileLink(data).subscribe((data: any) => {
        if (data && this.mobileLinkData) {
          this.mobileLinkData.photoId = data._id
          this.mobileLinkData.photobaseData = data.photobaseData
          this.mobileLinkData.photoType = data.type
          this.mobileLinkData.pemFilePath = data.pemFilePath
          this.documentService.updateMobileLink(this.mobileLinkData).subscribe(res => {
            this.documentService.openSnackBar("Photo saved successfully", "X");
            this.webcamImage = null;
            this.showWebcam = false;
            if (!this.locationInfo) {
              this.http.get('https://jsonip.com').subscribe(data => {
                this.locationInfo = data
              })
            }
            if (this.locationInfo) this.mobileLinkData.IpAddress = (this.locationInfo) ? this.locationInfo.ip : 'not Avilable'
          })
        }
      });
    }
    else {
      this.documentService.openSnackBar("First Capture the photo", "X");
    }
  }

  // set webcamImage to null when we click on cancel
  Cancel() {
    this.webcamImage = null;
    this.openCrop = false;
  }
  // To check camera acces for Face Recognization
  authenticateFun(id) {
    this.authIput = id
    this.authenticate = true;
  }
  // close the authenticate component
  modelClosing(event: any) {
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
    this.authenticate = false;
    if (event.res == 'success') {
      this.camLoaderSuccess = true;
      document.getElementById('modalOpenBtn').click();
    }
    else if (event.res == 'failed') {
      this.camLoaderFail = true;
      document.getElementById('modalOpenBtn').click();
    }
  }
  // again open camera for Face Recognization
  retry() {
    document.getElementById('modalClosBtn').click();
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
    this.authenticate = true;
  }
  // close camera
  closemsgmodal() {
    document.getElementById('modalClosBtn').click();
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
  }
  changeFileInput(event) {
    event.target.value = ''
  }
}
