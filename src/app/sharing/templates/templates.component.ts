import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../document.service';
import { MatDialog } from '@angular/material';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { Router } from "@angular/router";
import { AdminService } from '../../admin.service';

declare var $: any;
@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})

export class TemplatesComponent implements OnInit {

  templatenamelengtherror: boolean = false;
  templatepatternerror: boolean = false;
  templatename: any;
  TemplateName;
  iebrowser
  test1: boolean = true
  test2: Boolean;
  templates = [];
  id
  templateedit = false // Template Edit Button
  selectedTemplateId: any;
  templateid
  buttonhide
  isloading: boolean = false;
  copdocument;
  lastSelect;
  profiledata
  alltemplates: any;
  constructor(private documentService: DocumentService,private router: Router,private adminService: AdminService,
    public dialog: MatDialog) { }

  ngOnInit() {
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $(".ietop").css("margin-top", "100px");
      this.iebrowser = true
    }
    else this.iebrowser = false
    this.templatename = "";
    this.adminService.getProfile().subscribe(data => {
      this.profiledata = data
    })
    this.GetListOftemplates();
  }

  /**
   * Function name : GetListOftemplates
   * Input : null
   * Output : Templates List
   * Desc : To get template lisyt for a particular user.
   */
  GetListOftemplates() {
    this.isloading = true;
    this.documentService.gettempltes().subscribe((data: any) => {
      this.templates = data
      this.alltemplates=data
      this.templateedit = false;
      this.isloading = false;
    })
  }

  /**
   * Function name : editTemplatename
   * Input : t
   * Output : Edited data of a template
   * Desc : To get edited data for a templated
   */
  editTemplatename(t) {
    this.copdocument = Object.assign({}, t)
    this.TemplateName = t.templatename;
    this.templateid = t._id;
    this.selectedTemplateId = t._id;
    this.templateedit = true;
    this.buttonhide = t._id;
    this.lastSelect = t._id
  }

  /**
   * Function name : Selected
   * Input : t
   * Output : edit button toggle
   * Desc : edit button toggle check
   */
  Selected(t) {
    if (this.lastSelect != t._id) this.templateedit = false;
  }

  /**
   * Function name : cancelButton
   * Input : data
   * Output : changes reset
   * Desc : To reset the template edited changes
   */
  cancelButton(data) {
    data.templatename = this.TemplateName;
    this.templateedit = false;
  }

  /**
      * Function name : ModifyTemplate
      * Input : data, title
      * Output : Deletion/updation of a template
      * Desc : Deletion/updation of a template of a prticular selected template
      */
  ModifyTemplate(data, title) {
    if (title == 'delete') {
      if (this.buttonhide != data._id) this.templateedit = false;
      this.selectedTemplateId = data._id;
      data.istemplate = false
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "You want to delete the Template." }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res == 'DeletedTemplate') {
          var index = this.templates.findIndex(x => x._id == data._id)
          if (index >= 0) {
            this.templates.splice(index, 1)
            this.documentService.edittemplate(data).subscribe((data: any) => {
              this.templateedit = false;
            });
            this.documentService.openSnackBar("Template has been deleted Successfully.", "X");
          }
        } else {
          data.istemplate = true
        }
      });
    }
    if (data.templatename == "") this.documentService.openSnackBar("Enter Template Name", "X")
    if (data.templatename != "" && title == 'edit') {
      this.templateedit = false;
      var alltemplates=this.alltemplates.slice(0)
      var index = alltemplates.findIndex(x => x._id == data._id)
      alltemplates.splice(index, 1)
      
      let templatecheck = alltemplates.some(temp => temp.templatename.toLowerCase().trim() === data.templatename.toLowerCase().trim())      
      if (!templatecheck) {
        this.isloading = true;
        this.templateNameSave(data);
      } else {
        this.RenameTemplate(data,alltemplates)
      }
    }
  }

  /**
  * Function name : RenameTemplate
  * Input : template name
  * Output : Existense status with changed name, if any
  * Desc : Checking availability for the same template name
  */
  RenameTemplate(data,template) {
console.log(template,'ggg');

    let count = 0
    let resultName;

    do {
      count++;
      resultName = data.templatename + '(' + count + ')'
      let isMatch = false
      for (let j = 0; j < template.length; j++) {
        console.log(template[j].templatename.trim().toLowerCase(),'gg');
        
        console.log((template[j] && (template[j].templatename.trim().toLowerCase() === resultName.toLowerCase())));
        
        if ((template[j] && (template[j].templatename.trim().toLowerCase() === resultName.toLowerCase()))) {
          isMatch = true;
          break;
        }
      }
      if (!isMatch)
        break;
    } while (template.length + 1 >= count)
    data.templatename = resultName;
    let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'TemplateRename', newName: resultName }, disableClose: false, width: '500px', panelClass: "deletemod" });
    dialogRef.afterClosed().subscribe(res => {      
      if (res) {
        this.isloading = true;
        this.templateNameSave(data);
      } else { 
      }
    })
  }

  /**
   * Function name : templateNameSave
   * Input : templatename
   * Output : Template creation
   * Desc : Save as new template 
   */
  templateNameSave(data) {
    this.documentService.edittemplate(data).subscribe((data: any) => {
      this.documentService.gettempltes().subscribe((tempData: any) => {
        this.templates = tempData;
        this.alltemplates=tempData
        this.templateedit = false;
        this.isloading = false;
        this.documentService.openSnackBar("Template Updated Successfully", "X");
      });
    });
  }

  /**
  * Function name : tempNameAsc
  * Input : null
  * Output : Sorted template name in Ascending Order.
  * Desc : sorting name.
  */
  tempNameAsc() {
    this.templates.sort(function (a, b) {
      var nameA = a.templatename
      var nameB = b.templatename
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : tempNameDsc
   * Input : null
   * Output : Sorted template name in Descending Order.
   * Desc : sorting name.
   */
  tempNameDsc() {
    this.templates.sort(function (a, b) {
      var nameA = a.templatename
      var nameB = b.templatename
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : tempCreatedDateAsc
   * Input : null
   * Output : Sorted created_at in Ascending Order.
   * Desc : sorting created_at.
   */
  tempCreatedDateAsc() {
    this.templates.sort(function (a, b) {
      var nameA = a.created_at
      var nameB = b.created_at
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : tempCreatedDateDsc
   * Input : null
   * Output : Sorted created_at in Descending Order.
   * Desc : sorting created_at.
   */
  tempCreatedDateDsc() {
    this.templates.sort(function (a, b) {
      var nameA = a.created_at
      var nameB = b.created_at
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : validatetemplate
   * Input : data
   * Output : Error, if there is no valid data
   * Desc : Validating template data.
   */
  validatetemplate(data) {
    this.templatenamelengtherror = false
    this.templatepatternerror = false
    if (data && data.errors && data.errors.minlength) {
      this.templatenamelengtherror = true
    }
    if (data && data.errors && data.errors.pattern) {
      this.templatepatternerror = true
    }
    if (data && data.value.length == 0) {
      this.templatenamelengtherror = true
    }
  }
  /**
 * Function name : editTemplateDoc
 * Input : {json}   
 * Output: {json}
 * Desc :  to create new document with emptypages
 */
  async editTemplateDoc(template)
  {
    console.log(template)
    var templateFieldPageNo = template.fields.some(field => field.pageNo)
    if(templateFieldPageNo){
      this.isloading = true
      var maxPageno=await Math.max.apply(Math, template.fields.map(function(o) { return o.pageNo; }))
      this.documentService.editTemplateDoc(maxPageno,template.templatename).subscribe((data: any) => {
        if(data)
        {
         this.isloading = true
          var filedata = {
           fileid: data._id,
           sharedid:template._id
         }
         this.documentService.encryptedvalues(filedata).subscribe((newdata: any) => {
          if (this.profiledata.type == 'individual') this.router.navigateByUrl('/individual/filecont/' + newdata.fileid+"."+newdata.sharedid);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigateByUrl('organization/filecont/' + newdata.fileid+"."+newdata.sharedid);
         })
        }
      })
    }
    else{
      this.documentService.openSnackBar("Sorry you can't edit template",'x')
    }
  }

}
