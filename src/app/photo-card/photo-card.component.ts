import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { take, filter, switchMap } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { FavoritesService } from '../core/favorites.service';
import { PhotoService } from '../core/photo.service';
import { DeletePhotoDialogComponent } from '../delete-photo-dialog/delete-photo-dialog.component';
import { Favorites } from '../models/favorites';
import { Photo } from '../models/photo';

@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoCardComponent {
  readonly user: Observable<firebase.User | null> = this._auth.user;
  readonly favoriteIds: Observable<Favorites | undefined> = this._favoritesService.favoriteIds;
  @Input() photo!: Photo;

  constructor(
    private _favoritesService: FavoritesService,
    private _photoService: PhotoService,
    private _auth: AuthService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  openAsFullscreen(event: MouseEvent) {
    const source = event.target as HTMLImageElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      source.requestFullscreen();
    }
  }

  favorite(photo: Photo) {
    this._favoritesService.favorite(photo).subscribe();
  }

  unfavorite(photo: Photo) {
    this._favoritesService.unfavorite(photo).subscribe();
  }

  deletePhoto(photo: Photo) {
    this._auth.user
      .pipe(
        take(1),
        filter((u): u is firebase.User => !!u && photo.userId === u.uid),
        switchMap(() =>
          this._dialog.open(DeletePhotoDialogComponent, { data: photo }).afterClosed()
        ),
        filter((result): result is Photo => !!result),
        switchMap((photo) => this._photoService.delete(photo))
      )
      .subscribe({
        error: (e) =>
          this._snackBar
            .open(`${e}`, $localize`:@@deletePhotoRetryOnError:Retry`, { duration: 4000 })
            .onAction()
            .subscribe(() => this.deletePhoto(photo)),
      });
  }
}
