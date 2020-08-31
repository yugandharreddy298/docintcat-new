import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileauthenticationComponent } from './mobileauthentication.component';

describe('MobileauthenticationComponent', () => {
  let component: MobileauthenticationComponent;
  let fixture: ComponentFixture<MobileauthenticationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileauthenticationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileauthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
