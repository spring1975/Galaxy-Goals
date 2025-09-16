import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Skip setup when running in Wallaby environment
if (!((global as any).__wallaby__ ||
                  process.env['WALLABY_ENV'] === 'true' ||
                  (global as any).wallaby)) {
  setupZoneTestEnv({
      errorOnUnknownElements: true,
      errorOnUnknownProperties: true
  });
}

Object.defineProperty(window, 'CSS', {value: null});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance']
  })
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => ({
    enumerable: true,
    configurable: true
  })
});

Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
  writable: true
});

global.console = {
    ...console,
    debug: jest.fn(),
    trace: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};
