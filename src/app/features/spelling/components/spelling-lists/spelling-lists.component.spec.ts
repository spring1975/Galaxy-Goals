import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SpellingListsComponent } from './spelling-lists.component';
import { SpellingStore } from '../../state/spelling.store';
import { MatDialog } from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';
import { SpellingUnitDialogComponent } from '../spelling-unit-dialog/spelling-unit-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { unprotected } from '@ngrx/signals/testing';
import { patchState } from '@ngrx/signals';
import { of } from 'rxjs';

describe('SpellingListsComponent', () => {
  let spectator: Spectator<SpellingListsComponent>;
  let store: SpellingStore;
  let mockMatDialog: any;

  const createComponent = createComponentFactory({
    component: SpellingListsComponent,
    imports: [NoopAnimationsModule],
    declarations: [MockComponent(SpellingUnitDialogComponent)],
    providers: [
      SpellingStore, // Use the actual store
      {
        provide: MatDialog,
        useValue: {
          open: jest.fn()
        }
      }
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(SpellingStore);
    mockMatDialog = spectator.inject(MatDialog);

    // Reset spies
    jest.clearAllMocks();

    // Mock the dialog's methods
    mockMatDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => of(null)
    });
  });  it('should create the component', () => {
    const component = spectator.component;
    expect(component).toBeTruthy();
  });

  it('should call addUnit when addUnit is executed', () => {
    // ARRANGE
    const TEST_UNIT_DATA = { name: 'New Unit', words: ['word1', 'word2'] };
    const mockDialogRef = { afterClosed: () => of(TEST_UNIT_DATA) };

    // Spy on the component's dialog and store methods
    jest.spyOn(spectator.component.dialog, 'open').mockReturnValue(mockDialogRef as any);
    jest.spyOn(store, 'addUnit');

    // ACT
    spectator.component.addUnit();

    // ASSERT
    expect(spectator.component.dialog.open).toHaveBeenCalled();
    expect(store.addUnit).toHaveBeenCalledWith(TEST_UNIT_DATA);
  });

  it('should call deleteUnit when deleteUnit is executed', () => {
    // ARRANGE
    const TEST_UNIT = { id: '1', name: 'Unit 1' } as any;
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(store, 'deleteUnit');

    // ACT
    spectator.component.deleteUnit(TEST_UNIT);

    // ASSERT
    expect(store.deleteUnit).toHaveBeenCalledWith('1');
  });

  it('should calculate recent score correctly', () => {
    // ARRANGE
    const TEST_UNIT_ID = '1';
    const TEST_ATTEMPTS = [
      { unitId: '1', date: '2025-09-14', score: 80, mode: 'ALL20' as const, mistakes: [] },
      { unitId: '1', date: '2025-09-15', score: 90, mode: 'ALL20' as const, mistakes: [] }
    ];

    // Use patchState with unprotected to set the store state directly
    patchState(unprotected(store), { attempts: TEST_ATTEMPTS });

    // ACT
    const score = spectator.component.getRecentScore(TEST_UNIT_ID);

    // ASSERT
    expect(score).toBe(90);
  });

  it('should access store state using unprotected utility', () => {
    // ARRANGE
    const TEST_UNITS = [
      { id: '1', name: 'Unit 1', words: ['word1', 'word2'] },
      { id: '2', name: 'Unit 2', words: ['word3', 'word4', 'word5'] }
    ];

    // Use patchState with unprotected to directly modify store state for testing
    patchState(unprotected(store), { units: TEST_UNITS });

    // ASSERT
    expect(store.units()).toEqual(TEST_UNITS);
    expect(store.units()).toHaveLength(2);
  });
});
