import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MovetoComponent } from './moveto.component';

describe('MovetoComponent', () => {
  let component: MovetoComponent;
  let fixture: ComponentFixture<MovetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MovetoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
