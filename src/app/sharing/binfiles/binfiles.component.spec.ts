import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinfilesComponent } from './binfiles.component';

describe('BinfilesComponent', () => {
  let component: BinfilesComponent;
  let fixture: ComponentFixture<BinfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BinfilesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
