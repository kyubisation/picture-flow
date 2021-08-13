import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
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
  tags = new FormArray([]);
  photoContent: Observable<string | undefined>;
  uploadProgress: Observable<number | undefined>;

  private _photoContent = new BehaviorSubject<string | undefined>(undefined);
  private _uploadProgress = new BehaviorSubject<number | undefined>(undefined);

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
      tags: this.tags,
    });
  }

  ngOnInit(): void {
    this.photoInput.nativeElement.click();
  }

  addTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (!value || this.tags.controls.some((c) => c.value === value)) {
      event.chipInput!.clear();
      return;
    }

    this.tags.push(new FormControl(value));
    event.chipInput!.clear();
  }

  removeTag(tag: AbstractControl) {
    this.tags.removeAt(this.tags.controls.findIndex((c) => c.value === tag.value));
  }

  addPhoto() {
    if (!this.form.valid) {
      return;
    }

    const photo: PartialPhoto = this.form.value;
    this._photoService.add(photo).subscribe({
      next: (v) => this._uploadProgress.next(v),
      complete: () => {
        this._uploadProgress.next(undefined);
        this._router.navigate(['/']);
      },
      error: (e) => {
        this._uploadProgress.next(undefined);
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
