import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let spectator: Spectator<AppComponent>;
  const createComponent = createComponentFactory(AppComponent);

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create the app', () => {
    const app = spectator.component;
    expect(app).toBeTruthy();
  });

  it(`should have the 'galaxy-goals' title`, () => {
    const app = spectator.component;
    expect(app.title).toEqual('galaxy-goals');
  });
});
