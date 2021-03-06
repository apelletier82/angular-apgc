import {
  Component, OnInit, Inject, ViewChild, OnDestroy,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { delay, finalize, map } from 'rxjs/operators';
import FolderSelection from './folder-selection';
import FolderYear from '../folder-year';
import Folder from '../folder';
import FolderService from '../folder.service';

@Component({
  selector: 'apgc-folder-selection',
  templateUrl: './folder-selection.component.html',
  styleUrls: ['./folder-selection.component.scss'],
})
export default class FolderSelectionComponent implements OnInit, OnDestroy {
  private initializing = true;

  private originalFolders: Folder[] = [];

  private selectedFolderYearsSubscription: Subscription;

  private getFolderListSubscription: Subscription;

  private selectFolderIdFormValueChangeSubscription: Subscription;

  foldersSubject: BehaviorSubject<Folder[]> = new BehaviorSubject([]);

  selectedFolderYearsSubject: BehaviorSubject<
  FolderYear[]
  > = new BehaviorSubject([]);

  loadingYears: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // #region selectFolderForm
  selectFolderForm: FormGroup;

  get selectFolderIdForm(): FormGroup {
    return this.selectFolderForm.get('selectFolderIdForm') as FormGroup;
  }

  get selectYearIdForm(): FormGroup {
    return this.selectFolderForm.get('selectYearIdForm') as FormGroup;
  }

  get selectedFolderId(): number {
    return +this.selectFolderIdForm.get('selectedFolderId').value || 0;
  }

  get selectedYearId(): number {
    return +this.selectYearIdForm.get('selectedYearId').value || 0;
  }
  // #endregion selectFolderForm

  get selectedFolderData(): FolderSelection {
    return {
      folderId: this.selectedFolderId,
      yearId: this.selectedYearId,
    };
  }

  @ViewChild(MatVerticalStepper, { static: true })
  stepper: MatVerticalStepper;

  constructor(
    private formBuilder: FormBuilder,
    private folderService: FolderService,
    @Inject(MAT_DIALOG_DATA) public data: FolderSelection,
  ) {}

  private createFolderListSubscription(): Subscription {
    return this.folderService.folderList$.subscribe((folders) => {
      this.foldersSubject.next(folders);
      this.originalFolders = folders;
    });
  }

  private createFolderIdFormValueChangeSubscription(): Subscription {
    return this.selectFolderIdForm
      .get('selectedFolderId')
      .valueChanges.subscribe((value) => {
        this.selectYearIdForm.setValue({ selectedYearId: [] });
        if (value?.length > 0 && +value !== 0) {
          this.loadingYears.next(true);
          this.folderService
            .getFolderYears(+value)
            .pipe(
              map((years: FolderYear[]) => [...years].sort((a, b) => b.year - a.year)),
              delay(250),
              finalize(() => this.loadingYears.next(false)),
            )
            .subscribe((years) => this.selectedFolderYearsSubject.next(years || []));
        } else {
          this.selectedFolderYearsSubject.next([]);
        }
      });
  }

  private createFolderYearsSubscription(): Subscription {
    return this.selectedFolderYearsSubject.asObservable().subscribe((years) => {
      if (years?.length > 0 && this.initializing === false) {
        this.stepper?.next();
      }
    });
  }

  private initializeFolderForm() {
    // Has to be initialized as array
    this.selectFolderForm.setValue({
      selectFolderIdForm: {
        selectedFolderId: this.data?.folderId ? [this.data.folderId] : [],
      },
      selectYearIdForm: {
        selectedYearId: this.data?.yearId ? [this.data.yearId] : [],
      },
    });
  }

  private createSelectFolderForm() {
    this.selectFolderForm = this.formBuilder.group({
      selectFolderIdForm: this.formBuilder.group({
        selectedFolderId: [[], [Validators.required]],
      }),
      selectYearIdForm: this.formBuilder.group({
        selectedYearId: [[], [Validators.required]],
      }),
    });
  }

  private unInitialize() {
    this.initializing = false;
  }

  ngOnInit(): void {
    this.createSelectFolderForm();
    this.getFolderListSubscription = this.createFolderListSubscription();
    // eslint-disable-next-line operator-linebreak
    this.selectFolderIdFormValueChangeSubscription =
      this.createFolderIdFormValueChangeSubscription();
    this.selectedFolderYearsSubscription = this.createFolderYearsSubscription();
    this.initializeFolderForm();
    setTimeout(() => this.unInitialize(), 250);
  }

  ngOnDestroy(): void {
    this.getFolderListSubscription?.unsubscribe();
    this.selectFolderIdFormValueChangeSubscription?.unsubscribe();
    this.selectedFolderYearsSubscription?.unsubscribe();

    this.selectedFolderYearsSubject.complete();
    this.foldersSubject.complete();
  }

  applyFolderFilter(event: Event): void {
    const filterValueLowercase = (event.target as HTMLInputElement).value.toLocaleLowerCase();
    this.foldersSubject.next(
      this.originalFolders.filter(
        (f) => f.folderName.toLocaleLowerCase().indexOf(filterValueLowercase) > -1,
      ),
    );
  }
}
