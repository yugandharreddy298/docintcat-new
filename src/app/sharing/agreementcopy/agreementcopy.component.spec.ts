import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementcopyComponent } from './agreementcopy.component';

describe('AgreementcopyComponent', () => {
  let component: AgreementcopyComponent;
  let fixture: ComponentFixture<AgreementcopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementcopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgreementcopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
