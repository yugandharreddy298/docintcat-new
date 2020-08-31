import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiledocumentComponent } from './filedocument.component';

describe('FiledocumentComponent', () => {
  let component: FiledocumentComponent;
  let fixture: ComponentFixture<FiledocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiledocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiledocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
