export class DocFields {
    constructor() { }
    editIcons = [
        {
          name: 'Label',
          value: 'label',
          icon: 'label',
          class:"lbl-bg   pl-point",
        },
        {
          name: 'Text Box',
          value: 'text',
          icon: 'text_fields',
          class:"text-fields   pl-point ",
        },
        
        {
          name: 'Name',
          value: 'name',
          icon: 'text_fields',
          class:"name   pl-point",
        },
    
        {
          name: 'Email',
          value: 'email',
          icon: 'email',
          class:"email   pl-point",
        },
    
        {
          name: 'Mobile Number',
          value: 'mobilenumber',
          icon: 'smartphone',
          class:"smartphone   pl-point",
        },
        {
          name: 'Initial',
          value: 'initial',
          icon: 'title',
          class:"initial   pl-point",
        },
        {
          name: 'Company',
          value: 'company',
          icon: 'store',
          class:"store   pl-point",
         
          
        },
        {
          name: 'Date Field',
          value: 'date',
          icon: 'date_range',
          class:"date_range   pl-point",
        },
        {
          name: 'Signature',
          value: 'signature',
          icon: 'edit',
          class:"signature   pl-point",
        },
        {
          name: 'Photo Field',
          value: 'Photo',
          icon: 'insert_photo',
          class:"insert_photo   pl-point",
        },
        {
          name: 'Stamp Field',
          value: 'Stamp',
          icon: 'stars',
          class:"stars   pl-point",
        },
        {
          name: 'checkbox',
          value: 'checkbox',
          icon: 'check_box',
          class:"check_box   pl-point",
        },
        {
          name: 'Drop Down',
          value: 'dropdown',
          icon: 'arrow_drop_down_circle',
          class:"arrow_drop_down_circle   pl-point",
        },
        {
          name: 'Radio Button',
          value: 'radiobutton',
          icon: 'radio_button_checked',
          class:"radio_button_checked   pl-point",
        }
      ]
    
