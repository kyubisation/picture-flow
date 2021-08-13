import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePhotoDialogComponent } from './delete-photo-dialog.component';

describe('DeletePhotoDialogComponent', () => {
  let component: DeletePhotoDialogComponent;
  let fixture: ComponentFixture<DeletePhotoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletePhotoDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletePhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
