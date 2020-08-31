import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../user.service';
import { OrganizationService } from '../../organization.service';
import { AdminService } from '../../admin.service';
@Component({
  selector: 'app-departmentdialog',
  templateUrl: './departmentdialog.component.html',
  styleUrls: ['./departmentdialog.component.css']
})
export class DepartmentdialogComponent implements OnInit {
  deptname: any;
  name: any;
  userdata: any;
  check: any;
  Departmentdata;
  profiledata;
  getemployeedata;
  parentdepartmentid: any;
  companyname: any;
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DepartmentdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private organizationService: OrganizationService,
    private adminService: AdminService, private userservice: UserService) { }

  ngOnInit() {
    this.deptname = '';
    if (this.data.name !== 'delete') { this.deptname = this.data.deptname; }
    if (this.data.organizationid) { this.companyname = this.data.organizationid.companyname; }
    this.organizationService.getDepartments().subscribe(data => {
      this.Departmentdata = data;
    });

    this.adminService.getProfile().subscribe(data => { // to get profile data
      this.profiledata = data;
      this.organizationService.getemplist().subscribe(getemployeedata => { // to get all employee details
        this.getemployeedata = getemployeedata;
        if (this.data.parentdepartmentid) { this.parentdepartmentid = this.data.parentdepartmentid._id; }
      });
    });
  }

/**
 * Function name : updateDetails
 * input{formdata}:submitted formdata
 * output: update the selected department details
 */
  updateDetails(emp) {
    const updatedata = {
      _id: this.data._id,
      deptname: emp.value.deptname.toUpperCase(),
      parentdepartmentid: emp.value.parentdepartmentid
    };
    if (emp.value.deptname !== '' && emp.value.parentdepartmentid !== '') {
      this.organizationService.updateempdetails(updatedata).subscribe(data => {
        this.dialogRef.close(true);
      });
    }

  }
/**
 * Function name : onKeyDown
 * input:Entered department name
 * output: validate department name and check Whether department name already exits or not
 */
  onKeyDown(departmentname) {
    this.check = false;
    const regx = new RegExp('([A-Za-z]|[0-9])');
    if (regx.test(departmentname)) {
      this.userservice.getDept(departmentname.toUpperCase()).subscribe(data => {
        this.userdata = data;
        if (this.userdata.data) {
          this.check = true;
        }
      });
    }
  }
}
export interface DialogData {
  title: string;
  content: string;
}