      ConfigFields = [
        {
          name: 'Assigned To',
          type: 'autocomplete',
          values: '',
          key: 'people',
          fType: 'text,date,initial,company,signature,Photo,Stamp,name,email,mobilenumber,checkbox,dropdown,radiobutton',
          class:'black-colr',
          healpText: 'This Email Id person only can able to access this field'
        },
        {
          name: 'Font Family',
          type: 'dropdown',
          values: ['Arial', 'Times', 'Courier', 'Lato', 'Open Sans', 'Roboto Slab', 'Srisakdi', 'Lobster', 'Sniglet', 'Satisfy', 'Bilbo', 'Gloria Hallelujah'],
          healpText: 'Select font type',
          key: 'css-font-family',
          fType: 'label,text,date,company,name,email,mobilenumber,radiobutton,dropdown',
         class:'col-12  section-pad black-colr'
        },
        { 
          name: 'Size',
          type: 'dropdown',
          values: ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '30px', '36px', '48px', '60px', '72px'],
          healpText: 'Select font Size',
          key: 'css-font-size',
          fType: 'label,text,company,name,email,mobilenumber',
           class:'col-4 col-md-4 section-pad pull-left black-colr'
        },
        {
          name: 'Font Size',
          type: 'dropdown',
          values: ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '30px', '36px', '48px', '60px', '72px'],
          healpText: 'Select font Size',
          key: 'css-font-size',
          fType: 'radiobutton',
           class:'col-12 section-pad black-colr'
        },
        {
          name: 'Size',
          type: 'dropdown',
          values: ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '30px', '36px', '48px', '60px', '72px'],
          healpText: 'Select font Size',
          key: 'css-font-size',
          fType: 'date',
           class:'col-6 col-md-6 section-pad pull-left black-colr'
        },
        {
          name: 'Color',
          type: 'colorPicker',
          values: '',
          healpText: 'Select font color',
          key: 'css-color',
          fType: 'label,text,company,name,email,mobilenumber',
          class:'col-4 col-md-4 section-pad css-color pull-left black-colr'
         
        },
        {
          name: 'Color',
          type: 'colorPicker',
          values: '',
          healpText: 'Select font color',
          key: 'css-color',
          fType: 'date',
          class:'col-6 col-md-6 section-pad css-color pull-left black-colr'
         
        },
     
        {
          name: 'Date Format',
          type: 'dropdown',
          values: ['dd/MM/yyyy', 'MM/dd/yyyy','yyyy/MM/dd'],
          healpText: 'Select Date Format',
          key: 'dateformats',
          fType: 'date',
           class:'col-12 col-md-12 section-pad date-clear black-colr date-picker-dropdown'
        },
        {
          name: 'Time Format',
          type: 'dropdown',
          values: ['hh:mm:ss', 'hh:mm','hh:mm a'],
          healpText: 'Select Date Format',
          key: 'timeformats',
          fType: 'date',
           class:'col-12 col-md-12 section-pad date-clear black-colr time-picker-dropdown'
        },
        {
          name: 'Date & Format',
          type: 'dropdown',
          values: ['dd/MM/yyyy hh:mm', 'MM/dd/yyyy hh:mm','yyyy/MM/dd hh:mm','dd/MM/yyyy hh:mm a', 'MM/dd/yyyy hh:mm a','yyyy/MM/dd hh:mm a'],
          healpText: 'Select Date Format',
          key: 'dateTimeformats',
          fType: 'date',
           class:'col-12 col-md-12 section-pad date-clear black-colr both-picker-dropdown'
        },
    
       
        {
          name: 'Background',
          type: 'colorPicker',
          values: '',
          healpText: 'Select Background Color',
          key: 'css-background-color',
          fType: 'label,text,company,name,email,mobilenumber',
          class:'col-4 col-md-4 css-background-color pull-left black-colr'
          
        },
           {
          name: 'Style',
          type: 'checkbox_icons',
          values: [{icon:'format_bold', assingto:'css-font-weight', value: 'bold'}, {icon:'format_italic', assingto:'css-font-style', value: 'Italic'}, {icon:'format_underlined', assingto:'css-text-decoration', value: 'Underline'}],
          healpText: 'Select font Style',
          clickAction: 'selectOption',
          key: 'font_style',
          fType: 'label,text,date,company,name,email,mobilenumber ',
          class:'col-6 pull-left black-colr'
          
        },
        
      {
        name: 'Align',
        type: 'checkbox_icons',
        values: [{icon:'format_align_left', assingto:'align', value: 'left'}, {icon:'format_align_center', assingto:'align', value: 'center'},{icon:'format_align_right', assingto:'align', value: 'right'}],
        healpText: 'Select align',
        clickAction: 'selectOption',
        key: 'align',
        fType: 'label,text,date,company,name,email,mobilenumber',
         class:'col-6 pull-left align black-colr zero-pad'
        
      },
      {
        name: 'Align',
        type: 'checkbox_icons',
        values: [{icon:'format_align_left', assingto:'align', value: 'left'}, {icon:'format_align_center', assingto:'align', value: 'center'},{icon:'format_align_right', assingto:'align', value: 'right'}],
        healpText: 'Select align',
        clickAction: 'selectOption',
        key: 'align',
        fType: 'Photo',
         class:'col-12 pull-left align black-colr pdlft'
        
      },
      {
        name: 'Align',
        type: 'checkbox_icons',
        values: [{icon:'format_align_left', assingto:'align', value: 'left'}, {icon:'format_align_center', assingto:'align', value: 'center'},{icon:'format_align_right', assingto:'align', value: 'right'}],
        healpText: 'Select align',
        clickAction: 'selectOption',
        key: 'align',
        fType: 'Stamp,initial,signature',
         class:'col-12 black-colr'
        
      },
       
        {
          name: 'Align',
          type: 'radio_icons',
          values: [{icon:'left', value: 'Left'}, {icon:'center', value: 'center'}, {icon:'right', value: 'Right'}],
          healpText: 'Select font type',
          key: 'align',
          fType: 'text,date,company,name,email,mobilenumber',
          class:'col-6 pull-left black-colr'
       
        },{
        name: 'Minvalue',
        type: 'number',
        values: 'css-minlength',
        healpText: 'Enter min value',
        key: 'minlength',
        fType: 'text,company,name,email',
        class:'col-lg-6 col-6 col-md-6 section-pad pull-left minValue black-colr' 
      },{
        name: 'Maxvalue',
        type: 'number',
        values: '',
        healpText: 'Enter max value',
        key: 'maxlength',
        fType: 'text,company,name,email',
        class:'col-lg-6 col-md-6 col-6 section-pad pull-left black-colr'
        
      },
      {
        name: 'Rotate Field',
        type: 'rotate',
        values: '',
        healpText: 'Rotate Field',
        key: 'css-transform',
        fType: 'label,text,date,initial,company,signature,name,email,mobilenumber',
          class:'black-colr'
        
      },
    
      {
        name: 'Placeholder',
        type: 'text',
        values: '',
        healpText: 'Enter Placeholder',
        key: 'placeholder',
        fType: 'text,company,name,email,mobilenumber,dropdown',
         class:'black-colr'
      },{
        name: 'Field Option Values',
        type: 'textarea',
        values: '',
        healpText: 'Enter option value',
        key: 'opt',
        fType: 'dropdown,radiobutton',
        class:'black-colr'
      },
      {
        name: 'Display',
        type: 'radio',
        values: ['side by side','newline'],
        healpText: '',
        key: 'radiobuttondisplay',
        fType: 'radiobutton',
        class:'col-lg-6 custom-control custom-checkbox custom-control-inline pull-left black-colr'
      }
      ,{
        name: 'Restrict',
        type: 'radio',
        values: ['readonly','required'],
        key: 'restrict',
        healpText: 'Restrict this field for readonly or required',
        fType: 'text,date,initial,company,signature,Photo,Stamp,name,email,mobilenumber,dropdown,radiobutton,checkbox',
         class:'col-lg-6 custom-control custom-checkbox custom-control-inline pull-left black-colr'
      },
      {
        name: 'Date Access',
        type: 'radio',
        values: ['Default','Edit'],
        key: 'dateacess',
        fType: 'date',
         class:'col-lg-6 custom-control custom-checkbox custom-control-inline pull-left black-colr'
      },
      {
        name: 'Authentication',
        type: 'checkbox',
        values: '',
        key: 'authentication',
        fType: 'Photo',
        class:"black-colr"
      },
      {
        name: 'Picker Type',
        type: 'radio',
        values: ['date','time','both'],
        key: 'pickerType',
        fType: 'date',
        class:'col-lg-4 custom-control custom-checkbox custom-control-inline pull-left black-colr'
      },
      {
        name: 'Document/Field Dependency',
        type: 'radio',
        values: ['Finish','View Access'],
        key: 'dependencytype',
        fType: 'text,date,initial,company,signature,Photo,Stamp,name,email,mobilenumber,checkbox,dropdown,radiobutton',
         class:'col-lg-6 custom-control custom-checkbox custom-control-inline pull-left black-colr',
         healpText: 'Dependency for finish and view access'
      },
      {
        name: 'Dependent To',
        type: 'dependency',
        values: '',
        key: 'dependency',
        fType: 'text,date,initial,company,signature,Photo,Stamp,name,email,mobilenumber,checkbox,dropdown,radiobutton',
        class:'black-colr',
        healpText: 'This field/document have dependency on this email'
      }
    
    
      ];


     _presetFonts = ['Tangerine', 'Pacifico','Homemade Apple','Sacramento','Mrs Saint Delafield','Ruthie','Dr Sugiyama','Lovers Quarrel','Qwigley', 'Srisakdi', 'Lobster', 'Sniglet', 'Satisfy', 'Bilbo'];  
     waterMarkFonts: any =  ['Arial', 'Times', 'Courier', 'Lato', 'Open Sans', 'Roboto Slab', 'Srisakdi', 'Lobster', 'Sniglet', 'Satisfy', 'Bilbo', 'Gloria Hallelujah'];
     waterMarkSize = [ '10px', '12px', '14px','16px', '18px', '24px', '30px', '36px', '48px', '60px', '72px'];
     watermarkWidth = ['10%','25%','50%','75%','100%']
     getEditIcon() {
      return this.editIcons;
    }
    getConfigFields() {
      return this.ConfigFields;
    }
    getPresetFonts() {
      return this._presetFonts;
    }
    getWaterMarkFonts() {
      return this.waterMarkFonts;
    }
    getWaterMarkSize() {
      return this.waterMarkSize;
    }
    getwatermarkWidth() {
      return this.watermarkWidth;
    }
}

