import { signalStore, withState, withMethods, patchState, getState } from '@ngrx/signals';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { DataKeys } from 'src/app/shared/storage/data-keys';
import { Dayjs } from 'dayjs';

export interface SpellingList {
  id: string;
  name: string;
  words: string[];
  created: Dayjs;
  lastPracticed?: Dayjs;
}

export interface SpellingListsState {
  lists: SpellingList[];
  currentListId: string | undefined;
}

const initialState: SpellingListsState = {
  lists: [],
  currentListId: undefined
};

export const SpellingListSignalStore = signalStore(
  { providedIn: 'root' },
  withState<SpellingListsState>(initialState),
  withStorageSync({ key: DataKeys.SPELLING_LISTS }),
  withMethods((store) => ({
    getLists(): SpellingList[] {
      return getState(store).lists;
    },
    getCurrentList(): SpellingList | undefined {
      const state = getState(store);
      return state.lists.find(l => l.id === state.currentListId);
    },
    setCurrentList(id: string): void {
      patchState(store, { currentListId: id });
    },
    addList(list: SpellingList): void {
      const state = getState(store);
      patchState(store, { lists: [...state.lists, list] });
    },
    updateList(list: SpellingList): void {
      const state = getState(store);
      patchState(store, {
        lists: state.lists.map(l => l.id === list.id ? list : l)
      });
    },
    deleteList(id: string): void {
      const state = getState(store);
      const newLists = state.lists.filter(l => l.id !== id);
      const newCurrentListId = state.currentListId === id ? undefined : state.currentListId;
      patchState(store, {
        lists: newLists,
        ...(newCurrentListId !== undefined ? { currentListId: newCurrentListId } : {})
      });
    }
  }))
);
