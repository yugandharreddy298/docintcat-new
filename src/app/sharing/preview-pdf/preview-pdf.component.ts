import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DocumentService } from 'src/app/document.service';
declare var $: any;

@Component({
  selector: 'app-preview-pdf',
  templateUrl: './preview-pdf.component.html',
  styleUrls: ['./preview-pdf.component.css']
})
export class PreviewPdfComponent implements OnInit {
  documentRecord :any
  fields:any
  //Decalre PDF top and left
  PdfHeight: any = 0; // OnLoad PDf get Height
  PdfWidth: any = 0; // OnLoad Pdf Get width;
  PdfTop: any = 0; // Pdf Top distance
  PdfTopScroll: any = 0; // Pdf Top distance + Scroll Distance
  PdfLeft: any = 0; // Pdf Left distance
  PdfLeftNosideBar: any = 0; // Pdf Without side bar left side distance
  pdfZoom: any = 0; //PDf Zoom Percentage
  zoomVal = 1; // PDF Zoom 
  PDFheights: any[];
  zoomWidth  // Before zoom we will caliculate width
  zoomHeight  // Before zoom we will caliculate height
  pageNo: number = 1; 
  pdfdata: any;
  constructor( 
    public dialogRef: MatDialogRef<PreviewPdfComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData,
    private documentService: DocumentService) { }

  ngOnInit() {
  }

/**
  * Function name : afterLoadComplete
  * Input  : event
  * Output : get watermark and fields data
  * Desc   : To load watermark,fields data 
  */
  afterLoadComplete(pdf) {
    this.pdfdata=pdf;
    this.LoadFields();
    $('.z00mout').addClass('c0lric0');
    setTimeout(() => {
      this.PdfHeight = $(".page:first").height();
      this.PdfWidth = $(".page:first").width();
      this.setPdfHeights()
    },100)
 }

 /**
    * Function name : LoadFields
    * Input : fileid
    * Output : {array}  fields
    * Desc : Gettiong Document fields Data
    */
   LoadFields() {
     var Pdffile
     Pdffile=this.dialogData
    this.documentService.getSelectedDoc(Pdffile._id,'Allowusers').subscribe(data => {
      this.documentRecord = data
      // if (this.documentRecord.waterMark) this.waterMark = this.documentRecord.waterMark
      this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.documentRecord._id, versionid: this.documentRecord.versionid })
      .subscribe(async currentVersionDocFieldOptions => {
        this.fields = currentVersionDocFieldOptions;
        console.log(this.fields)
        for (let field of this.fields) {
          if (this.PdfWidth) {
            field.width = (field.width / field.pageWidth) * this.PdfWidth
            field.height = (field.height / field.pageHeight) * this.PdfHeight
            field.left = (field.left / field.pageWidth) * this.PdfWidth
            field.top = (field.top / field.pageHeight) * this.PdfHeight
          }
          setTimeout(() => { this.updateFieldCss(field); }) //After Div insert in html then only it needs to be call

          }
        
        
    })
  
})
}
  
  
/**
 * Function name : updateFieldCss
 * Input  : {json} field
 * Output : {json} field with updated css
 * Desc   :  Update Css As per field configuaration
 */
