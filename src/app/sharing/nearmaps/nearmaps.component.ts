import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { round } from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DocumentService } from '../../document.service'
import { AdminService } from '../../admin.service';
import { Subscription } from 'rxjs';
declare var H: any;
@Component({
  selector: 'app-nearmaps',
  templateUrl: './nearmaps.component.html',
  styleUrls: ['./nearmaps.component.css']
})

export class NearmapsComponent implements OnInit {

  @ViewChild("map")
  public mapElement: ElementRef;

  @Input()
  public appId: any = 'xeeSniVGFJguQieOyDvg';

  @Input()
  public appCode: any = 'CYXw3RyDsetaa5pSVf3EAw';

  @Input()
  public lat: any;

  @Input()
  public lng: any;

  @Input()
  public width: any;

  @Input()
  public height: any;

  @Input('email') email;

  @Input('todaydate') todaydate;

  @Input('yesterdaydate') yesterdaydate;

  parameters;
  startMarker: any;
  routeLine: any;
  endMarker: any;
  startPoint: any;
  endPoint: any;
  private platform: any;
  private map: any;
  private ui: any;
  private search: any;
  public geocoder: any;
  public latitude: any;
  public longitude: any;
  public behavior: any;
  getsuggistions: any;
  public abc: any
  public static lat: any
  public static lng: any
  loc1;
  loc2;
  newwarehouse: any
  counter = 0;
  arr = [];
  marker1; group; marker2: any;
  latitude1 = []; longitude1 = [];
  logsList;
  datelogslist;
  profiledata: any;
  newyesterday: any;
  marker3: any;
  createdAt: any;
  start: any;
  type: Boolean = false;
  end: any;
  Getlocations: any = {};
  subscription: Subscription;
  mapdata:any
  today
  newrad: any;
  firstTime=true

  constructor(private documentService: DocumentService, 
    private AdminService: AdminService, 
    public dialog: MatDialog) {
    this.subscription = this.documentService.getFileData().subscribe(message => {
      this.Getlocations = message;
    });
  }

  public ngOnInit() {
    this.today=this.todaydate
    this.platform = new H.service.Platform({
      "app_id": 'xeeSniVGFJguQieOyDvg',
      "app_code": 'CYXw3RyDsetaa5pSVf3EAw',
      useHTTPS: true,
      useCIT: true

    });
    this.geocoder = this.platform.getGeocodingService();
    this.AdminService.getdates.subscribe(data => {
      this.yesterdaydate = data;
      this.start = null;
      this.end = null;
      this.todaydate = this.today;
      this.getVendor(0,0,0,0)
    });
    this.AdminService.gettdates.subscribe(data => {
      this.todaydate = data;
      this.yesterdaydate = null;
      this.start = null;
      this.end = null;
      this.getVendor(0,0,0,0)
    });
    this.AdminService.getdatespick.subscribe(data => {
      this.start = data[0];
      this.end = data[1];
      this.todaydate = null;
      this.yesterdaydate = null;
      this.getVendor(0,0,0,0)
    });
  }

