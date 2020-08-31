import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationFileSharingComponent } from './organization-file-sharing.component';

describe('OrganizationFileSharingComponent', () => {
  let component: OrganizationFileSharingComponent;
  let fixture: ComponentFixture<OrganizationFileSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationFileSharingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationFileSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