updateFieldCss(field) {
  
  var css = "#" + field.id + "{ ";
  for (let prop in field) {
    if (prop.substring(0, 4) == 'css-') {
      if (prop.substring(4) == 'transform') {
        $("#" + field.id).css(prop.substring(4), "rotate(" + field[prop] + "deg)");
        $("#" + field.id).css('msTransform', "rotate(" + field[prop] + "deg)");
        $("#" + field.id).css('MozTransform', "rotate(" + field[prop] + "deg)");
        $("#" + field.id).css('OTransform', "rotate(" + field[prop] + "deg)");
        $("#" + field.id).css(prop.substring(4), "rotate(" + field[prop] + "deg)");
      }
      else if (field[prop] != false) $("#" + field.id + '-input').css(prop.substring(4), field[prop]);
      else $("#" + field.id + '-input').css(prop.substring(4), '');
    }
  }
  // if (field.people) this.RecipientMails();
  if (field.type == 'radiobutton' && field['css-font-size']) { // Update radio button size
    var w = field['css-font-size'].substring(0, field['css-font-size'].length - 2)
    let oldpdfwidth = field.pageWidth ? field.pageWidth : this.PdfWidth
    let radiobuttonwidth = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfWidth / oldpdfwidth))
    let oldpdfheight = field.pageWidth ? field.pageWidth : this.PdfWidth
    let radiobuttonheight = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfHeight / oldpdfheight))
    setTimeout(() => {
      $("#" + field.id + '-input').find('input').css('width', radiobuttonwidth + 'px');
      $("#" + field.id + '-input').find('input').css('height', radiobuttonwidth + 'px');
    }, 10);
   
  }
  if (field.type == 'radiobutton' || field.type == 'dropdown' && field.opt != undefined && !field.radiobuttondisplay) {
    var options = []
    options = field.optionvalue ? field.optionvalue : []
    field.optionvalue = field.opt.split(',')
    if(field.optionvalue.length === 1 && field.optionvalue[0] === ''){
      this.documentService.openSnackBar('Should keep atleast one','x')
      field.optionvalue[0] = options[0]
      field.opt =  options[0] 
    }
  }
 
  // this.onWindowPress(false, field.id, field)
}
/**
    * Function name : getFieldLeft
    * Input  : {json} field
    * Output : {number} field left value
    * Desc   : To get field left as per zoom Level
    */
   getFieldLeft(field, t) {
    var left = 0;
    if ((field.left || field.coordinatey) && this.zoomVal != 1) {
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      if (field.left) {
        var l = (field.left / 100) * perc;
        left = field.left - l;
      }
      else {
        var l = (field.coordinatey / 100) * perc;
        left = (field.coordinatey - l) - ((this.zoomVal * 10) - 10);
      }
    }
    else if (field.left) left = field.left;
    else if (field.coordinatey) left = field.coordinatey; // only comments section
    // return left + sidebar - (parseInt($("#blog-post").css('border-left-width')));
    // console.log(left+ (parseInt($(".page:first").css("marginLeft"))))
    return left+ (parseInt($(".page:first").css("marginLeft")));
  }
  /**
   * Function name : getFieldTop
   * Input  : {json} field
   * Output : {number} field Top value
   * Desc   :  Get Field Top as per zoom Level
   */
  getFieldTop(field) {
    var top = 0;
    if ((field.top || field.coordinatex) && this.zoomVal != 1) { //Only zoom section
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      if (!field.selectText && field.top) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      } else if (field.coordinatex) {
        var l = ((field.coordinatex) / 100) * perc;
        top = field.coordinatex + (document.getElementById('progress_bar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true))) - l;
      }
      else if (field.selectText) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      }
    }
    else if (field.top) { top = field.top; }
    else if (field.coordinatex) {
      top = field.coordinatex + document.getElementById('progress_bar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true))
    }
    return top;
  }
  /**
  * Function name : getFieldHeight
  * Input  : {json} field
  * Output : {number} field Height value
  * Desc   :  Get Field Height as per zoom Level
  */
  getFieldHeight(field) {
    if (field.height && this.zoomVal != 1) {
      $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.height / 100) * perc;
      return field.height - l;
    }
    else {
      $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
      return field.height;
    }
  }
  /**
   * Function name : getFieldWidth
   * Input  : {json} field
   * Output : {number} field width value
   * Desc   :  Get Field width as per zoom Level
   */
  getFieldWidth(field) {
    if (field.width && this.zoomVal != 1) {
      $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.width / 100) * perc;
      return field.width - l;
    }
    else {
      $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      return field.width;
    }
  }

  /**
   * Function name : getPercentageChange
   * Input  : pdfwidth,pdfwidth on zooming
   * Output : {number} percentage value 
   * Desc   :  Calculate distance percentage
   */
  getPercentageChange(oldNumber, newNumber) {
    var decreaseValue = oldNumber - newNumber;
    return (decreaseValue / oldNumber) * 100;
  }


   /**
 * Function name : setPdfHeights
 * Input  : pages height,width
 * Output : {array} every page start and end
 * Desc   : Calculate every page start and end
 */
