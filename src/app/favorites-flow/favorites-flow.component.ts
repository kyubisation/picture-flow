import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { FavoritesService } from '../core/favorites.service';
import { Photo } from '../models/photo';

@Component({
  selector: 'app-favorites-flow',
  templateUrl: './favorites-flow.component.html',
  styleUrls: ['./favorites-flow.component.scss'],
})
export class FavoritesFlowComponent {
  readonly photos: Observable<Photo[]> = this._favoritesService.favorites;
  readonly photoIdentity = (_index: number, item: Photo) => item.id;

  constructor(private _favoritesService: FavoritesService) {}
}
