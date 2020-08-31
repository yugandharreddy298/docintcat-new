import { Directive ,ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appPasswordshowhide]'
})
export class PasswordshowhideDirective {

  constructor(private el: ElementRef) {
    const parent = this.el.nativeElement.parentNode;
   }
  @HostListener('click', ['$event.target'])
  onClick(btn) {
    console.log(this.el.nativeElement.previousSibling,'hhd')
    if(this.el.nativeElement.type=='button' || this.el.nativeElement.type=='submit'){
     
      // document.getElementById('showimage').childNodes[2]
      if(document.getElementById('input_old')){
        var input:any=document.getElementById('input_old').childNodes[1]
        var imgshow:any=document.getElementById('input_old').childNodes[2].firstChild;
        var imghide:any=document.getElementById('input_old').childNodes[2].lastChild;
        input.setAttribute('type', 'password')
        if(imgshow)imgshow.classList.remove("hidedefault")
        if(imghide)imghide.classList.add("hidedefault")
        if(imghide) imghide.classList.remove("displayicon")
      }     
       if(document.getElementById('input_new')){
        var input:any=document.getElementById('input_new').childNodes[1]
        var imgshow:any=document.getElementById('input_new').childNodes[2].firstChild;
        var imghide:any=document.getElementById('input_new').childNodes[2].lastChild;
        input.setAttribute('type', 'password')
        imgshow.classList.remove("hidedefault")
        imghide.classList.add("hidedefault")
        imghide.classList.remove("displayicon")
      }
      if(document.getElementById('input_new_cnf')){
        var input:any=document.getElementById('input_new_cnf').childNodes[1]
        var imgshow:any=document.getElementById('input_new_cnf').childNodes[2].firstChild;
        var imghide:any=document.getElementById('input_new_cnf').childNodes[2].lastChild;
        input.setAttribute('type', 'password')
        imgshow.classList.remove("hidedefault")
        imghide.classList.add("hidedefault")
        imghide.classList.remove("displayicon")
      }

    }
    if( this.el.nativeElement.previousSibling && this.el.nativeElement.previousSibling.type=='password'){
      this.el.nativeElement.previousSibling.setAttribute('type', 'text');
      this.el.nativeElement.lastChild.classList.remove("hidedefault");
      this.el.nativeElement.lastChild.classList.add('displayicon')
      this.el.nativeElement.firstChild.classList.add('hidedefault')
      this.el.nativeElement.firstChild.classList.remove('displayicon')
    }else if(this.el.nativeElement.previousSibling && this.el.nativeElement.previousSibling.type=='text') {
      this.el.nativeElement.previousSibling.setAttribute('type', 'password');
      this.el.nativeElement.firstChild.classList.remove("hidedefault");
      this.el.nativeElement.firstChild.classList.add('displayicon')
      this.el.nativeElement.lastChild.classList.add('hidedefault')
      this.el.nativeElement.lastChild.classList.remove('displayicon')
    }
 }
}
