import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable, forkJoin, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { Favorites } from '../models/favorites';
import { Photo } from '../models/photo';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  readonly favoriteIds: Observable<Favorites | undefined>;
  readonly favorites: Observable<Photo[]>;
  private _favoriteDocument: Observable<AngularFirestoreDocument<Favorites>>;

  constructor(private _firestore: AngularFirestore, private _auth: AuthService) {
    this._favoriteDocument = this._auth.user.pipe(
      filter((u): u is firebase.User => !!u),
      map((u) => this._firestore.doc<Favorites>(`favorites/${u.uid}`))
    );
    this.favoriteIds = this._favoriteDocument.pipe(switchMap((d) => d.valueChanges()));
    this.favorites = this.favoriteIds.pipe(
      switchMap((favoriteData) => {
        if (!favoriteData?.photoIds.length) {
          return of([]);
        }
        const collection = this._firestore.collection<Photo>('photos');
        return forkJoin(
          favoriteData.photoIds.map((id) =>
            collection
              .doc(id)
              .get()
              .pipe(map((p) => ({ ...p.data(), id } as Photo)))
          )
        ).pipe(map((favorites) => favorites.filter((f): f is Photo => !!f)));
      })
    );
  }

  favorite(photo: Photo): Observable<void> {
    return forkJoin([this._favoriteDocument.pipe(take(1)), this.favoriteIds.pipe(take(1))]).pipe(
      switchMap(([doc, favorites]) =>
        doc.set({
          ...favorites,
          photoIds: (favorites?.photoIds || [])
            .concat(photo.id!)
            .filter((v, i, a) => a.indexOf(v) === i),
        })
      )
    );
  }

  unfavorite(photo: Photo): Observable<void> {
    return forkJoin([this._favoriteDocument.pipe(take(1)), this.favoriteIds.pipe(take(1))]).pipe(
      switchMap(([doc, favorites]) =>
        doc.set({
          ...favorites,
          photoIds: (favorites?.photoIds || []).filter((v) => v !== photo.id),
        })
      )
    );
  }
}
