import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupmailconfirmComponent } from './signupmailconfirm.component';

describe('SignupmailconfirmComponent', () => {
  let component: SignupmailconfirmComponent;
  let fixture: ComponentFixture<SignupmailconfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignupmailconfirmComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupmailconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
