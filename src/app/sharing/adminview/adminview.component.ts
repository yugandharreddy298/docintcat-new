import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { DocumentService } from '../../document.service';
import { Observable, Subject } from 'rxjs'
import { AdminService } from '../../admin.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;
@Component({
  selector: 'app-adminview',
  templateUrl: './adminview.component.html',
  styleUrls: ['./adminview.component.css']
})
export class AdminviewComponent implements OnInit {
  fileViewTimeChart: any;
  chartOptions: any;
  fileViewCharts: any;
  fileViewDeviceChart: any;
  pieChart: any;
  bsConfig;
  maxDate: Date;
  datepicker: boolean = false;
  profiledata: Object;
  email: any;
  tyd;
  allDocumentsList: any;
  recentFileList: any;
  documentsList: any;
  documentsIdList: any;
  docListCount: any;
  devicesCount: any;
  dateSelected: any;
  start: any;
  end: any;
  documentsIdDevicesList: any;
  documentsListDevices: any;
  startDate: any;
  endDate: any;
  dateSelected1: any;
  fileData: any
  pendingList = []
  InprogressList = []
  completedList: any;
  documents = []
  documentData = []
  documentsListTiming = []
  documentsIdTimingList = [];
  filterData
  tdyResult = []
  diff
  tdyResultData = []
  result
  miniutes = []
  title
  showDate
  showDate2
  showDate4
  isloading: boolean = true
  myplaceHolder: String = ''
  myplaceHolder3: String = ''
  myplaceHolder2: String = ''
  Dateplaceholder1: String = ''
  Dateplaceholder2: String = ''
  Dateplaceholder3: String = ''
  Dateplaceholder4: String = ''
  count1 = 0
  count2 = 0
  count3 = 0
  showtoday: boolean = true;
  showyest: boolean = false;
  showtoday1: boolean = false
  showyest1: boolean = false
  showtoday2: boolean = true
  showyest2: boolean = false
  showtoday3: boolean = false
  showyest3: boolean = false 
  fileViewdate
  Devicedate
  mapviewdate
  fileviewdate
  clearintervaldata
  nofilevIews:boolean; // show message when no file Views in selected dates
  noFileviewTiming:boolean;  // show message when no file View Timings in selected dates
  noDeviceViews:boolean; // show message when no device Views in selected dates
  constructor(private documentService: DocumentService, private adminservice: AdminService, private http: HttpClient) {
    this.maxDate = new Date(); 
    this.maxDate.setDate(this.maxDate.getDate()); // set max Date  to date pickers
    this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue' }); // initial date picker
  }