  public ngAfterViewInit() {
    var pixelRatio = window.devicePixelRatio || 1;
      let defaultLayers = this.platform.createDefaultLayers({
        tileSize: pixelRatio === 1 ? 256 : 512,
        ppi: pixelRatio === 1 ? undefined : 320
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.map = new H.Map(
            this.mapElement.nativeElement,
            defaultLayers.normal.map,
            {
              zoom: 10,
              center: { lat: this.latitude, lng: this.longitude },

            });
            this.getVendor(0,0,0,0)
          //initialize a map end  
          let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
          this.behavior = behavior;
          this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
          var ui = this.ui;
          this.group = new H.map.Group();
          this.map.addObject(this.group);
          this.group.addEventListener('tap', function (evt) {
            if (!bubble) {
              var bubble = new H.ui.InfoBubble(
                //position
                evt.target.getPosition(), {
                  //content data
                  content: evt.target.getData()
                });
              ui.addBubble(bubble);
            }
            else {
              bubble.setPosition(position);
              bubble.setContent(evt.target.getData());
              bubble.open();
            }
          }, false);
          if(this.latitude && this.longitude)
          this.dropMarker1({ lat: this.latitude, lng: this.longitude }, this.group);
        }, error => {
          this.documentService.openSnackBar(" Your Location is Blocked ", "X");
            var newcoords = {
              email:this.email.email,
              todaydate:this.todaydate,
              yesterdaydate:this.yesterdaydate,
              startdate:this.start,
              enddate:this.end 
          } 
          this.documentService.documentlogs('/api/documentlogs/logs/', newcoords).subscribe(data => {
            this.logsList = data;
            this.logsList = this.logsList.filter(x => (x.message=="Viewed"))
          this.latitude =  this.logsList[0].latitude;
          this.longitude =  this.logsList[0].longitude;
          this.map = new H.Map(
            this.mapElement.nativeElement,
            defaultLayers.normal.map,
            {
              zoom: 10,
              center: { lat: this.latitude, lng: this.longitude },
            });
          this.getVendor(0,0,0,0)
          //initialize a map end  
          let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
          this.behavior = behavior;
          this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
          var ui = this.ui;
          this.group = new H.map.Group();
          this.map.addObject(this.group);
          this.group.addEventListener('tap', function (evt) {
            if (!bubble) {
              var bubble = new H.ui.InfoBubble(
                //position
                evt.target.getPosition(), {
                  //content data
                  content: evt.target.getData()
                });
              ui.addBubble(bubble);
            }
            else {
              bubble.setPosition();
              bubble.setContent(evt.target.getData());
              bubble.open();
            }
          }, false);
        });
      });
      } else {
        console.error("Geolocation is not supported by this browser!");
    }
  }

  /**
   * Function name : getVendor
   * Input : lat1, lng1, lat2, lng2
   * Output : Log data creation.
   * Desc : To get Log data to store.
   */
  getVendor(lat1, lng1,lat2, lng2)
  {
   lat1 = round(lat1, 6);
    lng1 = round(lng1, 6);
    lat2 = round(lat2, 6);
    lng2 = round(lng2, 6);
      var newcoords = {
        oldlatitude:lat1,
        oldlongitude:lng1,
        latitude: lat2,
        longitude: lng2,
        email:this.email.email,
        todaydate:this.todaydate,
        yesterdaydate:this.yesterdaydate,
        startdate:this.start,
        enddate:this.end 
    }
      this.documentService.documentlogs('/api/documentlogs/logs/', newcoords).subscribe(data => {
         this.logsList = data;
         this.logsList = this.logsList.filter(x => (x.message=="Viewed"))
         this.removeMarkers(this.arr);
         for(var i=0; i<this.logsList.length; i++)
         {
           if (this.logsList[i].latitude && this.logsList[i].longitude && this.logsList[i].documentid) {
          
             this.dropMarker2({ lat:this.logsList[i].latitude, lng: this.logsList[i].longitude }, this.group, this.behavior,this.logsList[i].documentid.name, this.logsList[i]._id);
           }
           else {
             this.latitude1[i] = 0;
             this.longitude1[i] = 0;
           }
         }
       });
  }

  /**
   * Function name : dropMarker1
   * Input : coordinates, map
   * Output : Current location drop mark.
   * Desc : Point out current location.
   */
  private dropMarker1(coordinates: any, map: any) {
    var placesService = this.platform.getPlacesService()
    this.parameters = {
      at: this.latitude + "," + this.longitude
    };
    placesService.here(this.parameters,
      function (result) {
      }, function (error) {
      });
    var bubble;
    var parisPngIcon = new H.map.Icon("assets/images/currentlocation.png", { size: { w: 40, h: 40, } })
    this.marker1 = new H.map.Marker(coordinates, { icon: parisPngIcon });
    this.marker1.setData("<p>Your Current Location</p>");
    this.marker1.addEventListener('tap', event => {
      bubble = new H.ui.InfoBubble(event.target.getPosition(), {
        content: event.target.getData()
      });
      this.ui.addBubble(bubble);
    }, false);
    this.marker1.addEventListener('pointerleave', event => {
      if(bubble)bubble.close();
    }, false);
    map.addObject(this.marker1);
  }

  /**
   * Function name : dropMarker1
   * Input : coordinates, map, behavior, html, id
   * Output : location drop mark.
   * Desc : Point out location.
   */
  private dropMarker2(coordinates: any, map: any, behavior, html, id) {
    var bubble;
    var parisPngIcon = new H.map.Icon("assets/images/whimg.png", { size: { w: 26, h: 26, } })
    this.marker2 = new H.map.Marker(coordinates, { icon: parisPngIcon });
    this.arr.push(this.marker2);
    this.marker2.setData(html);
    this.marker2.addEventListener('tap', event => {
      bubble = new H.ui.InfoBubble(event.target.getPosition(), {
        content: event.target.getData(),
      });
      this.ui.addBubble(bubble);
    }, false);
    this.marker2.addEventListener('pointerleave', event => {
      if(bubble)bubble.close();
    }, false);
    map.addObject(this.marker2)
  }

  // Removing markers(Drop points)
  removeMarkers(arr) {
    this.group.removeObjects(arr)
    this.arr = [];
  }

  // Data(Longitude & Latitude) to store in local storage in the name of location
  getdata(lat, lng) {
    var location = {
      lat: lat, lng: lng
    }
    localStorage.setItem("location", JSON.stringify(location));
  }

}