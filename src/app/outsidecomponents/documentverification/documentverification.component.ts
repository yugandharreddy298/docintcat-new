import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../document.service';
import { ActivatedRoute ,Router} from '@angular/router';

@Component({
  selector: 'app-documentverification',
  templateUrl: './documentverification.component.html',
  styleUrls: ['./documentverification.component.css']
})
export class DocumentverificationComponent implements OnInit {

  constructor(private documentService: DocumentService,
    public activatedroute: ActivatedRoute,
    private router: Router,) { }

  filesToUpload;
  fileName = 'Upload Document';
  result
  isLoading: boolean = false
  urldata:any
  ngOnInit() {
    this. urldata = this.router.url.split('/');
    console.log(this.urldata[1])
  }

  /**
   * Function name : onFileSelected
   * Input : fileInput, User uploaded file data
   * Output : Document verified status
   * Desc : To get to know the document status, which is uploaded by user in verification portal.
   */
  onFileSelected(fileInput: any) {
    this.isLoading = true
    this.filesToUpload = <Array<File>>fileInput.target.files;
    if (this.filesToUpload[0] && this.filesToUpload[0].type == 'application/pdf') {
      if (this.filesToUpload[0].name) this.fileName = this.filesToUpload[0].name
      var formData: any = new FormData();
      formData.append("uploads", this.filesToUpload[0], this.filesToUpload[0].name);
      formData.append("type", "documentverification")
      this.documentService.verifydocument(formData).subscribe(res => {
        this.result = res
        this.isLoading = false
      }, error => {
        this.isLoading = false
        this.documentService.openSnackBar(error, 'X')
      })
    }
    else {
      this.isLoading = false
      if (this.filesToUpload[0])
        this.documentService.openSnackBar("Choose Pdf file only", "X")
    }
  }

  /**
   * Function name : upload
   * Input : null
   * Output : File upload input trigger
   * Desc : File upload input trigger
   */
  upload() {
    if (!this.isLoading)
      document.getElementById('webportal_document').click()
  }

}