  ngOnInit() {

  /**
   * Desc : add Margin top to class{ietop} in IE browser
   */ 
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $(".ietop").css("margin-top", "100px");
    }
    this.Dateplaceholder1 = "Select Date Range" // add placeholder to file view datepicker
    this.Dateplaceholder2 = "Select Date Range" // add placeholder to file view time datepicker
    this.Dateplaceholder3 = "Select Date Range"// add placeholder to map  datepicker 
    this.Dateplaceholder4 = "Select Date Range" // add placeholder to file view Device  datepicker 
    this.getProfile(); // get profile
    // this.dateSelected = 'Today'; // set selected data as today  in file view 
    // this.dateSelected1 = 'Today'; // set selected data as  today in file view time 
    this.myplaceHolder2 = null
    this.myplaceHolder3 = null
    this.getAllDocuments(); // get all documents 
    this.getRecentFiles();// get recent files (Get latest 6 records from document collection)
   /**
   * Desc : initialise chart options for file view and file view timing chart
   */   
    this.chartOptions = {
      title: {
        display: true,
        fontColor: '#000000',
        fontStyle: 'bold',
      },
      legend: {
        display: false,
        labels: {
          fontColor: 'rgb(255, 99, 132)'
        }
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function (tooltipItem) {
            return this._data.labels[tooltipItem[0].index];
          }
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          barPercentage: 0.3,
          display: true,
          ticks: {
            minRotation: 0,
            maxRotation: 0,
            autoSkip: false,
            callback: function (label, index, labels) {
              if (label.length > 8) {
                var data = '...'
                if (labels.length > 8) {

                  return label.slice(0, 3).concat(data)
                }
                else
                  return label.slice(0, 4).concat(data)
              } else {
                var data = '..'
                if (labels.length < 8) {
                  return label;
                }
                else return label.slice(0, 2).concat(data)
              }
            }
          },
        },
        ],
        yAxes: [{
          display: true,
          ticks: {
            callback: function (value, index, values) {
              if (Math.floor(value) === value) {
                return value;
              }
            },
            beginAtZero: true
          },
          beginAtZero: true
        }]
      }
    }
  /**
   * Desc : clear Clipboard data in IE 
   */   
    if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
      this.clearintervaldata = setInterval(() => {
        this.ccb();
      }, 100);
    }
  }

  ngOnDestroy() {
    clearInterval(this.clearintervaldata); // stop  clear clipboard 
  }

  /**
   * Desc : set  Clipboard  null  in IE for prevent CTRL+ print 
   */ 
  clearData() {
    window["clipboardData"].setData('text', '')
  }
  /**
   * Desc : clear Clipboard data in IE 
   */ 
  ccb() {
    if (window["clipboardData"]) {
      window["clipboardData"].clearData();
    }
  }
  /**
   * Function name : getProfile
   * Input : null 
   * Output : {Json}  User   
   * Desc : Get Profile data
   * api : /users/me
   * apiError : {String} 401-Unauthorized.
   */
  getProfile() {
    this.adminservice.getProfile().subscribe(data => {
      this.isloading = false
      this.profiledata = data;
      this.email = this.profiledata
    });
  }
  /**
   * Function name : getRecentFiles
   * Input : null 
   * Output : {Array}  Files   
   * Desc : {array}  Get latest 6 records from document collection
   * api : /documents/recentfiles
   * apiError :  500-InternalServerError SERVER error.
   */
  getRecentFiles() {
    this.documentService.getSearch('documents/recentfiles').subscribe(data => {
      this.isloading = false
      this.recentFileList = data;
      this.documentsList = [];
      this.documentsIdList = [];
      this.documentsListDevices = [];
      this.documentsIdDevicesList = [];
      this.documents = [];
      this.recentFileList.forEach(file => {
        this.documentsList.push(file.name); //for File View 
        this.documentsIdList.push(file._id); // for File View 
        this.documentsListTiming.push(file.name); // for File View Timing
        this.documentsIdTimingList.push(file._id);  // for File View Timing
        this.documentsListDevices.push(file); // for File View Devices
        this.documentsIdDevicesList.push(file._id); // for File View Devices
        if (this.recentFileList.indexOf(file) == (this.recentFileList.length - 1)) {
          this.FilelistTiming(''); // load File View Timing Chart
          this.todayDatamap('today'); // load Map
          this.fileViewDevices() // load File View Device Chart
          setTimeout(() => {
            this.fileview(); // load File View  Chart

          }, 1000);
        }
      });
    })
  }

  /**
   * Function name : todayDatamap
   * Input : Title { Today, Yesterday,Custom Date} 
   * Output : set Date   
   * Desc : Set Date while choose from date picker or today or yesterday
   */
  todayDatamap = async function (title) {
    return new Promise(async (resolve, reject) => {
      this.filterData = {};
      this.filterData.where = {};
      var v = moment()
      let now
      if (title == "today") {
        this.Dateplaceholder3 = "Select Date Range"
        this.mapviewdate = null
        this.tyd = 'today'
        now = v.format('YYYY-MM-DD');
        this.filterData.where.createdAt = { $gte: now + 'T00:00:00.000Z' }
        this.todaydate = this.filterData.where.createdAt.$gte
        this.adminservice.gettdates.emit(this.todaydate);
      } else if (title == "yesterday") {
        this.mapviewdate = null
        this.Dateplaceholder3 = "Select Date Range"
        this.tyd = "yesterday"
        now = v.subtract(1, 'days').format('YYYY-MM-DD');
        this.filterData.where.createdAt = { $gte: now + 'T00:00:00.000Z' }
        this.yesterdaydate = this.filterData.where.createdAt.$gte;
        this.adminservice.getdates.emit(this.yesterdaydate);
      } else if (title == 'Custom Date') {
        this.tyd = 'Custom Date'
      }
    })
  }
  /**
   * Function name : selectDatemap
   * Input : Info {Custom Date} , event
   * Output : set Custom date   
   * Desc : Set custom  while choose from date picker for show location views in maps
   */
  selectDatemap(info, event) {
    if (event && info == 'Custom Date') {
      var mapdate = []
      this.Dateplaceholder3 = null
      this.showtoday2 = false
      this.showyest2 = false
      var s = moment(event[0]).format('YYYY-MM-DD');
      var e = moment(event[1]).add(1, 'days').format('YYYY-MM-DD');
      mapdate.push(s, e)
      this.adminservice.getdatespick.emit(mapdate);
    }
  }
  /**
   * Function name : getAllDocuments
   * Input : null 
   * Output : {Array}  Files   
   * Desc :   Get All Active Records of  user from document collection
   * api : /documents
   * apiError :  500-InternalServerError SERVER error.
   */
  getAllDocuments() {
    this.documentService.getSearch('documents').subscribe(data => {
      this.fileData = data;
      if (this.fileData.length == 0) {
        this.myplaceHolder2 = 'Select File'
        this.myplaceHolder3 = 'Select File'
        this.myplaceHolder = 'Select File'
      }
      // update status of sharing 
      this.pendingList = this.fileData.filter(file => file.status == "Waiting for Sign" || file.status == "Review" || file.status == "Partially completed" || file.status == "Completed");
      this.InprogressList = this.fileData.filter(file => file.status == "Partially completed");
      this.completedList = this.fileData.filter(file => file.status == "Completed");
      setTimeout(() => {
        this.piechart() // load Pie Chart of file view status
      }, 100)
    })
  }

  /**
   * Function name : selectedDate
   * Input : Info{ Today,Yesterday,Custom Date} ,event
   * Output : Set Date for file view chart  
   * Desc :   Set Date of File View chart {today, Yesterday, custom date}
   */
  selectedDate(info, event) {
    this.dateSelected = info;
    if (event && info == 'Custom Date') {
      this.Dateplaceholder1 = null
      this.showtoday = false
      this.showyest = false
      this.start = moment(event[0]).format('YYYY-MM-DD');
      this.end = moment(event[1]).add(1, 'days').format('YYYY-MM-DD');
    } else {
      this.fileViewdate = null
      this.Dateplaceholder1 = "Select Date Range" 
    }
    this.fileview(); // load File View Chart When select date 
  }

  /**
   * Function name : Filelist
   * Input : event (files Selection)
   * Output : select and deselect files 
   * Desc :   Select and deselect files from mat select to show the data of selected files only (File View chart)
   */
  Filelist(event) {
    if (!event.source._selected) {
      this.count1--;
    }
    else if (event.source._selected) {
      this.count1++
    }
    if (this.count1 == 0) {
      this.myplaceHolder3 = 'Select File'; // show placeholder when there is no selected files 
    }
    else if (this.count1 > 0) {
      this.myplaceHolder3 = null; // hide placehoder when selected Files 
    }
    if (event.isUserInput) {
      this.nofilevIews=false
      var check = this.documentsIdList.some(x => x == event.source.value);
      var docname = this.fileData.find(x => x._id == event.source.value);
      if (event.source.selected && !check && docname) {
        this.documentsIdList.push(docname._id); // add selected files to Id's list         
      }
      else if (check && !event.source.selected && docname) {
        for (var i = 0; i < this.documentsIdList.length; i++) {
          if (this.documentsIdList[i] === docname._id) {
            this.documentsIdList.splice(i, 1);  // Remove deselected files from Id's list 
            i--;
          }
        }
      }
      if (this.documentsIdList.length) {
        this.dateSelected=''
        this.fileview(); // load File View Chart when select and deselect files
      }
      else this.hideFileViewChart(); // hide file view chart when no selected Files 
    }
  }

  /**
   * Function name : fileview
   * Input : null
   * Output : set Date and get file view count  
   * Desc :   get file view count  
   */
  fileview() {
    var res: any = {};
    res.where = {};
    var v = moment();
    // Today
  if (this.dateSelected == 'Today') { 
      let now = v.format('YYYY-MM-DD');
      res.where.createdAt = { $gte: now + 'T00:00:00.000Z' };
      if(this.fileData && this.fileData.length!=0){
      this.documentsIdList=[]
      this.fileData.forEach(element => {
          if(element.createdAt >= now + 'T00:00:00.000Z'){
            this.documentsIdList.push(element._id)
          } 
        });
      }  
    }
    // Yesterday
    if (this.dateSelected == 'Yesterday') {
        let now = v.subtract(0, 'days').format('YYYY-MM-DD');
        let yesterday = v.subtract(1, 'days').format('YYYY-MM-DD');
        res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
        if(this.fileData && this.fileData.length!=0){
          this.documentsIdList=[]
          this.fileData.forEach(element => {        
            if(element.createdAt >=yesterday+ 'T00:00:00.000Z' &&  element.createdAt <now+ 'T00:00:00.000Z'){
              this.documentsIdList.push(element._id)
            } 
          });
        }   
    }
    if (this.dateSelected == 'Custom Date' && this.start && this.end) {
      let now = moment(this.end).add(1, 'days').format('YYYY-MM-DD');
      let yesterday = moment(this.start).format('YYYY-MM-DD');
      res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
      if(this.fileData && this.fileData.length!=0){
        this.documentsIdList=[]
        this.fileData.forEach(element => {        
          if(element.createdAt >=yesterday + 'T00:00:00.000Z' &&  element.createdAt <now +'T00:00:00.000Z'){
            this.documentsIdList.push(element._id)
          } 
        });
      }  
    }
    res.where.message = 'Viewed';
    res.where.documentid = { $in: this.documentsIdList };
    // if Files  are selected
    if (this.documentsIdList.length) {
      var data = this.today(res);
      data.subscribe(result => {
        this.docListCount = [];
        this.docListCount = this.uniqueDocCount(this.documentsIdList, result) // get Unique  file view count
        this.uniqueDeviceCount(this.documentsIdList, result)  // get Unique  file view count
        if (this.docListCount) setTimeout(() => { this.fileViewChart(); }, 0) // load File view chart
      })
    }
  }

   /**
   * Function name : uniqueDocCount
   * Input : Selected Document List , viewed Logs of Selected Files
   * Output : return File view count of selected documents 
   * Desc :   get file view count  of selected file 
   */
  uniqueDocCount(documentList, result) {
    var arr = [];
    var filearray
    documentList.forEach(element => { ///fetching the html array
      var data = this.fileData ? this.fileData.find(x => x._id == element) : undefined;  ///finding the element in all documents
      if (data != undefined) var index = documentList.find(x => x == data._id);
      ///fetching the index of html array
      var filenames = result.filter(x => x.documentid._id == element)
      filearray = {
        y: filenames.length,
        name: filenames[0] ? filenames[0].documentid.name : data.name,
        id: filenames[0] ? filenames[0].documentid._id : data._id
      }
      arr.push(filearray)
    });
    return arr;
  }

 /**
   * Function name : today
   * Input : Query { where.createdAt }
   * Output : get logs of file order by created date 
   * Desc :   get logs of file order by created date 
   * api : documentlogs/filesFilter/
   * apiError :  500-InternalServerError SERVER error.
   */
  today(res): Observable<any> {
    if (!res.where) res.where = {};
    var filterdata = new Subject<any>();
    this.documentService.search('documentlogs/filesFilter/', res).subscribe((data: any) => {
      filterdata.next(data)
    })
    return filterdata.asObservable();
  }
 /**
   * Function name : fileViewChart
   * Input : null
   * Desc : load File View Chart 
   */
  fileViewChart() {
    var v = []
    var resultfile = []
    this.documentsList = this.documentsList.filter(file => file = file.split('.pdf'))
    this.docListCount.forEach((element, index) => {
      var elements = this.docListCount[index].name;
      resultfile.push(elements)
    });
    if (this.fileViewCharts != undefined || this.fileViewCharts != null) {
      this.fileViewCharts.destroy();
    }
    var ctx = document.getElementById('fileView-chart');
    if (ctx) {
      ctx.style.display = "";
      this.fileViewCharts = new Chart(ctx, {
        type: 'bar',
        labelDisplay: "AUTO",
        theme: "fusion",
        data: {
          labels: resultfile,
          datasets: [{
            label: "Viewed Count",
            backgroundColor: '#fd6e36',
            data: this.docListCount,
          }],
        },
        options: this.chartOptions
      });
    }
  }
 /**
   * Function name : hideFileViewChart
   * Input : null
   * Desc : Hide  File View Chart if there is no selected Files  
   */
  hideFileViewChart() {
    var ctx = document.getElementById('fileView-chart');
  }

  /**
   * Function name : selectDate
   * Input : Info {Custom Date} , event or false 
   * Output : set Custom date   
   * Desc : Set custom  while choose from date picker for show File View Device charts
   */
  selectDate(info, event) {
    this.dateSelected1 = info;
    if (event && info == 'Custom Date') {
      this.Dateplaceholder4 = null
      this.showtoday3 = false
      this.showyest3 = false;
      this.startDate = moment(event[0]).format('YYYY-MM-DD');
      this.endDate = moment(event[1]).add(1, 'days').format('YYYY-MM-DD');
      this.fileViewDevices();
    }
    else {
      this.fileviewdate = null
      this.Dateplaceholder4 = "Select Date Range"
    }

    if (!(info == 'Custom Date')) this.fileViewDevices(); // Load File View Device Chart 
  }

  /**
   * Function name : fileListDevices
   * Input : event (files Selection)
   * Output : select and deselect files 
   * Desc :   Select and deselect files from mat select to show the data of selected files only (file View Device Chart)
   */
    fileListDevices(event) {
    if (!event.source._selected) {
      this.count3--;
    }
    else if (event.source._selected) {
      this.count3++
      this.myplaceHolder = 'Select File'; // show placeholder when there is no selected files 
    }
    if (this.count3 == 0) {
      this.myplaceHolder = 'Select File'; // show placeholder when there is no selected files 
    }
    else if (this.count3 > 0) {
      this.myplaceHolder = null;  // hide placehoder when selected Files 
    }
    if (event.isUserInput) {
      this.noDeviceViews=false;
      var check = this.documentsIdDevicesList.some(x => x == event.source.value);
      var docname = this.fileData.find(x => x._id == event.source.value);
      if (event.source.selected && !check && docname) {
        this.documentsIdDevicesList.push(docname._id); // add selected files to Id's list 
        this.documentsListDevices.push(docname)
      }
      else if (check && !event.source.selected && docname) {
        for (var i = 0; i < this.documentsIdDevicesList.length; i++) {
          if (this.documentsIdDevicesList[i] === docname._id) {
            this.documentsIdDevicesList.splice(i, 1); // Remove  deselected files From Id's list 
            this.documentsListDevices.splice(i,1);
          }
        }
      }
      if (this.documentsIdDevicesList.length >= 0){
        this.fileViewDevices(); // load File View Device Chart
      } 
    }
  }

 /**
   * Function name : fileViewDevices
   * Input : null
   * Output : set Date and get file view Device count  
   * Desc :   get file view Device list count  
   */
  fileViewDevices() {
    var res: any = {};
    res.where = {};
    var v = moment();
    // Today
    if (this.dateSelected1 == 'Today') {
      console.log("today")
      let now = v.format('YYYY-MM-DD');
      res.where.createdAt = { $gte: now + 'T00:00:00.000Z' };
      if (this.fileData && this.fileData.length != 0) {
        this.documentsIdDevicesList = [];
        this.fileData.forEach(element => {
          if (element.createdAt >= now + 'T00:00:00.000Z') {
            this.documentsIdDevicesList.push(element._id)
              this.documentsListDevices.push(element); // for File View Devices
          }
        });
      }
    }
    // Yesterday
    if (this.dateSelected1 == 'Yesterday') {
      let now = v.subtract(0, 'days').format('YYYY-MM-DD');
      let yesterday = v.subtract(1, 'days').format('YYYY-MM-DD');
      res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
      if (this.fileData && this.fileData.length != 0) {
        this.documentsIdDevicesList = [];
        this.fileData.forEach(element => {
          if (element.createdAt >= yesterday + 'T00:00:00.000Z' && element.createdAt < now + 'T00:00:00.000Z') {
            this.documentsIdDevicesList.push(element._id);
              this.documentsListDevices.push(element); // for File View Devices
          }
        });
      }
    }
    // Custom Date
    if (this.dateSelected1 == 'Custom Date' && this.startDate && this.endDate) {
      console.log("custom")
      let now = moment(this.endDate).add(1, 'days').format('YYYY-MM-DD');
      let yesterday = moment(this.startDate).format('YYYY-MM-DD');
      res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
      if (this.fileData && this.fileData.length != 0) {
        this.documentsIdDevicesList = [];
        this.fileData.forEach(element => {
          if (element.createdAt >= yesterday + 'T00:00:00.000Z' && element.createdAt < now + 'T00:00:00.000Z') {
            this.documentsIdDevicesList.push(element._id);
              this.documentsListDevices.push(element); // for File View Device
          }
        });
      }

    }
    res.where.message = 'Viewed';
    res.where.documentid = { $in: this.documentsIdDevicesList };
    // if documents are selected
    if (this.documentsIdDevicesList.length >= 0) {
      let removeduplicated :any
      var data = this.today(res);
      data.subscribe(res => {
        this.devicesCount = [];
        var updatedfiles=this.RemoveDuplicatesIds(this.documentsListDevices)
        if(updatedfiles && updatedfiles.length!=0){
          this.documentsListDevices=updatedfiles;
          this.RemoveDuplicatesIds(this.documentsListDevices)
          removeduplicated =this.RemoveDuplicates(this.documentsListDevices,this.documentsIdDevicesList)
            if(removeduplicated && removeduplicated.length!=0){
              this.documentsListDevices=removeduplicated;
              this.devicesCount = this.uniqueDeviceCount(this.documentsIdDevicesList, res); // get Unique  file view Device  count
            } 
        }
        if (this.devicesCount) this.fileViewDevicesChart(); // Load File Vile device Chart
      })
    }
  }
     /**
   * Function name : RemoveDuplicates
   * Input : old selected records ,  new selected records
   * Output : unique files  
   * Desc :   remove olds records and append new records  
   */
  RemoveDuplicates(olddata,newdata){
   var  filelist=[]
    olddata.forEach(oldelement => {
      newdata.forEach(newelement => {
        if(newelement==oldelement._id){
         filelist.push(oldelement)
        } 
      });
    });
    return filelist;
  }
       /**
   * Function name : RemoveDuplicatesIds
   * Input : selected records
   * Output : unique files  
   * Desc :   remove Duplicate selected files 
   */
  RemoveDuplicatesIds(documentsListDevices) {
    var filelistid = []
    var updatefilelist=[]
    documentsListDevices.forEach(element => {
      filelistid.push(element._id)
    });
    var uniquedata = Array.from(new Set(filelistid))
    console.log(uniquedata)
    if(uniquedata &&  uniquedata.length!=0){
      if(this.fileData&&this.fileData.length!=0){
      this.fileData.forEach(element => {
        uniquedata.forEach(file => {
          if (file == element._id) {
            updatefilelist.push(element)
          }
        });
      });
      return updatefilelist;
    }
    }
   
  }
   /**
   * Function name : uniqueDeviceCount
   * Input : Selected Document List ,  Logs of Selected Files
   * Output : return File view Device  count of selected documents 
   * Desc :   get file view  Device count  of selected file 
   */
  uniqueDeviceCount(list, result) {
    var browerCount = [], andriodCount = [], iosCount = []
    this.documentsListDevices.forEach(element => {
      let bCount = result.filter(x => x.documentid.name == element.name && x.documentid._id == element._id && x.deviceName != 'Android' && x.deviceName != 'iOS');
      let aCount = result.filter(x => x.documentid.name == element.name && x.documentid._id == element._id && x.deviceName == 'Android');
      let iCount = result.filter(x => x.documentid.name == element.name && x.documentid._id == element._id && x.deviceName == 'iOS');
      browerCount.push({
        name: element.name,
        id: element._id,
        y: bCount.length
      });   /// inserting the values for browser (web)
      andriodCount.push({
        name: element.name,
        id: element._id,
        y: aCount.length
      });   /// inserting the values for andriod    
      iosCount.push({
        name: element.name,
        id: element._id,
        y: iCount.length
      });   /// inserting the values for ios
    });
    return { browerCount, andriodCount, iosCount };
  }
 /**
   * Function name : fileViewDevicesChart
   * Input : null
   * Desc : load File View Chart 
   */
  fileViewDevicesChart() {
    var v = []
    var resultfile = []
    this.documentsListDevices.forEach((element, index) => {
      v = element.name ? element.name.split('.pdf' || '.doc' || '.docx') : element.split('.pdf' || '.doc' || '.docx')
      resultfile.push(v[0])
    });
    if (this.fileViewDeviceChart != undefined || this.fileViewDeviceChart != null) {
      this.fileViewDeviceChart.destroy();
    }
    var ctx = document.getElementById('fileViewDevice-chart');
    if (ctx) {
      ctx.style.display = "";
      this.fileViewDeviceChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: resultfile,
          labelDisplay: "AUTO",
          datasets: [{
            label: "Browser",
            backgroundColor: '#FF8373',
            data: this.devicesCount.browerCount,
          }, {
            label: "Andriod",
            backgroundColor: '#A3A1FB',
            data: this.devicesCount.andriodCount,
          }, {
            label: "Ios",
            backgroundColor: '#56D9FE',
            data: this.devicesCount.iosCount,
          }],
        },
        options: {
          tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function (tooltipItem) {
                return this._data.labels[tooltipItem[0].index];
              }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              ticks: {
                minRotation: 0,
                maxRotation: 0,
                autoSkip: false,
                // add .. to file name if selected more than 8 files 
                callback: function (label, index, labels) {
                  if (label.length > 8) {
                    var data = '...'
                    if (resultfile.length > 8) {
                      return label.slice(0, 3).concat(data)
                    }
                    else
                      return label.slice(0, 3).concat(data)
                  } else {
                    var data = '..'
                    if (resultfile.length < 8) {
                      return label;
                    }
                    else return label.slice(0, 2).concat(data)
                  }
                }
              },
            },
            ],
            yAxes: [{
              display: true,
              ticks: {
                callback: function (value, index, values) {
                  if (Math.floor(value) === value) {
                    return value;
                  }
                },
                beginAtZero: true,
              },
              beginAtZero: true
            }]
          }
        }
      });
    }
  }
 /**
   * Function name : hideFileViewDeviceChart
   * Input : null
   * Desc : Hide  File View device Chart if there is no selected Files  
   */
  hideFileViewDeviceChart() {
    var ctx = document.getElementById('fileViewDevice-chart');
  }

 /**
   * Function name : fileViewTimings
   * Input : event (files Selection)
   * Output : select and deselect files 
   * Desc :   Select and deselect files from mat select to show the data of selected files only (File View Timing  chart)
   */
  fileViewTimings(event) {
    if (!event.source._selected) {
      this.count2--;
    }
    else if (event.source._selected) {
      this.count2++
    }
    if (this.count2 == 0) {
      this.myplaceHolder2 = 'Select File'; // show placeholder when there is no selected files 
    }
    else if (this.count1 > 0) {
      this.myplaceHolder2 = null; // hide placeholder when there is  selected files 
    }
    if (event.isUserInput) {
      this.noFileviewTiming=false
      var check = this.documentsIdTimingList.some(x => x == event.source.value);
      var docname = this.fileData.find(x => x._id == event.source.value);
      if (event.source.selected && !check && docname) {
        this.documentsIdTimingList.push(docname._id); // add seleted files to Id's List 
        this.recentFileList.push(docname)
      } else if (check && !event.source.selected && docname) {
        for (var i = 0; i <  this.documentsIdTimingList.length; i++) {
          if ( this.documentsIdTimingList[i] === docname._id) {
            this.recentFileList.splice(i, 1); // Remove deseleted files From Id's List 
            this.documentsIdTimingList.splice(i, 1);
          }
        }
      }
      if(this.documentsIdDevicesList && this.documentsIdDevicesList.length==0){
      }
      if (this.documentsIdTimingList.length >= 0) {
        this.FilelistTiming(''); // load File View Timing Chart (select today)
      }
    }
  }
 /**
   * Function name : hideFileViewTimingChart
   * Input : null
   * Desc :  Hide File View Timing Chart if there is no selected files 
   */
  hideFileViewTimingChart() {
    var ctx = document.getElementById('fileViewingTime-chart');
  }
  /**
   * Function name : selectDate
   * Input : title {Custom Date,today,yesterday} 
   * Output : set  date   
   * Desc : Set date  while choose from date picker for show File View Timeing chart
   */
  FilelistTiming(title) {
    var res: any = {};
    res.where = {};
    var v = moment()
    if (title == "yesterday") {
      this.title = title
      let now = v.subtract(0, 'days').format('YYYY-MM-DD');
      let yesterday = v.subtract(1, 'days').format('YYYY-MM-DD');
      res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
      this.Dateplaceholder1 = "Select Date Range"
      this.Devicedate = null
      if(this.fileData && this.fileData.length!=0){
      this.documentsIdTimingList=[]
      this.fileData.forEach(element => {
          if(element.createdAt >= yesterday+ 'T00:00:00.000Z' && element.createdAt< now + 'T00:00:00.000Z'){
            this.documentsIdTimingList.push(element._id);
            this.recentFileList.push(element)
          } 
        });
      } 
    }
    else if (title == "today") {
      this.Dateplaceholder2 = "Select Date Range"
      this.Devicedate = null
      this.title = title
      let now = v.subtract(0, 'days').format('YYYY-MM-DD');
      res.where.createdAt = { $gte: now + 'T00:00:00.000Z' };
      if(this.fileData && this.fileData.length!=0){
        this.documentsIdTimingList=[]
      this.fileData.forEach(element => {
      if(element.createdAt>= now + 'T00:00:00.000Z'){
          this.documentsIdTimingList.push(element._id)
          this.recentFileList.push(element)
        }
      });
    }
    }
    else if(title[1]|| title[0]) {
      this.Dateplaceholder2 = null
      this.showtoday1 = false
      this.showyest1 = false
      this.title = "Date"
      let now = moment(title[1]).add(1, 'days').format('YYYY-MM-DD');
      let yesterday = moment(title[0]).format('YYYY-MM-DD');
      res.where.createdAt = { $gte: yesterday + 'T00:00:00.000Z', $lt: now + 'T00:00:00.000Z' };
      if(this.fileData && this.fileData.length!=0){
        this.documentsIdTimingList=[]
        this.fileData.forEach(element => {
      if(element.createdAt >= yesterday + 'T00:00:00.000Z' && element.createdAt < now + 'T00:00:00.000Z'){
            this.documentsIdTimingList.push(element._id)
            this.recentFileList.push(element)
          } 
        });
      }
    }
    res.where.message = 'Viewed';
    res.where.documentid = { $in: this.documentsIdTimingList };
    var data = this.todayData(res);
    var removeduplicates=this.RemoveDuplicatesIds( this.recentFileList)
    if(removeduplicates&& removeduplicates.length!=0){
      this.recentFileList=removeduplicates;
     var removeoldrecords=this.RemoveDuplicates(this.recentFileList,this.documentsIdTimingList)
     if(removeoldrecords&&removeoldrecords.length!=0){
     this.recentFileList=removeoldrecords
     }
     console.log(this.documentsIdTimingList,"lis");
     console.log(this.recentFileList,"sfdfdf");
      data.subscribe(todayData => {

        if (todayData) this.fileViewingTimeChart(); // show file View Timing Chart
      })
    }
  }
 /**
   * Function name : fileViewingTimeChart
   * Input : null
   * Desc : load File View Timing Chart 
   */
  fileViewingTimeChart = async function () {
    var v = []
    var resultfile = []
    this.documentsListTiming = this.documentsListTiming.filter(file => file = file.split('.pdf'))
    this.miniutes.forEach((element, index) => {
      var elements = this.miniutes[index].name;
      resultfile.push(elements)
    });
    if (this.fileViewTimeChart != undefined || this.fileViewTimeChart != null) {
      this.fileViewTimeChart.destroy();
    }
    var ctx = document.getElementById('fileViewingTime-chart');
    if (ctx) {
      ctx.style.display = "";
      this.fileViewTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: resultfile,
          datasets: [{
            label: "Seconds",
            backgroundColor: "#356890",
            borderColor: "#356890",
            data: this.miniutes,
            fill: false
          }],
        },
        options: this.chartOptions
      });
    }
  }

 /**
   * Function name : todayData
   * Input : Query { where.createdAt }
   * Output : get logs of file order by created date 
   * Desc :   calculate total time spend on each document based on logs
   * api : documentlogs/filesFilter/
   * apiError :  500-InternalServerError SERVER error.
   */
  todayData(res): Observable<any> {
    console.log(res,'ddf')
    var diff = new Subject<any>()
    this.documentService.search('documentlogs/filesFilter/', res).subscribe((data: any) => {
      this.miniutes = [];
      this.tdyResult = data;      
      if (this.recentFileList.length !== 0) {
        this.recentFileList.forEach(element1 => {
          var sum = 0
          var s
          var secondsChartData;
          element1.logs = this.tdyResult.filter(option => option.message == "Viewed" && option.documentid._id == element1._id);
          if (element1.logs.length > 0) {
            element1.logs.forEach(element => {
              if (element1._id == element.documentid._id) {
                var endDate = moment(element.updatedAt);
                this.result = endDate.diff(element.createdAt, 'seconds');
                s = endDate.diff(element.createdAt, 'seconds')
                sum = s + sum
                secondsChartData = {
                  y: sum,
                  name: element1.name,
                  id: element1._id,
                }
              }

              diff.next(this.miniutes)
            })
          } else if (element1.logs.length == 0) {
            secondsChartData = {
              y: 0,
              name: element1.name,
              id: element1._id,
            }
          }
          this.miniutes.push(secondsChartData)
          if (this.miniutes) this.fileViewingTimeChart() // load File View Timing Chart
        });
      } else {
        this.fileViewingTimeChart() // load File View Timing Chart
      }
    })
    return diff.asObservable();
  }
  /**
   * Function name : piechart
   * Input :null
   * Desc : show status of total files in pie chart 
   */ 
  piechart() {
    if (this.pieChart != undefined || this.pieChart != null) {
      this.pieChart.destroy();
    }
    var ctx = document.getElementById('pie-chart');
    if (ctx) {
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ["Shared", "Partially completed", "Completed"],
          datasets: [{
            backgroundColor: ["#ED6F9D", "#F7C86B", "#3cba9f"],
            background: ['', '', 'linear-gradient(to right, rgb(102, 124, 230), rgb(115, 83, 173)'],
            data: [this.pendingList.length, this.InprogressList.length, this.completedList.length]
          }],
        },
        options: {}
      });
    }
  }
}
