import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionVerifyComponent } from './transaction-verify.component';

describe('TransactionVerifyComponent', () => {
  let component: TransactionVerifyComponent;
  let fixture: ComponentFixture<TransactionVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionVerifyComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
