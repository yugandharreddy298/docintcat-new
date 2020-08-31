import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedialogComponent } from './employeedialog.component';

describe('EmployeedialogComponent', () => {
  let component: EmployeedialogComponent;
  let fixture: ComponentFixture<EmployeedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeedialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
