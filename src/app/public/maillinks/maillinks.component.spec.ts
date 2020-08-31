import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaillinksComponent } from './maillinks.component';

describe('MaillinksComponent', () => {
  let component: MaillinksComponent;
  let fixture: ComponentFixture<MaillinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaillinksComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaillinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
