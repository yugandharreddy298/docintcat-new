import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentdialogComponent } from './departmentdialog.component';

describe('DepartmentdialogComponent', () => {
  let component: DepartmentdialogComponent;
  let fixture: ComponentFixture<DepartmentdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DepartmentdialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
