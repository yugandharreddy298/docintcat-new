import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritefilesComponent } from './favoritefiles.component';

describe('FavoritefilesComponent', () => {
  let component: FavoritefilesComponent;
  let fixture: ComponentFixture<FavoritefilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoritefilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritefilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
