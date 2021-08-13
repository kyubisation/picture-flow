import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase/app';
import { forkJoin, from, Observable, Observer, of, Subject, throwError } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { Favorites } from '../models/favorites';
import { PartialPhoto } from '../models/partial-photo';
import { Photo } from '../models/photo';

import { AuthService } from './auth.service';
import { noActiveUser } from './errors';
import { randomString } from './random';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  readonly photos: Observable<Photo[]>;
  readonly favorites: Observable<Favorites | undefined>;
  private _photoCollection: AngularFirestoreCollection<Photo>;
  private _favoriteDocument: Observable<AngularFirestoreDocument<Favorites>>;

  constructor(
    private _storage: AngularFireStorage,
    private _firestore: AngularFirestore,
    private _auth: AuthService
  ) {
    this._photoCollection = this._firestore.collection<Photo>('photos', (q) =>
      q.orderBy('created', 'desc')
    );
    this.photos = this._photoCollection.valueChanges({ idField: 'id' });
    this._favoriteDocument = this._auth.user.pipe(
      filter((u): u is firebase.User => !!u),
      map((u) => this._firestore.doc<Favorites>(`favorites/${u.uid}`))
    );
    this.favorites = this._favoriteDocument.pipe(switchMap((d) => d.valueChanges()));
  }

  add(photo: PartialPhoto) {
    const result = new Subject<number | undefined>();
    this._auth.user
      .pipe(
        take(1),
        switchMap((u) => (u ? of(u) : throwError(noActiveUser()))),
        switchMap(async (user) => {
          const { fileRef, uploadTask } = this._uploadPhoto(photo, user);
          uploadTask.percentageChanges().subscribe(result);
          await uploadTask.snapshotChanges().toPromise();
          const url = await fileRef.getDownloadURL().toPromise();
          await this._savePhotoEntry(photo, url, user);
        })
      )
      .subscribe(result as Observer<void>);
    return result;
  }

  delete(photo: Photo): Observable<void> {
    return from(this._photoCollection.doc(photo.id).delete()).pipe(
      switchMap(() => this._storage.refFromURL(photo.url).delete())
    );
  }

  favorite(photo: Photo): Observable<void> {
    return forkJoin([this._favoriteDocument.pipe(take(1)), this.favorites.pipe(take(1))]).pipe(
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
    return forkJoin([this._favoriteDocument.pipe(take(1)), this.favorites.pipe(take(1))]).pipe(
      switchMap(([doc, favorites]) =>
        doc.set({
          ...favorites,
          photoIds: (favorites?.photoIds || []).filter((v) => v !== photo.id),
        })
      )
    );
  }

  private _uploadPhoto(photo: PartialPhoto, user: firebase.User) {
    const filePath = `${randomString(12)}-${encodeURI(photo.file.name)}`;
    const fileRef = this._storage.ref(filePath);
    const uploadTask = fileRef.put(photo.file, {
      customMetadata: {
        author: user.displayName || user.uid,
        description: photo.description,
      },
    });
    return { fileRef, uploadTask };
  }

  private _savePhotoEntry(photo: PartialPhoto, url: string, user: firebase.User) {
    return this._photoCollection.add({
      created: Date.now(),
      description: photo.description,
      url,
      userId: user.uid,
      userName: user.displayName || user.uid,
      userPhotoURL: user.photoURL,
    });
  }
}
