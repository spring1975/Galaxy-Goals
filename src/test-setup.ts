// Custom test setup - avoid manual Angular setup as jest-preset-angular handles it

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
