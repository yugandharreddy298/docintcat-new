import { Component, OnInit, ViewChild, ViewEncapsulation, HostListener } from '@angular/core';
import { DocumentService } from '../../document.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component'
import { MatDialog } from '@angular/material'
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { SignupdialogboxComponent } from 'src/app/public/signupdialogbox/signupdialogbox.component';
import {PreviewPdfComponent} from '../preview-pdf/preview-pdf.component'
declare var $: any;
@Component({
  selector: 'app-binfiles',
  templateUrl: './binfiles.component.html',
  styleUrls: ['./binfiles.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class BinfilesComponent implements OnInit {

  fileElements: any = [];  // stores deleted file list
  folderElements: any = []; //stores deleted folder list
  filterData: any; // stores the content for search
  errorshow = false;  // to display the error if FROM and END Date is not selected
  maxDate: any; // minimum date in calender
  minDate: any; // max date in calender
  TableView = false;  // to show in table view
  showGridView: Boolean = true; // to show in grid view
  selectedName: any; // stores selected name
  element: any; // stores selected element
  sample22: boolean = true; 4
  toMinDate;
  frommaxdate = new Date();
  isloading: boolean = true;
  sample2: boolean;
  matmenu: any;
  canNavigateUp: boolean = false;
  todate: any;
  filearr: any = [];
  folderarr: any = []
  ButtonsDisable: Boolean = false;
  myplaceHolder1: String = ' Choose Date'
  myplaceHolder2: String = ' Choose Date'
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  iebrowser
  matttoltip
  matdialogopen: boolean = false
  files: any = [];
  folders: any = [];
  folderlists: any
  FileMenu = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  allfiles: any // for check file name validation while seleted files  restore
  allfolders: any // for check folder name validation while selected folders restore 
  chechBoxenable:boolean=false // show checkbox  while touch hold in touch enable devices

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.keyCode == 65) {
      this.filearr = this.fileElements.slice(0);
      this.folderarr = this.folderElements.slice(0);
      event.preventDefault();
    }
    if (event.keyCode == 46) {
      if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) {
        if (!this.matdialogopen) {
          this.multipleDelete()
        }
      }
      else if ((this.filearr.length || this.folderarr.length)) {
        if (!this.matdialogopen) {
          this.multipleDelete()
        }
      }

    }
  }

  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {
    var value: any = event.srcElement;
    if (value.id != "foldersList" && value.id != "filesList" && value.id!='contextmenu' && value.classList[0]!=='mat-checkbox-inner-container' && !(this.contextMenu && this.contextMenu.menuOpened.closed)) {
      this.ButtonsDisable=false
      this.filearr = []
      this.folderarr = [];
      this.chechBoxenable=false;

    }
    if( this.contextMenu && this.contextMenu.menuOpen) {
      this.contextMenu.closeMenu();
    }
  }

  @HostListener('window:scroll', ['$event']) onWindowScroll($event) {
    if (this.contextMenu) this.contextMenu.closeMenu()
    this.matttoltip = true
    setTimeout(() => {
      this.matttoltip = false
    }, 1);
  }

  // show / hide context menu when click anywhere in files or folders 
  @HostListener('document:contextmenu', ['$event']) menuContext(ev: MouseEvent) {
    const value: any = ev.srcElement;
        if(value.id=='filesList' || value.id=='foldersList'){
          this.contextMenu.closeMenu();
          setTimeout(() => {
            this.contextMenuPosition.x = ev.clientX + 'px';
            this.contextMenuPosition.y = ev.clientY + 'px';
            if(!this.is_touch_device())  this.contextMenu.openMenu();
            this.ButtonsDisable=true;
            $('div.cdk-overlay-container').addClass('checking');
          }, 300);
        }else{
          this.contextMenu.closeMenu();
          if(value.id!='filesList' || value.id!='foldersList')
          {
            this.ButtonsDisable=false;
            this.filearr = [];
            this.folderarr = [];
          }
        }

}
  constructor(public dialog: MatDialog,
    private documentservice: DocumentService) { }

  ngOnInit() {
    this.myplaceHolder1 = 'Choose Date'
    this.myplaceHolder1 = 'Choose Date'
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $(".ietop").css("margin-top", "100px");
      this.iebrowser = true
    }
    else this.iebrowser = false
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    this.minDate = new Date(2019, 1, 0);
    this.maxDate = new Date(year, month, day);
    this.getDeletedList();
    this.getFiles_folders();
     }
  getFiles_folders() {
    this.documentservice.getfolder().subscribe(data => {
      this.allfolders = data;
      this.documentservice.getuserfiles().subscribe(data => {
        this.allfiles = data;
      });
    });
  }
  seldate() {
    this.myplaceHolder1 = ''
  }

  seledate() {
    this.myplaceHolder2 = ''
  }

  /**
   * Function name : toMinDateEvent
   * Input : event
   * Output : Date stored in toMinDate
   * Desc : To get the date.
   */
  toMinDateEvent(event: MatDatepickerInputEvent<Date>) {
    this.toMinDate = event.value;
  }

  /**
   * Function name : getDeletedList
   * Input : null
   * Output : Deleted documents and folders list.
   * Desc : To get the deleted folders and documents.
   */
  getDeletedList() {
    this.isloading = true;
    var result;
    this.documentservice.trashfolders().subscribe(data => {
      result = data
      this.folderElements = result.folders;
      this.fileElements = result.documents;
      this.isloading = false
    })
  }

  /**
  * Function name : deleteAllFiles
  * Input : null
  * Output : permanently Deleted all documents and folders.
  * Desc : To delete all Documents and folders permanently, when user clicks on 'Delete All Files'.
  */
  deleteAllFiles() {
    setTimeout(() => {
      $('body').css("overflow", "hidden");
    }, 10);
    let dialogRef = this.dialog.open(CommonDialogComponent, { width: '500px', panelClass: "deletemod", data: { name: 'trashdelete', }, disableClose: false });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css("overflow", "auto");
      }, 10);
      if (res) {
        this.documentservice.deleteAllFilesFolder().subscribe(data => {
          this.fileElements = [];
          this.folderElements = [];
        })
      }
    });
  }

  /**
   * Function name : filterdate
   * Input : search
   * Output : Searched data/filtered data.
   * Desc : To get data files and folders, which is searched by user.
   */
  filterdate(search) {
    var result;
    if (!search.value.fromdate || !search.value.todate) this.errorshow = true;
    else {
      this.errorshow = false;
      this.filterData = {};
      this.filterData.where = {};
      let d = new Date(search.value.fromdate);
      let sevenDaysFromNow = d.setDate(d.getDate() + 0);
      let FromNow = new Date(sevenDaysFromNow)
      let d1 = new Date(search.value.todate);
      let sevenDaysFromNow1 = d1.setDate(d1.getDate() + 1);
      let To = new Date(sevenDaysFromNow1)
      if (search.value.fromdate) this.filterData.where.updated_at = { $gte: FromNow }
      if (search.value.todate) this.filterData.where.updated_at = { $lt: To }
      if (search.value.fromdate && search.value.todate) this.filterData.where.updated_at = { $gte: FromNow, $lt: To }
      console.log(this.filterData)
      this.documentservice.searchfolders(this.filterData).subscribe(data => {
        result = data
        this.folderElements = result.folders;
        this.fileElements = result.documents;
      });
    }
  }

  /**
   * Function name : restoreElement
   * Input : restore, content
   * Output : Selected documents/ folders will be restored.
   * Desc : to restore the doument or Folder.
   */
  restoreElement(restore, content) {
    this.files = [];
    this.folders = [];
    if (content) {
      var contentdata = []
      contentdata = content.split(',')
    }
    var fileslists = this.filearr;
    this.folderlists = this.folderarr;
    console.log(this.folderlists);
    var Filenames = [];
    var Foldernames = [];
    var fileinsidefolder=[];
    var folderinsidefolder=[];
    if (fileslists.length != 0 || this.folderlists.length != 0) {
      if (fileslists.length != 0) {
        fileslists.forEach((element, index) => {
          this.allfiles.forEach(file => {
            if (!file.folderid && file.name == element.name && !element.folderid) {
              Filenames.push(element)
            }
            if((file.folderid &&  element.folderid) && (file.folderid == element.folderid) && (file.name==element.name)){
              fileinsidefolder.push(element)
            }
          });
        });
      }
      if (this.folderlists.length != 0) {
        this.folderlists.forEach((element, index) => {
          this.allfolders.forEach(folder => {
            if (!folder.parentid && !element.parentid && folder.name == element.name) {
              Foldernames.push(element)
            }
            if((folder.parentid && element.parentid ) && (folder.parentid == element.parentid) && (folder.name==element.name)){
              folderinsidefolder.push(element)
            }
          });
        });
      }
    }
    setTimeout(() => {
      $('body').css("overflow", "hidden");
    }, 10);
    let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'restore1', content: contentdata[0], data: contentdata[1] }, width: '500px', panelClass: "deletemod", disableClose: false });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css("overflow", "auto");
      }, 10);
      if (res == "restore") {
        if ((Filenames.length != 0 || Foldernames.length != 0) || (fileinsidefolder.length!=0 ||folderinsidefolder.length!=0 )) {
          const Nameexisting = this.dialog.open(SignupdialogboxComponent, {
            width: '500px',
            disableClose: false,
            autoFocus: true,
            panelClass: 'passwordbottom',
            data: { type: 'fileName', method:'restore'}
          });
          Nameexisting.afterClosed().subscribe(res => {
            if (res) {
             if(Filenames.length!=0)  this.checkname(Filenames, fileslists);
             if(Foldernames.length!=0) this.checkname(Foldernames, this.folderlists)
             if(fileinsidefolder.length!=0) this.checknameparent(fileinsidefolder)
             if(folderinsidefolder.length!=0) this.checknameparent(folderinsidefolder)
             if ((fileslists.length != 0 || this.folderlists.length != 0)) {
              this.restoremultiplefiles(fileslists)
              this.documentservice.openSnackBar("Restored Successfully ", "X")
            }
            } else {
              if (Foldernames.length != 0) {
                Foldernames.forEach(element => {
                  this.folderlists.forEach((folders, index) => {
                    if (folders._id == element._id) {
                      this.folderlists.splice(index, 1);
                    }
                  });
                });
              }
              if (Filenames.length != 0) {
                console.log(Filenames)
                Filenames.forEach(element => {
                  fileslists.forEach((files, index) => {
                    if (files._id == element._id) {
                      fileslists.splice(index, 1);
                    }
                  });
                });
              }if (folderinsidefolder.length != 0) {
                folderinsidefolder.forEach(element => {
                  this.folderlists.forEach((folders, index) => {
                    if (folders._id == element._id) {
                      this.folderlists.splice(index, 1);
                    }
                  });
                });
              }
              if (fileinsidefolder.length != 0) {
                fileinsidefolder.forEach(element => {
                  fileslists.forEach((files, index) => {
                    if (files._id == element._id) {
                      fileslists.splice(index, 1);
                    }
                  });
                });
              }
              if ((fileslists.length != 0 || this.folderlists.length != 0)) {
                this.restoremultiplefiles(fileslists)
                this.documentservice.openSnackBar("Restored Successfully ", "X")
              }
            }
           
          })
         
        }else{
          if((fileslists && fileslists.length!=0) || (this.folderlists.length!=0 &&this.folderlists)){
            this.restoremultiplefiles(fileslists);
            this.documentservice.openSnackBar("Restored Successfully ", "X")
          }
        }
    
      }
    });
  }
   /**
   * Function name : restoremultiplefiles
   * Input : filelist, folders list
   * Api: /api/documents/restore
   * Output :String {success}
   * Desc : restore selected files and folders .
   */ 
  restoremultiplefiles(fileslists) {
    if (fileslists.length != 0) {
      fileslists.forEach(element => {
        this.fileElements.forEach(originalElement => {
          if (element._id == originalElement._id) {
            element.active = true
            this.files.push(element)
          }
        })
      });
      this.documentservice.updatefolder1(this.files).subscribe(data => {
      });
      this.files.forEach(element => {
        var index = this.fileElements.findIndex(x => x._id === element._id);
        if (index >= 0) {
          this.fileElements.splice(index, 1);
        }

      });
    } if (this.folderlists.length != 0) {
      this.folderlists.forEach(element => {
        this.folderElements.forEach(originalElement => {
          if (element._id == originalElement._id) {
            element.active = true
            this.folders.push(element)
          }
        })
      });
      this.documentservice.restorefolder({ folderarray: this.folders, delete: true }).subscribe(data => {
      });
      this.folders.forEach(element => {
        var index = this.folderElements.findIndex(x => x._id === element._id);
        if (index >= 0) {
          this.folderElements.splice(index, 1);
        }
      });
    }
  }

   /**
   * Function name : checkname
   * Input : filenamematched records, total selected records
   * Output : append random number to finename already exists documents.
   * Desc : filename appended records .
   */ 
  checkname(matcheddata, selecteddata) {
    let filename
    matcheddata.forEach(element => {
      var count = 0;
      if (element && element.isFile) {
        do {
          count++;
          filename = element.name.substring(0, element.name.lastIndexOf('.')) + ' (' + count + ')' + '.pdf';
          let isMatch = false;
          for (let i = 0; i < this.allfiles.length; i++) {
            if (this.allfiles[i].name == filename) {
              isMatch = true;
              break;
            }
          } if (!isMatch) {
            break;
          }
        } while (this.allfiles.length >= count);
        element.name = filename;

      }
      if (element && element.isFolder) {
        do {
          count++;
          filename = element.name + ' (' + count + ')';
          let isMatch = false;
          for (let i = 0; i < this.allfolders.length; i++) {
            if (this.allfolders[i].name == filename) {
              isMatch = true;
              break;
            }
          } if (!isMatch) {
            break;
          }
        } while (this.allfolders.length >= count);
        element.name = filename;

      }
    });
    return matcheddata
  }
     /**
   * Function name : checknameparent
   * Input : filenamematched records, total selected records
   * Output : append random number to finename already exists documents inside folder.
   * Desc : filename appended records inside folder files .
   */
  checknameparent(matcheddata){
    let filename;
    matcheddata.forEach(element => {
      var count = 0;
      if (element && element.isFile) {
        do {
          count++;
          filename = element.name.substring(0, element.name.lastIndexOf('.')) + ' (' + count + ')' + '.pdf';
          let isMatch = false;
          for (let i = 0; i < this.allfiles.length; i++) {
            if ((this.allfiles[i].name == filename) && (this.allfiles[i].folderid== element.folderid) && (this.allfiles[i].folderid && element.folderid)) {
              isMatch = true;
              break;
            }
          } if (!isMatch) {
            break;
          }
        } while (this.allfiles.length >= count);
        element.name = filename;

      }
      if (element && element.isFolder) {
        do {
          count++;
          filename = element.name + ' (' + count + ')';
          let isMatch = false;
          for (let i = 0; i < this.allfolders.length; i++) {
            if ((this.allfolders[i].name == filename) && (this.allfolders[i].parentid && element.parentid) && (this.allfolders[i].parentid == element.parentid) ) {
              isMatch = true;
              break;
            }
          } if (!isMatch) {
            break;
          }
        } while (this.allfolders.length >= count);
        element.name = filename;

      }
    });

  }
  /**
   * Function name : filterdate
   * Input : del, type
   * Output : Selected document/ folder will be deleted.
   * Desc : to delete the selected folder or document.
   */
  delete = async function (del, type) {
    if (type == 'keyevent') {
      this.matdialogopen = true
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFilesandFolders', content: "You want to delete selected Items permanently." }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        if (res) {
          var finalArray = [];
          finalArray.push(del);
          while (finalArray.length) {
            this.documentservice.folderDeletion(finalArray[0]._id, del).subscribe(res => {
              this.multipleDelete = false;
              if (!del.isFolder) {
                var index = this.fileElements.findIndex(x => x._id == del._id)
                if (index >= 0) {
                  this.fileElements.splice(index, 1)
                }
                this.documentservice.openSnackBar("File(s) deleted successfully", "X");
              }
              if (del.isFolder) {
                var index = this.folderElements.findIndex(x => x._id == del._id)
                if (index >= 0) {
                  this.folderElements.splice(index, 1)
                }
                this.documentservice.openSnackBar("Folder deleted successfully", "X");
              }

            })
            finalArray.splice(0, 1);
          }
        }
        this.matdialogopen = false
      })
    } else {
      var finalArray = [];
      finalArray.push(del);
      while (finalArray.length) {
        await this.documentservice.folderDeletion(finalArray[0]._id, del).subscribe(res => {
          this.multipleDelete = false;
          if (!del.isFolder) this.documentservice.openSnackBar("File(s) deleted successfully", "X");
        })
        finalArray.splice(0, 1);
      }
    }
  }

  /**
  * Function name : deleteFF
  * Input : del
  * Output : Selected documents/ folders will be deleted.
  * Desc : to delete the selected folders or documents.
  */
  deleteFF(del) {
    if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) {
      this.multipleDelete()
    }
    else {
      if (del.isFolder) {
        setTimeout(() => {
          $('body').css("overflow", "hidden");
        }, 10);
        let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "You want to delete Folder(s) permanently." }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          setTimeout(() => {
            $('body').css("overflow", "auto");
          }, 10);
          if (res) {
            this.documentservice.openSnackBar("Folder(s) deleted successfully", "X");
            var index = this.folderElements.findIndex(x => x._id == del._id)
            if (index >= 0) {
              this.folderElements.splice(index, 1)
              this.delete(del, '');
            }
          }
        });
      }
      else {
        setTimeout(() => {
          $('body').css("overflow", "hidden");
        }, 10);
        let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "You want to delete File(s) permanently." }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          setTimeout(() => {
            $('body').css("overflow", "auto");
          }, 10);
          if (res) {
            var index = this.fileElements.findIndex(x => x._id == del._id)
            if (index >= 0) {
              this.fileElements.splice(index, 1)
              this.delete(del, '');
            }
          }
        });
      }
    }
  }


  /**
   * Function name : sortByNameAsc
   * Input : null
   * Output : Sorted Name in Ascending Order.
   * Desc : sorting name.
   */
  sortByNameAsc() {
    this.folderElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    })
    this.fileElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    })
  }

  /**
   * Function name : sortByNameDsc
   * Input : null
   * Output : Sorted Name in Descending Order.
   * Desc : sorting name.
   */
  sortByNameDsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    })
  }

  /**
   * Function name : sortByModifiedAsc
   * Input : null
   * Output : Sorted updatedAt in Ascending Order.
   * Desc : sorting updatedAt.
   */
  sortByModifiedAsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    })
  }

  /**
   * Function name : sortByNameDsc
   * Input : null
   * Output : Sorted updatedAt in Descending Order.
   * Desc : sorting updatedAt.
   */
  sortByModifiedDsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    })
  }

  /**
   * Function name : multiselectpdf
   * Input : element1, event
   * Output : will have selected documents and folders.
   * Desc : to store selected items.
   */
  multiselectpdf(element1, event) {
    if (event.ctrlKey) {
      if (element1.isFile) {
        if (!this.filearr.some(element => element._id == element1._id)) this.filearr.push(element1)
        else {
          var indexNum = this.filearr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      }
      else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id == element1._id)) this.folderarr.push(element1)
        else {
          var indexNum = this.folderarr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.folderarr.splice(indexNum, 1);
        }
      }
    }
    else {
      if (element1.isFile) {
        this.filearr = [element1]
        this.folderarr = []
      }
      else if (element1.isFolder) {
        this.folderarr = [element1]
        this.filearr = []
      }
    }
    if ((this.filearr.length == 1 && this.folderarr.length == 1) || (this.filearr.length > 1 || this.folderarr.length > 1)) this.ButtonsDisable = true;
    else this.ButtonsDisable = false;
  }

  /**
   * Function name : highlightRow
   * Input : element
   * Output : highlighted selected file or folder.
   * Desc : to highlight the selected file or folder.
   */
  highlightRow(element) {
    console.log(element)
    this.selectedName = element._id;
    this.sample22 = false
    this.sample2 = true
    this.element = element;
    this.ButtonsDisable = true
  }

  /**
   * Function name : openMenufolder
   * Input : event, element
   * Output : context menu or rightclick menu.
   * Desc : context menu or rightclick menu.
   */
  openMenufolder(event: MouseEvent, element) {
    this.element = element
    if (!this.filearr.some(element1 => element1._id == element._id) && !this.folderarr.some(element1 => element1._id == element._id)) {
      if (element.isFile) {
        this.filearr = [element]
        this.folderarr = []
      }
      else if (element.isFolder) {
        this.folderarr = [element]
        this.filearr = []
      }
    }
    this.matmenu = element
    this.selectedName = this.matmenu._id;
    this.FileMenu = true;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
  }

  /**
   * Function name : openMenufolder1
   * Input : event, element
   * Output : contextmenu for IPAD
   * Desc : contextmenu for IPAD
   */
  openMenufolder1(event: TouchEvent, element: any,data) {
    if(data=='grid'){
    this.endTime = new Date();
    if (event.type === 'touchend'){
      var longpress = (this.endTime - this.startTime < 500) ? false : true
      if(longpress){
        this.chechBoxenable=true;
        if (!this.filearr.some(element1 => element1._id == element._id) && !this.folderarr.some(element1 => element1._id == element._id)) {
          if (element.isFile) {
            this.filearr = [element]
            this.folderarr = []
          }
          else if (element.isFolder) {
            this.folderarr = [element]
            this.filearr = []
          }
        }
      }else {
        if(!this.chechBoxenable){
        if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
          if (element.isFile) {
            this.filearr = [element];
            this.folderarr = [];
          } else if (element.isFolder) {
            this.folderarr = [element];
            this.filearr = [];
          }
        }
        this.matmenu = element
        this.selectedName = this.matmenu._id;
        this.FileMenu = true;
        this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px';
        this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px';
           this.contextMenu.openMenu();
        }
      }
    }
  }else{
    if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
      if (element.isFile) {
        this.filearr = [element];
        this.folderarr = [];
      } else if (element.isFolder) {
        this.folderarr = [element];
        this.filearr = [];
      }
    }
    this.matmenu = element;
    this.FileMenu = true;
    // event.preventDefault();
    this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px';
    this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px';
    if (((this.filearr.length > 1 || this.folderarr.length > 1)
      || (this.filearr.length === 1 && this.folderarr.length === 1))) {
    } else { 
       this.contextMenu.openMenu();
     }
  }

  }
  /**
   * Function name : getHighlight
   * Input : data
   * Output : Highlighted row
   * Desc : To check file presence status to return boolean value to apply class to it
   */
  getHighlight(data) {
    if (data.isFile) {
      if (this.filearr.some(element => element._id == data._id)) return true
      else return false
    }
    else if (data.isFolder) {
      if (this.folderarr.some(element => element._id == data._id)) return true
      else return false
    }
    else return false
  }

  /**
  * Function name : show4
  * Input : null
  * Output : out side click to remove selected
  * Desc : When user clicks outside, selection will be removed
  */
  show4() {
    this.selectedName = null;
    this.sample2 = false
  }

  /**
   * Function name : changeView
   * Input : title
   * Output : documents and folders view will be changed
   * Desc : To change view of files and folders 
   */
  changeView(title) {
    if (title == 'list') {
      this.TableView = true;
      this.showGridView = false
      this.selectedName = null;
    }
    if (title == 'grid') {
      this.TableView = false;
      this.showGridView = true
      this.selectedName = null;
    }
  }

  /**
  * Function name : multipleDelete
  * Input : null
  * Output : Selected documents/ folders will be deleted.
  * Desc : to delete the selected folders or documents.
  */
  multipleDelete() {
    this.matdialogopen = true
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    var selecteddata = {
      folders: folders,
      files: files
    }
    if (folders.length || files.length) {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFilesandFolders', content: "You want to delete selected Items permanently." }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if (res) {
          files.forEach(element => {
            var index = this.fileElements.findIndex(x => x._id == element._id);
            this.fileElements.splice(index, 1);
          });
          folders.forEach(element => {
            var index = this.folderElements.findIndex(x => x._id == element._id);
            this.folderElements.splice(index, 1);
          });
        }
        if (res) this.documentservice.multiselect_Permenant_Delete(selecteddata).subscribe(data => {
          this.documentservice.openSnackBar("Items deleted Successfully!", "X");
        })

      })
    }
  }
  preview(element)
  {
    console.log(element)
    setTimeout(() => {
      $('body').css("overflow", "hidden");
    }, 10);      const nameConfirmationDiaBox = this.dialog.open(PreviewPdfComponent, {
        panelClass: 'my-full-screen-dialog',
        data:element
      }); 
      nameConfirmationDiaBox.afterClosed().subscribe((res)=>{
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        if(res)
        {
          if(res=='Delete') { this.deleteFF(element)};
          if(res=='Restore') { this.restoreElement(element,'Are you sure?,Restore the Files/folders to view ')}
        }
      })
  }
  is_touch_device() {
    return 'ontouchstart' in window;
  }
    /**
   * Function name : selectTouchDevices
   * Input{string}: (event,element) event*-checked 
   *                                element*- selected folder or file
   * Output : add or remove files and folders in touchenabled devices 
   */
  selectTouchDevices(element,event){
    if(event.checked){
      if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
        if (element.isFile) {
          this.filearr.push(element)
        } else if (element.isFolder) {
          this.folderarr.push(element)
        }
      }
    }else if(!event.checked){
      if (this.filearr.some(element1 => element1._id === element._id) || this.folderarr.some(element1 => element1._id === element._id)) {
        if (element.isFile) {
          for (var i = 0; i < this.filearr.length; i++) {
            if (this.filearr[i]._id === element._id) {
              this.filearr.splice(i, 1);  // Remove  files from after deselect
            }
          }
        }else if (element.isFolder){
          for (var i = 0; i < this.folderarr.length; i++) {
            if (this.folderarr[i]._id === element._id) {
              this.folderarr.splice(i, 1);  // Remove folders from after deselect
            }
          }
        }
      }
    }
    
  }
  startTime;
  endTime;
    /**
   * Function name : contextMenuStart
   * Input{string}: event
   * Output : Calculate Time for touch hold
   */
  contextMenuStart(event){
  this.startTime = new Date();
}
      /**
   * Function name : selectAllelements
   * Input{event}: 
   * Output : select and deselect files and folders
   */
  selectAllelements(event){
    if(event.checked){
      this.filearr = [];
      this.folderarr = [];
      this.filearr = this.fileElements.slice(0);
      this.folderarr = this.folderElements.slice(0);
    }else{
      this.filearr = [];
      this.folderarr = [];
    }
  }
}