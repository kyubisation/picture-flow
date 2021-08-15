import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Photo } from '../models/photo';

@Component({
  selector: 'app-delete-photo-dialog',
  templateUrl: './delete-photo-dialog.component.html',
  styleUrls: ['./delete-photo-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePhotoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly photo: Photo) {}
}
