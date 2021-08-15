import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { PhotoService } from '../core/photo.service';
import { PartialPhoto } from '../models/partial-photo';

@Component({
  selector: 'app-add-photo',
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPhotoComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  @ViewChild('photoInput', { static: true }) photoInput!: ElementRef<HTMLInputElement>;
  form: FormGroup;
  photoContent: Observable<string | undefined>;
  uploadProgress: Observable<boolean>;

  private _photoContent = new BehaviorSubject<string | undefined>(undefined);
  private _uploadProgress = new BehaviorSubject<boolean>(false);

  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _photoService: PhotoService,
    formBuilder: FormBuilder
  ) {
    this.photoContent = this._photoContent.asObservable();
    this.uploadProgress = this._uploadProgress.asObservable();
    this.form = formBuilder.group({
      file: [undefined, Validators.required],
      description: ['', Validators.maxLength(200)],
    });
  }

  ngOnInit(): void {
    this.photoInput.nativeElement.click();
  }

  addPhoto() {
    if (!this.form.valid) {
      return;
    }

    this._uploadProgress.next(true);
    const photo: PartialPhoto = this.form.value;
    this._photoService.add(photo).subscribe({
      complete: () => {
        this._uploadProgress.next(false);
        this._photoService.reset();
        this._router.navigate(['/']);
      },
      error: (e) => {
        this._uploadProgress.next(false);
        this._snackBar
          .open(`${e}`, $localize`:@@addPhotoRetryOnError:Retry`, { duration: 4000 })
          .onAction()
          .subscribe(() => this.addPhoto());
      },
    });
  }

  extractPhotoContent() {
    const file = this.photoInput.nativeElement.files?.[0];
    this.form.get('file')!.setValue(file);
    if (!file) {
      this._photoContent.next(undefined);
      return;
    }

    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', () => {
      this._photoContent.next(fileReader.result as string);
    });
    fileReader.readAsDataURL(file);
  }
}
