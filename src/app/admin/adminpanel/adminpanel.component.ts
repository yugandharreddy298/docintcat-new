import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../user.service';
import { MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
import { DocumentService } from '../../document.service';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';

@Component({
  selector: 'app-adminpanel',
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.css']
})

export class AdminpanelComponent implements OnInit {

  constructor(private documentService: DocumentService, 
    private userService: UserService, 
    public dialog: MatDialog) { }
  displayedColumns: string[] = ['name', 'type', 'active', 'view'];
  dataSource: MatTableDataSource<Users>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  Allusers: any = [];
  filterData: any;
  filterdata1;
  selected;
  today;
  fromdate;
  todate;
  Usersdata: any;
  type;
  active;
  search;

  ngOnInit() {
    this.userService.getRegisteredUsers().subscribe((data: any) => {
      this.Allusers = data;
      this.dataSource = new MatTableDataSource(this.Allusers);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Function name : userStatusUpdate
   * Input : user, status
   * Output : User status.
   * Desc : To check user status whether it is active or blocked.
   */
  userStatusUpdate(user, status) {
    const st = status ? 'Un Block' : 'Block';
    const dialogRef = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'needtoblockaccount', blockMsg: 'Are you want to ' + st + ' the account?' },
        disableClose: false, width: '500px', panelClass: 'deletemod'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        user.status = status;
        this.userService.userStatusUpdate(user).subscribe(data => {
          this.documentService.openSnackBar('Account is ' + st, 'X');
        });
      }
    });
  }

  /**
   * Function name : filterdate
   * Input : search
   * Output : Filtered required data.
   * Desc : To get user filtered data.
   */
  filterdate(search) {
    this.filterData = {};
    this.filterData.where = {};
    const d = new Date(search.value.fromdate);
    const sevenDaysFromNow = d.setDate(d.getDate() + 0);
    const FromNow = new Date(sevenDaysFromNow);
    const d1 = new Date(search.value.todate);
    const sevenDaysFromNow1 = d1.setDate(d1.getDate() + 1);
    const To = new Date(sevenDaysFromNow1);
    if (search.value.type) {
      this.filterData.where.type = search.value.type;
    }
    if (search.value.active) {
      this.filterData.where.active = search.value.active;
    }
    if (search.value.fromdate) {
      this.filterData.where.created_at = { $gte: FromNow };
    }
    if (search.value.todate) {
      this.filterData.where.created_at = { $lt: To };
    }
    if (search.value.fromdate && search.value.todate) {
      this.filterData.where.created_at = { $gte: FromNow, $lt: To };
    }
    this.userService.filterusers(this.filterData).subscribe((data: any) => {
      this.Allusers = data;
    });
  }

   /**
   * Function name : cancel
   * Input : data
   * Output : Filter reset.
   * Desc : To clear the filter data.
   */
  cancel(data) {
    data.resetForm();
  }

  /**
   * Function name : sortNameAsc
   * Input : null
   * Output : Sorted Name in Ascending Order.
   * Desc : sorting name.
   */
  sortNameAsc() {
    this.Allusers.sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : sortNameDsc
   * Input : null
   * Output : Sorted Name in Descending Order.
   * Desc : sorting name.
   */
  sortNameDsc() {
    this.Allusers.sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : sortEmailAsc
   * Input : null
   * Output : Sorted Email in Ascending Order.
   * Desc : sorting Email.
   */
  sortEmailAsc() {
    this.Allusers.sort((a, b) => {
      const emailA = a.email;
      const emailB = b.email;
      if (emailA > emailB) { return 1; }
      if (emailA < emailB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : sortEmailDsc
   * Input : null
   * Output : Sorted Email in Descending Order.
   * Desc : sorting email.
   */
  sortEmailDsc() {
    this.Allusers.sort((a, b) => {
      const emailA = a.email;
      const emailB = b.email;
      if (emailA < emailB) { return 1; }
      if (emailA > emailB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : sortTypeAsc
   * Input : null
   * Output : Sorted type in Ascending Order.
   * Desc : sorting type.
   */
  sortTypeAsc() {
    this.Allusers.sort((a, b) => {
      const nameA = a.type;
      const nameB = b.type;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : sortTypeDsc
   * Input : null
   * Output : Sorted type in Descending Order.
   * Desc : sorting type.
   */
  sortTypeDsc() {
    this.Allusers.sort((a, b) => {
      const nameA = a.type;
      const nameB = b.type;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : searchBackend
   * Input : search
   * Output : Searched data.
   * Desc : Searching All Users.
   */
  searchBackend(search) {
    const data = { search: search.value.search };
    this.userService.Searchuser(data).subscribe(data => {
      this.Allusers = data;
    });
  }
}

export interface Users {
  name: string;
}
