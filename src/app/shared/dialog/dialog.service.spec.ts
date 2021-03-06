import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import TestingModule from 'src/app/test/testing.module';
import DialogData from './dialog-data';
import DialogService from './dialog.service';

class DialogMock {
  private readonly openResult = {
    afterClose(): Observable<string> {
      return of('Ok');
    },
  };

  open(): any {
    return this.openResult;
  }
}

describe('DialogService', () => {
  let service: DialogService;

  const dialogData: DialogData = {
    title: 'Dialog title',
    description: 'Dialog description',
    actions: [{ action: 'Cancel' }, { action: 'Ok', default: true }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [{ provide: MatDialog, useClass: DialogMock }],
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show dialog and select ok', (done) => {
    service.showDialog(dialogData).subscribe((action) => {
      expect(action).toBe('Ok');
      done();
    });
  });
});
