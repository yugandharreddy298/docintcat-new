import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FrontEndConfig } from "./frontendConfig"
@Injectable({
  providedIn: 'root'
})

export class OrganizationService {

  constructor(private http: HttpClient,
    private frontendconfig: FrontEndConfig) { }

  serverurl = this.frontendconfig.getserverurl();

  getserverurl() {
    return this.serverurl
  }

  // Creates a new department
  addDep(dept) {
    return this.http.post(this.serverurl + '/api/departments', dept);
  }

  // Get list of departments
  getDepartments() {
    return this.http.get(this.serverurl + '/api/departments/')
  }

  // Get list of departments
  getdeptlist() {
    return this.http.get(this.serverurl + '/api/departments/departmentslist')
  }

  // Request Shared Group Document information
  getempbygroup(id) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getempbygroup/' + id)
  }

  // Updates an existing department
  updateempdetails(details) {
    return this.http.put(this.serverurl + '/api/departments/' + details._id, details)
  }

  // Add new Employee to particular Department
  postemp(empdata) {
    return this.http.post(this.serverurl + '/api/users/addEmployee', empdata);
  }

  // Update Employee Details
  activateuser(user) {
    return this.http.post(this.serverurl + '/api/users/update/', user)
  }

  // Get Employee Data
  getemplist() {
    return this.http.get(this.serverurl + '/api/users/employeedetails')
  }

  // Filter Employess List
  SearchEmployee(search) {
    return this.http.post(this.serverurl + '/api/users/searchEmployee', search)
  }

  // Get searched department data in an organisation
  SearchDepartment(search) {
    return this.http.post(this.serverurl + '/api/departments/searchdepartment/search', search)
  }

  // Get list of employees
  getemploylist() {
    return this.http.get(this.serverurl + '/api/users/empdata');
  }

  // Update sharing records,photos,Signature,Photo,Stamp,Fieldoption,Fieldvalue,Notification when user got deleted
  updateemployeelogindetails(abc) {
    return this.http.post(this.serverurl + '/api/users/employeelogindetails/', abc)
  }

  // Update User
  removeempdetails(c) {
    return this.http.put(this.serverurl + '/api/users' + c._id, c)
  }

  // Get List of Users in selected Departments
  getShareable_employees(departmentid) {
    return this.http.get(this.serverurl + '/api/users/shareable_employees/' + departmentid)
  }

  // Get List of emails in selected Departments
  getShareableemails(departmentid) {
    return this.http.get(this.serverurl + '/api/users/shareableemails/' + departmentid)
  }

  // Request Shared Document in Organization information
  getorgsharingpeople(id) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getorgsharingpeople/' + id);
  }

  // Request Shared Group Document information
  getshareDocbasedemp(id) {
    return this.http.get(this.serverurl + '/api/sharingpeoples/getshareDocbasedemp/' + id);
  }

  // Update individual SharedRecords
  updateorgsharingpeople(did, e) {
    return this.http.put(this.serverurl + '/api/sharingpeoples/updateorgsharingpeople/' + did, e)
  }

  // create SharedRecords for departmnets
  Shareto_Department(sharedata) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/Shareto_Department', sharedata)
  }

  // Request SharedRecords of departmnets
  SharedWith_Departments(departments) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/SharedWith_Departments', departments)
  }

  // Update individual SharedRecords
  updatesharedpeople(Shareddoc) {
    return this.http.put(this.serverurl + '/api/sharingpeoples/' + Shareddoc._id, Shareddoc)
  }

  // Update All SharedRecords
  AllSharedpeopleupdate(Shareddoc) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/AllSharedpeopleupdate', Shareddoc)
  }

  // Update individual SharedRecords
  removedepartsharing(id) {
    return this.http.put(this.serverurl + '/api/sharingpeoples/removedepartsharing/' + id, id)
  }

  // create SharedRecords for multi departmnets
  multiShareto_Department(data) {
    return this.http.post(this.serverurl + '/api/sharingpeoples/multisharetodepartment', data);
  }

  // Add new Employees to particular Department
  addemployeesfromexcel(data) {
    return this.http.post(this.serverurl + '/api/users/addemployeess', data);
  }
}
