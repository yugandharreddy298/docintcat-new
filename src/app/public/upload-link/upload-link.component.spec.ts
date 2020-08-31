import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadLinkComponent } from './upload-link.component';

describe('UploadLinkComponent', () => {
  let component: UploadLinkComponent;
  let fixture: ComponentFixture<UploadLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadLinkComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
