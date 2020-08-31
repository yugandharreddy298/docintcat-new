import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentverificationComponent } from './documentverification.component';

describe('DocumentverificationComponent', () => {
  let component: DocumentverificationComponent;
  let fixture: ComponentFixture<DocumentverificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentverificationComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
