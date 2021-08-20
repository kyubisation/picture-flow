import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { PhotoService } from '../core/photo.service';
import { Photo } from '../models/photo';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent {
  readonly photos: Observable<Photo[]> = this._photoService.photos;
  readonly hasPrevious: Observable<boolean> = this._photoService.hasPrevious;
  readonly hasNext: Observable<boolean> = this._photoService.hasNext;
  readonly photoIdentity = (_index: number, item: Photo) => item.id;

  constructor(private _photoService: PhotoService) {}

  showPrevious() {
    this._photoService.previous();
  }

  showMore() {
    this._photoService.next();
  }
}
