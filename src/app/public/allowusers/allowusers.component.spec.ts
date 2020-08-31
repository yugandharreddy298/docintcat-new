import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowusersComponent } from './allowusers.component';

describe('AllowusersComponent', () => {
  let component: AllowusersComponent;
  let fixture: ComponentFixture<AllowusersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllowusersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
