import { signalStore, withState, withMethods, patchState, getState } from '@ngrx/signals';
import { withEntities, EntityState, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';
import { DataKeys } from 'src/app/shared/storage/data-keys';
import { Dayjs } from 'dayjs';
import { sampleLists } from 'src/test-data';

export interface SpellingList {
  id: string;
  name: string;
  words: string[];
  created: Dayjs;
  lastPracticed?: Dayjs;
  lastSessionAccuracy?: number;
}


export interface SpellingListsState extends EntityState<SpellingList> {
  currentListId: string | undefined;
}

const initialState: SpellingListsState = {
  ids: [],
  entityMap: {},
  currentListId: undefined
};

export const SpellingListSignalStore = signalStore(
  { providedIn: 'root' },
  withState<SpellingListsState>(initialState),
  withEntities<SpellingList>(),
  withStorageSync({ key: DataKeys.SPELLING_LISTS }),
  withMethods((store) => ({
    getLists(): SpellingList[] {
      const state = getState(store);
      const savedLists = state.ids.map(id => state.entityMap[id]).filter((e): e is SpellingList => !!e);
  return sampleLists[0] ? [sampleLists[0], ...savedLists] : savedLists;
    },
    getCurrentList(): SpellingList | undefined {
      const state = getState(store);
      return state.currentListId ? state.entityMap[state.currentListId] : undefined;
    },
    setCurrentList(id: string): void {
      patchState(store, { currentListId: id });
    },
    addList(list: SpellingList): void {
      patchState(store, addEntity(list));
    },
    updateList(list: SpellingList): void {
      patchState(store, updateEntity({ id: list.id, changes: list }));
    },
    deleteList(id: string): void {
      patchState(store, removeEntity(id));
      const state = getState(store);
      if (state.currentListId === id) {
        patchState(store, { currentListId: undefined });
      }
    }
  }))
);
