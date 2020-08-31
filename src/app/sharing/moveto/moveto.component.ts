import { Component, OnInit, Inject, Output, EventEmitter, } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of as observableOf } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DocumentService } from '../../document.service';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-moveto',
  templateUrl: './moveto.component.html',
  styleUrls: ['./moveto.component.css']
})

export class MovetoComponent implements OnInit {

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<TreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<FileNode, TreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<FileNode, TreeNode>;
  @Output() folderAdded = new EventEmitter<{ name: string }>();
  createFolder: Boolean = false;
  profiledata: any
  role: any
  btn2: any
  foldersdata: any
  parent: any;
  selectednode: any;
  selectedElement: any;
  folders
  FileSubject: BehaviorSubject<[]>;
  SameFolder: Boolean = false;
  show1: boolean = false
  allFoldersList;
  CreateRef;
  select
  elementChecked: any;

  constructor(public dialogRef: MatDialogRef<MovetoComponent>, @Inject(MAT_DIALOG_DATA) public dailogData,
    public dialog: MatDialog,
    public documentService: DocumentService) {
    if (this.dailogData.multi == false) {
      this.createFolder = true;
    }
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.dailogData.Allfolder
  }

  ngOnInit() {
    this.documentService.getfolder().subscribe(data => {
      this.folders = data;
      this.allFoldersList = this.queryInFolder();
      this.allFoldersList.subscribe((data) => {
        if (data) this.dataSource.data = data;
      });
    })
  }

  /**
   * Function name : transformer
   * Input : node, level
   * Output : Node data.
   * Desc : To get node data.
   */
  transformer(node: FileNode, level: number) {
    var expand
    if (node.children && node.children.length > 0) expand = true;
    else { expand = false }
    return {
      name: node.name,
      type: node.type,
      _id: node._id,
      level: level,
      children: node.children,
      expandable: expand
    };
  }

  /**
   * Function name : getLevel
   * Input : node
   * Output : Level of the node.
   * Desc : To Get the level of the node.
   */
  getLevel(node: TreeNode) {
    return node.level;
  }

  /**
   * Function name : isExpandable
   * Input : node
   * Output : node expanded status.
   * Desc : Return whether the node is expanded or not.
   */
  isExpandable(node: TreeNode) {
    return node.expandable;
  };

  /**
   * Function name : getChildren
   * Input : node
   * Output : children of the node.
   * Desc : To Get the children for the node.
   */
  getChildren(node: FileNode) {
    return observableOf(node.children);
  }

  /**
   * Function name : hasChild
   * Input : index, node
   * Output : node children status.
   * Desc : To Get whether the node has children or not.
   */
  hasChild(index: number, node: TreeNode) {
    return node.expandable;
  }

  /**
   * Function name : selected
   * Input : node
   * Output : selected item.
   * Desc : Selcect item.
   */
  selected(node) {
    if (node.isExpandable) this.treeControl.isExpanded(node)
    this.select = false
    this.selectednode = node._id;
    if (node != 'root') {
      this.CreateRef = node;
    }
    this.selectedElement = node
    this.elementChecked = node;
    this.show1 = true
  }

  /**
   * Function name : changeState
   * Input : node
   * Output : Folder within folder data tree toggle.
   * Desc : Toggling folder tree by double click
   */
  changeState(node) {
    node.expanded = !node.expanded
    if (node.expanded) this.treeControl.expand(node)
    else this.treeControl.collapse(node)
  }

  /**
   * Function name : AddFolder
   * Input : foldername
   * Output : new Folder.
   * Desc : new Folder.
   */
  AddFolder(foldername) {
    let duplicatefolderName = []
    let resultFolderName
    let folders = []
    if (this.selectedElement && this.selectedElement != 'root')
      folders = this.selectedElement.children
    else
      folders = this.folders.filter(folder => !folder.parentid)
    duplicatefolderName = folders.filter((folderdata: any) => folderdata.isFolder && folderdata.name == foldername && (folderdata.parentid ? folderdata.parentid == (this.selectedElement ? this.selectedElement._id : 0) : true));
    if (duplicatefolderName.length && foldername) {
      let count = 0
      do {
        count++;
        resultFolderName = foldername + ' (' + count + ')'
        let isMatch = false
        for (let i = 0; i < folders.length; i++) {
          if (folders[i].name == resultFolderName && ((folders[i].parentid != undefined) ? folders[i].parentid == (this.selectedElement ? this.selectedElement._id : 0) : true)) {
            isMatch = true;
            break;
          }
        }
        if (!isMatch)
          break;
      } while (folders.length >= count)
    }
    if (duplicatefolderName.length > 0 && resultFolderName) foldername = resultFolderName
    var data = { name: foldername, parentid: this.selectedElement ? this.selectedElement._id : 0 }
    duplicatefolderName = []
    this.documentService.createfolder(data).subscribe(data => {
      this.ngOnInit()
      this.documentService.openSnackBar("Folder created successfully", "X")
    })
  }

