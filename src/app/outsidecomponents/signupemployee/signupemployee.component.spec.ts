import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupemployeeComponent } from './signupemployee.component';

describe('SignupemployeeComponent', () => {
  let component: SignupemployeeComponent;
  let fixture: ComponentFixture<SignupemployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignupemployeeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupemployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
