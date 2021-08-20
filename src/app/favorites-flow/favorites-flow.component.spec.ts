import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesFlowComponent } from './favorites-flow.component';

describe('FavoritesFlowComponent', () => {
  let component: FavoritesFlowComponent;
  let fixture: ComponentFixture<FavoritesFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FavoritesFlowComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritesFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
