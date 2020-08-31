import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupdialogboxComponent } from './signupdialogbox.component';

describe('SignupdialogboxComponent', () => {
  let component: SignupdialogboxComponent;
  let fixture: ComponentFixture<SignupdialogboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignupdialogboxComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupdialogboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
