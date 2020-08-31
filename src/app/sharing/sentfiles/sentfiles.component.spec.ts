import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentfilesComponent } from './sentfiles.component';

describe('SentfilesComponent', () => {
  let component: SentfilesComponent;
  let fixture: ComponentFixture<SentfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
