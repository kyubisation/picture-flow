import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { FavoritesService } from '../core/favorites.service';
import { PhotoService } from '../core/photo.service';
import { DeletePhotoDialogComponent } from '../delete-photo-dialog/delete-photo-dialog.component';
import { Favorites } from '../models/favorites';
import { Photo } from '../models/photo';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowComponent {
  readonly user: Observable<firebase.User | null> = this._auth.user;
  readonly photos: Observable<Photo[]> = this._photoService.photos;
  readonly favorites: Observable<Favorites | undefined> = this._favoritesService.favorites;
  readonly hasPrevious: Observable<boolean> = this._photoService.hasPrevious;
  readonly hasNext: Observable<boolean> = this._photoService.hasNext;
  readonly photoIdentity = (_index: number, item: Photo) => item.id;

  constructor(
    private _photoService: PhotoService,
    private _favoritesService: FavoritesService,
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

  favorite(photo: Photo) {
    this._favoritesService.favorite(photo).subscribe();
  }

  unfavorite(photo: Photo) {
    this._favoritesService.unfavorite(photo).subscribe();
  }

  showPrevious() {
    this._photoService.previous();
  }

  showMore() {
    this._photoService.next();
  }
}