setPdfHeights() {
  var h = 0;
  var PDFheights = [];
  this.PDFheights = []
  let pgNo = 1
  $("div.pdfViewer").find("div.page").each(function () {
    PDFheights.push({ start: h, end: h + $(this).height()-2 })
    pgNo++;
    h = h + ((pgNo - 1) > 0 ? (10) : 0) + $(this).height();
  })
  this.PDFheights = PDFheights
}
  /**
 * Function name : pdfZoomIn
 * Desc   : To increase zoom level on ZoomIn
 */
pdfZoomIn() {
  this.zoomWidth = $(".page").width()
  if (this.zoomVal < 1.5) {
    this.zoomVal += 0.1;
    this.zoomVal = Number(this.zoomVal.toFixed(1));
    $('.z00mout').removeClass('c0lric0')
   }
  else{
    $('.z00min').addClass('c0lric0')

  }
}
/**
* Function name : pdfZoomOut
* Desc   : To decrease zoom level on ZoomOut
*/
pdfZoomOut() {
  this.zoomWidth = $(".page").width()
  if (this.zoomVal > 1) {
    $('.z00min').removeClass('c0lric0')
    this.zoomVal -= 0.1;
    this.zoomVal = Number(this.zoomVal.toFixed(1));
  }

   if (this.zoomVal == 1) {
    $('.z00mout').addClass('c0lric0')
    for (let field of this.fields) {
      if ($("#" + field.id + "-input").width() != $("#" + field.id + "-input").parents('div.ui-wrapper').width() || $("#" + field.id + "-input").height() != $("#" + field.id + "-input").parents('div.ui-wrapper').height()) {
        $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
        $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      }
    }
  }
}
/**
 * Function name : pdfZoomreset
 * Desc   : set zoomval=1 on ZoomReset
 */
pdfZoomreset() {
  this.zoomWidth = $(".page").width();
  $('.z00min').removeClass('c0lric0');
  $('.z00mout').addClass('c0lric0')
  for (let field of this.fields) {
    if ($("#" + field.id + "-input").width() != $("#" + field.id + "-input").parents('div.ui-wrapper').width() || $("#" + field.id + "-input").height() != $("#" + field.id + "-input").parents('div.ui-wrapper').height()) {
      $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
      $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
    }
  }
  this.zoomVal = 1
}
/**
* Function name : pdfZoomMax
* Desc   : set zoomval=1 on Maxzoom
*/
pdfZoomMax()
{
  $('.z00mout').removeClass('c0lric0'); 
  $('.z00min').addClass('c0lric0');
   this.zoomVal = 1.5;
}

//Check page number while pdf scrolling
onPdfScroll(e) {
  var scroll = $("#doc-view").scrollTop();
  var h = 0;
  var PDFheights = [];
  var i = 0;
  $("div.pdfViewer").find("div.page").each(function () {
    PDFheights.push({ start: h, end: h + $(this).height()-2 })
    h = h + ((this.pageNo - 1) > 0 ? (10) : 0) + $(this).height();
  })
  PDFheights.forEach(page => {
    i++;
    if (page.start <= scroll && page.end >= scroll) this.pageNo = i++;
  });
}
//close the dialog
close()
{
this.dialogRef.close(false);
}
//the restore or delete actions
actions(title)
{
  this.dialogRef.close(title);

}
}
