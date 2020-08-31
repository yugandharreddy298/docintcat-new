import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AunthicateComponent } from './aunthicate.component';

describe('AunthicateComponent', () => {
  let component: AunthicateComponent;
  let fixture: ComponentFixture<AunthicateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AunthicateComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AunthicateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
