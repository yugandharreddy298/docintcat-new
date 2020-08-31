import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicfoldersComponent } from './publicfolders.component';

describe('PublicfoldersComponent', () => {
  let component: PublicfoldersComponent;
  let fixture: ComponentFixture<PublicfoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicfoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicfoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
