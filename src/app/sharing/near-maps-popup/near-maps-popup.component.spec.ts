import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NearMapsPopupComponent } from './near-maps-popup.component';

describe('NearMapsPopupComponent', () => {
  let component: NearMapsPopupComponent;
  let fixture: ComponentFixture<NearMapsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NearMapsPopupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearMapsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
