import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OrganizationService } from '../../organization.service';

@Component({
  selector: 'app-employeedialog',
  templateUrl: './employeedialog.component.html',
  styleUrls: ['./employeedialog.component.css']
})
export class EmployeedialogComponent implements OnInit {
  userdata: any;
  check: any;
  fname: any;
  lname: any;
  mobilenumber: any;
  email: any;
  name: any;
  deptname: any;
  departments;
  gender: any;
  department: any;
  departmentname: any;
   constructor(
    public dialogRef: MatDialogRef<EmployeedialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private organizationService: OrganizationService) { }

    ngOnInit() {
    this.organizationService.getDepartments().subscribe(data => {
      this.departments = data;
    });
    if (this.data.employee) {
      this.fname = this.data.employee.fname;
      this.lname = this.data.employee.lname;
      this.mobilenumber = this.data.employee.mobilenumber;
      this.email = this.data.employee.email;
      if (this.data && this.data.employee.gender ) {
        if (this.data.employee.gender === 'F' || this.data.employee.gender === 'f'
        || this.data.employee.gender === 'female' || this.data.employee.gender === 'Female') {
          this.gender = 'Female';
        } else if (this.data.employee.gender === 'M'
        || this.data.employee.gender === 'm'
        || this.data.employee.gender === 'male'
        || this.data.employee.gender === 'Male') {
          this.gender = 'Male';
        } else { this.gender = this.data.employee.gender.toLowerCase(); }
      }
      if (this.data.employee.department) { this.department = this.data.employee.department._id;
    }
  }
    if (this.data.name !== 'delete' && this.data.name !== 'exitemployee') { this.name = this.data.name; }

  }
 /**
  * Function name : departname
  * input:selected department
  * output: Assign the selected department to a variable
  */
  departname(id): void {
    this.department = id;
    const dept = this.departments.find(x => x._id === id);
    if (dept) { this.departmentname = dept.deptname; }
  }

 /**
  * Function name : updateempDetails
  * input{formdata}:submitted formdata
  * output: update the selected employee details
  */
 updateempDetails(emp) {
    if (emp.valid) {
      emp._id = emp.department;
      const data1 = {
        mobilenumber: emp.value.mobilenumber,
        lname: emp.value.lname,
        email: emp.value.email,
        fname: emp.value.fname,
        gender: emp.value.gender,
        departmentname: this.departmentname,
        department: this.department,
      };
      this.organizationService.updateemployeelogindetails(data1).subscribe(data => {
        this.dialogRef.close(true);  });
    }

  }
}
export interface DialogData {
  title: string;
  content: string;
}