  /**
   * Function name : openNewFolderDialog
   * Input : null
   * Output : new folder creation.
   * Desc : It will open create folder dialogue and adding into folders data.
   */
  openNewFolderDialog() {
    let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'create' }, width: '500px', height: '200px', panelClass: "withoutpadding" });
    dialogRef.afterClosed().subscribe(res => {
      this.btn2 = false
      if (res) {
        this.AddFolder(res);
        this.folderAdded.emit({ name: res });
      }
    });
  }
  // Dialogue close
  close() {
    this.dialogRef.close("CloseButton");
  }

  /**
   * Function name : Move
   * Input : null
   * Output : File moving.
   * Desc : It will check for file availbility in folder and move accordingly.
   */
  Move() {
    if (!this.dailogData.multi) {
      if (this.selectedElement) {
        if (this.dailogData.move.isFile) {
          if (this.selectedElement._id === this.dailogData.move.folderid) { this.documentService.openSnackBar("Already in same folder ", "X"); }
          else { this.dialogRef.close(this.selectedElement); }
        }
        if (this.dailogData.move.isFolder) {
          if (this.selectedElement._id === this.dailogData.move.parentid) { this.documentService.openSnackBar("Already in same folder ", "X"); }
          else { this.dialogRef.close(this.selectedElement); }
        }
        if (this.selectedElement == 'root') {
          if (this.selectedElement.isFile) {
            if (!this.dailogData.move.folderid && this.selectedElement == 'root') { this.documentService.openSnackBar("Already in same folder ", "X"); }
            else { this.dialogRef.close(this.selectedElement); }
          }
          if (this.selectedElement.isFolder) {
            if (!this.dailogData.move.parentid && this.selectedElement == 'root') { this.documentService.openSnackBar("Already in same folder ", "X"); }
            else { this.dialogRef.close(this.selectedElement); }
          }
        }
      } else {
        this.documentService.openSnackBar("Please Select Destination/Create Folder", "X");
      }
    }
    // for multi select
    else {
      if (this.dailogData.folders.length > 0) {
        if (this.selectedElement) {
          if (this.selectedElement._id === this.dailogData.folders[0].parentid) { this.documentService.openSnackBar("Already in same folder ", "X"); }
          else { this.dialogRef.close(this.selectedElement); }
        }
        else {
          this.documentService.openSnackBar("Please Select Destination/Create Folder", "X");
        }
        if (this.selectedElement == 'root') {
          if (!this.dailogData.folders[0].parentid && this.selectedElement == 'root') { this.documentService.openSnackBar("Already in same folder ", "X"); }
          else { this.dialogRef.close(this.selectedElement); }
        }
      }
      if (this.dailogData.documents.length > 0) {
        if (this.selectedElement) {
          if (this.selectedElement._id === this.dailogData.documents[0].folderid) {
            this.documentService.openSnackBar("Already in same folder ", "X");
          } else {
            this.dialogRef.close(this.selectedElement);
          }
        }
        else {
          this.documentService.openSnackBar("Please Select Destination/Create Folder", "X");
        }
        if (this.selectedElement == 'root') {
          if (!this.dailogData.documents[0].folderid && this.selectedElement == 'root') this.documentService.openSnackBar("Already in same folder ", "X");
          else this.dialogRef.close(this.selectedElement);
        }

      }
    }

  }

  /**
   * Function name : queryInFolder
   * Input : null
   * Output : Folders data.
   * Desc : To get total folders data.
   */
  queryInFolder = function () {
    const result = [];
    if (this.dailogData.folders == undefined || !this.dailogData.folders.length) {
      this.folders.forEach(element => {
        if (!element.parentid) {
          result.push(element);
        }
        else if (element.parentid) {
          this.folders.forEach(element1 => {
            if (!element1.children) element1.children = []
            if (element.parentid == element1._id) element1.children.push(element);
          });
        }
      });
    }
    else if (this.dailogData.folders.length) {
      this.folders.forEach(element => {
        var selected_folder = this.dailogData.folders.some(x => x._id == element._id)
        if (!element.parentid && !selected_folder) {
          result.push(element);
        }
        else if (element.parentid) {
          this.folders.forEach(element1 => {
            var selected_folder = this.dailogData.folders.some(x => x._id == element._id)
            if (!element1.children) element1.children = []
            if (element.parentid == element1._id && !selected_folder) element1.children.push(element);
          });
        }
      });
    }
    if (!this.FileSubject) { this.FileSubject = new BehaviorSubject(result); }
    else { this.FileSubject.next(result); }
    return this.FileSubject.asObservable();
  }

}

/** File node data with nested structure. */
export interface FileNode {
  name: string;
  type: string;
  _id: string
  children?: FileNode[];
}

/** Flat node with expandable and level information */
export interface TreeNode {
  name: string;
  type: string;
  level: number;
  expandable: boolean;
}
