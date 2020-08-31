import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NearmapsComponent } from './nearmaps.component';

describe('NearmapsComponent', () => {
  let component: NearmapsComponent;
  let fixture: ComponentFixture<NearmapsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearmapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearmapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
