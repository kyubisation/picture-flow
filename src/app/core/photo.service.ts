import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase/app';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  from,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  delay,
  filter,
  map,
  mapTo,
  retryWhen,
  switchMap,
  take,
  takeUntil,
} from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PartialPhoto } from '../models/partial-photo';
import { Photo } from '../models/photo';

import { AuthService } from './auth.service';
import { noActiveUser } from './errors';
import { randomString } from './random';

const photoLimit = 10;

@Injectable({
  providedIn: 'root',
})
export class PhotoService implements OnDestroy {
  readonly photos: Observable<Photo[]>;
  readonly hasPrevious: Observable<boolean>;
  readonly hasNext: Observable<boolean>;
  private _destroy = new Subject<void>();
  private _pagination = new BehaviorSubject<{
    startAfter?: firebase.firestore.DocumentSnapshot<Photo>;
    endBefore?: firebase.firestore.DocumentSnapshot<Photo>;
  }>({});
  private _photoCollection: AngularFirestoreCollection<Photo>;
  private _photoPagination: Observable<AngularFirestoreCollection<Photo>>;

  constructor(
    private _storage: AngularFireStorage,
    private _firestore: AngularFirestore,
    private _auth: AuthService
  ) {
    this._photoCollection = this._firestore.collection<Photo>('photos');
    this._photoPagination = this._pagination.pipe(
      map((p) => this._createCollection(photoLimit, p.startAfter, p.endBefore))
    );
    this.photos = this._photoPagination.pipe(switchMap((p) => p.valueChanges({ idField: 'id' })));
    this.hasPrevious = this._photoPagination.pipe(
      switchMap((p) => p.get()),
      switchMap((documentSnapshots) =>
        this._createCollection(1, undefined, documentSnapshots.docs[0]).get()
      ),
      map((s) => !s.empty)
    );
    this.hasNext = this._photoPagination.pipe(
      switchMap((p) => p.get()),
      switchMap((documentSnapshots) =>
        documentSnapshots.docs.length < photoLimit
          ? of(false)
          : this._createCollection(1, documentSnapshots.docs[photoLimit - 1])
              .get()
              .pipe(map((s) => !s.empty))
      )
    );
    combineLatest([this._pagination, this.photos])
      .pipe(
        filter(([pagination, photos]) => !!pagination.endBefore && photos.length < photoLimit),
        takeUntil(this._destroy)
      )
      .subscribe(() => this.reset());
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
    this._pagination.complete();
  }

  reset() {
    this._pagination.next({});
  }

  next() {
    this._photoPagination
      .pipe(
        take(1),
        switchMap((p) => p.get())
      )
      .subscribe((documentSnapshots) => {
        const startAfter = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        this._pagination.next({ startAfter });
      });
  }

  previous() {
    this._photoPagination
      .pipe(
        take(1),
        switchMap((p) => p.get())
      )
      .subscribe((documentSnapshots) => {
        const endBefore = documentSnapshots.docs[0];
        this._pagination.next({ endBefore });
      });
  }

  add(photo: PartialPhoto) {
    return this._auth.user.pipe(
      take(1),
      switchMap((u) => (u ? of(u) : throwError(noActiveUser()))),
      switchMap(async (user) => {
        const { filePath, url } = await this._uploadPhoto(photo, user);
        const resizedUrl = await this._resolveResizedDownloadURL(filePath);
        await this._photoCollection.add({
          created: Date.now(),
          description: photo.description,
          url,
          resizedUrl,
          userId: user.uid,
          userName: user.displayName || user.uid,
          userPhotoURL: user.photoURL,
        });
      })
    );
  }

  delete(photo: Photo): Observable<void> {
    return from(this._photoCollection.doc(photo.id).delete()).pipe(
      switchMap(() =>
        forkJoin([
          this._storage.refFromURL(photo.url).delete(),
          photo.resizedUrl ? this._storage.refFromURL(photo.resizedUrl).delete() : of(null!),
        ])
      ),
      mapTo(undefined)
    );
  }

  private _createCollection(
    limit: number,
    startAfter?: firebase.firestore.DocumentSnapshot<Photo>,
    endBefore?: firebase.firestore.DocumentSnapshot<Photo>
  ) {
    return this._firestore.collection<Photo>('photos', (q) => {
      let query = q.orderBy('created', 'desc');
      if (startAfter) {
        query = query.startAfter(startAfter).limit(limit);
      } else if (endBefore) {
        query = query.endBefore(endBefore).limitToLast(limit);
      } else {
        query = query.limit(limit);
      }
      return query;
    });
  }

  private async _uploadPhoto(photo: PartialPhoto, user: firebase.User) {
    const filePath = `${randomString(12)}-${encodeURI(photo.file.name)}`;
    const fileRef = this._storage.ref(filePath);
    const uploadTask = fileRef.put(photo.file, {
      cacheControl: 'public,max-age=31536000,immutable',
      customMetadata: {
        author: user.displayName || user.uid,
        description: photo.description,
      },
    });
    await uploadTask.snapshotChanges().toPromise();
    const url = await fileRef.getDownloadURL().toPromise();
    return { filePath, url };
  }

  private async _resolveResizedDownloadURL(originalFilePath: string): Promise<string | undefined> {
    if (!environment.resize) {
      return undefined;
    }
    const filePath = `${environment.resize.directory}/${originalFilePath.replace(
      /(\.\w+)$/,
      `_${environment.resize.resolution}$1`
    )}`;
    return this._storage
      .ref(filePath)
      .getDownloadURL()
      .pipe(
        retryWhen((errors) => errors.pipe(delay(250), take(20))),
        catchError(() => of(undefined))
      )
      .toPromise();
  }
}
