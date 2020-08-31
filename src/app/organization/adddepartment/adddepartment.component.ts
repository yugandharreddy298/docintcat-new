import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../user.service';
import { DepartmentdialogComponent } from '../departmentdialog/departmentdialog.component';
import { MatDialog } from '@angular/material';
import { AdminService } from '../../admin.service';
import { OrganizationService } from '../../organization.service';
import { MatSnackBar } from '@angular/material';
import { DocumentService } from '../../document.service';
declare var $;
@Component({
  selector: 'app-adddepartment',
  templateUrl: './adddepartment.component.html',
  styleUrls: ['./adddepartment.component.css']
})
export class AdddepartmentComponent implements OnInit {
  errorshow = false;
  errorshow1 = false;
  check: any;
  checkdept: boolean;
  userdata: any;
  Departmentdata: any;
  departmentchecked = false;
  show: boolean;
  edit: any;
  delete: any;
  deptname: any;
  employees: any;
  profiledata: any;
  getemployeedata: any = [];
  parentdepartmentid;
  data: any;
  formSubmitted: boolean;
  delete1;
  windowWidth: any;
  isloading = true;
  nodepartment = true;
  searchresult = true;
  iebrowser;
  selectRecord;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.windowWidth = window.innerWidth;
  }
  constructor(
    public snackBar: MatSnackBar,
    private documentservice: DocumentService,
    private userservice: UserService,
    public dialog: MatDialog,
    private adminService: AdminService,
    private organizationService: OrganizationService) { this.getScreenSize(); }


  /**
   * Function name : getemp
   * input:null
   * output: to get all employees of the organisation
   */
  getemp() {
    this.isloading = true;
    this.organizationService.getemplist().subscribe(data => {
      this.getemployeedata = data;
      this.isloading = false;
    });
  }
  /**
   * Function name : getdeptlist
   * input:null
   * output: to get all departments of the organisation
   */
  getdeptlist() {
    this.isloading = true;
    this.organizationService.getDepartments().subscribe(data => {
      this.Departmentdata = data;
      this.employees = data;
      if (this.employees.length === 0 && this.employees) {
        this.searchresult = false;
      } else {
        this.searchresult = true;
      }
      this.isloading = false;
    });
  }

  ngOnInit() {
    this.parentdepartmentid = '';
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true;
      $('.ietop1').css('margin-top', '100px');
    } else {
      this.iebrowser = false;
    }
    $(document).ready(() => {
      const divwidth = $('.divwdth').width();
      const tablewidth = $('.tblwdth').width();
      if (tablewidth > divwidth) {
        $('.divwdth').addClass('table-responsive');
      } else {
        $('.divwdth').removeClass('table-responsive');
      }
    });
    $(window).resize(() => {
      const divwidth = $('.divwdth').width();
      const tablewidth = $('.tblwdth').width();
      if (tablewidth > divwidth) {

        $('.divwdth').addClass('table-responsive');


      } else {
        $('.divwdth').removeClass('table-responsive');
      }
    });


    this.getemp();
    this.getdeptlist();
    this.adminService.getProfile().subscribe(data => {
      this.profiledata = data;
      if (this.getemployeedata && this.Departmentdata) {
        this.getemployeedata.forEach(element => {
          this.Departmentdata.forEach(element1 => {
            if (element1.parentdepartmentid != null && element._id === element1.parentdepartmentid._id) {
              element1.employeeemail = element.email;
            }
          });
        });
      }
    });
  }

  /**
   * Function name : onKeyDown
   * Input:Enter department name
   * output: to validate department name using Regx and check whether department name already exits
   */
  onKeyDown(departmentname) {
    this.check = false;
    const regx = new RegExp('([A-Za-z]|[0-9])');
    if (regx.test(departmentname)) {
      this.userservice.getDept(departmentname.toUpperCase()).subscribe(data => {
        this.userdata = data;
        this.departmentchecked = true;
        if (this.userdata.data) {
          this.check = true;
        }
      });

    }
  }
  /**
   * Function name : adddepartment
   * Input{formData}:submitted form data
   * output: Add new Department
   */
  adddepartment(addForm) {
    if (addForm.value.deptname && addForm.value.parentdepartmentid && this.userdata.data) {
      this.documentservice.openSnackBar('Department Already Exists', 'X');
    } else {
      if (addForm.value.deptname && addForm.value.parentdepartmentid && !this.userdata.data) {
        this.isloading = true;
        addForm.value.deptname = addForm.value.deptname.toUpperCase();
        this.organizationService.addDep(addForm.value).subscribe(data => {
          if (data) {
            this.isloading = false;
            document.getElementById('sample').click();
            this.userdata = data;
            this.closeModel1(addForm);
            if (this.userdata.data) {
              this.check = true;
            }
            this.show = !this.show;
            this.organizationService.getDepartments().subscribe(data1 => {
              this.Departmentdata = data1;
              this.searchresult = true;
              this.documentservice.openSnackBar('Department Added Successfully', 'X');
            });
          } else {
            this.isloading = false;
          }
        });
      }

    }

  }
  /**
   * Function name : closeModel1
   * Input{formData}:submitted form data
   * output:closes the modal
   */
  closeModel1(form) {
    if (form) { this.deptname = ''; this.parentdepartmentid = ''; }
    this.errorshow = false;
    this.errorshow1 = false;
  }
  /**
   * Function name : editData
   * Input:selected department data
   * output:update the changes made to the department details
   */
  editData(element) {
    const filedialog = this.dialog.open(DepartmentdialogComponent, {
      width: '1140px',
      panelClass: 'withoutpadding',
      disableClose: false,
      autoFocus: true,
      data: element
    });
    filedialog.afterClosed().subscribe(res => {
      if (res === true) {
        this.isloading = true;
        this.organizationService.getDepartments().subscribe(data => {
          this.Departmentdata = data;
          if (data) {
            this.isloading = false;
            this.documentservice.openSnackBar('Department Updated Successfully', 'X');
          } else {
            this.isloading = false;
          }
        });
      }
    });

  }
  /**
   * Function name : deleteData
   * Input:selected department data
   * output:delete the selected department from the list
   */
  deleteData(a) {
    const obj = this.getemployeedata.some(x => (x.department && x.department.deptname) === a.deptname);
    if (obj === true) {
      this.documentservice.openSnackBar('Sorry Cannot Delete Department, Already Assigned To Employees', 'X');

    } else {

      const filedialog = this.dialog.open(DepartmentdialogComponent, {
        width: '500px',
        disableClose: false,
        autoFocus: true,
        panelClass: 'deletemod',
        data: { name: 'delete', employee: a }

      });
      filedialog.afterClosed().subscribe(res => {
        if (res) {
          this.isloading = true;
          a.active = false;
          this.organizationService.updateempdetails(a).subscribe(data => {
            if (data) {
              this.isloading = false;
              this.organizationService.getDepartments().subscribe(data1 => {
                this.Departmentdata = data1;
                if (this.Departmentdata.length === 0 && this.Departmentdata) {
                  this.searchresult = false;
                } else {
                  this.searchresult = true;
                }
                this.documentservice.openSnackBar('Department Deleted Successfully', 'X');
              });
            } else { this.isloading = false; }
          });
        } else { this.isloading = false; }
      });

    }
  }

  /**
   * Function name : sortDeptAsc
   * input:null
   * output:Sort Departmentname in ascending order
   */
  sortDeptAsc() {
    this.Departmentdata.sort((a, b) => {
      const nameA = a.deptname.toLowerCase();
      const nameB = b.deptname.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Function name : sortDeptDsc
   * input:null
   * output:Sort Departmentname in descending order
   */
  sortDeptDsc() {
    this.Departmentdata.sort((a, b) => {
      const nameA = a.deptname.toLowerCase();
      const nameB = b.deptname.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });

  }
  /**
   * Function name : sortCompAsc
   * input:null
   *  output:Sort Companyname by using organisation id in ascending order
   */
  sortCompAsc() {

    this.Departmentdata.sort((a, b) => {
      const nameA = a.organizationid.companyname.toLowerCase();
      const nameB = b.organizationid.companyname.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });

  }
  /**
   * Function name : sortCompDsc
   * input:null
   * output:Sort Companyname by using organisation id in descending order
   */
  sortCompDsc() {
    this.Departmentdata.sort((a, b) => {
      const nameA = a.organizationid.companyname.toLowerCase();
      const nameB = b.organizationid.companyname.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }



  /**
   * Function name : disp
   * input :null
   * output:make check variable false to validate department name
   */
  disp() {
    this.check = false;

  }

  /**
   * Function name : searchBackend
   * Input{formData}:submitted formdata
   * output:Fetched results based on search conditions
   */
  searchBackend(searchdata) {
    const data = { search: searchdata };
    this.organizationService.SearchDepartment(data).subscribe(data1 => {
      this.Departmentdata = data1;
    });
  }

  /**
   * Function name : searchdepartments
   * Input:input data of search fiels
   * output:Fetched results based on search conditions
   */
  searchdepartments(searchdata) {
    if (searchdata && searchdata.length > 0) {
      const data = { search: searchdata };
      this.organizationService.SearchDepartment(data).subscribe(data1 => {
        this.Departmentdata = data1;
      });
    } else {
      this.documentservice.openSnackBar('Please Enter text ', 'X');
    }
  }
  /**
   * Function name : cancel
   * Input:open modal form data
   * output:reset the form data
   */
  cancel(data) {
    data.resetForm();
  }
}


