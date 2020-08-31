import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareviewComponent } from './shareview.component';

describe('ShareviewComponent', () => {
  let component: ShareviewComponent;
  let fixture: ComponentFixture<ShareviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareviewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
