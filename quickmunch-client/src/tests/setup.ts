// Setup polyfills and environment for Vitest jsdom tests
window.scrollTo = () => {};

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error polyfill
window.IntersectionObserver = MockIntersectionObserver;
