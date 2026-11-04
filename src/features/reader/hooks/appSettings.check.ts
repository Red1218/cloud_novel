/**
 * Self-check for app-wide reading settings. Run: node src/features/reader/hooks/appSettings.check.ts
 */
import assert from 'node:assert/strict';

const store = new Map<string, string>();
const localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};
// Object.keys(localStorage) lists stored keys in the browser; mimic that.
const storage = new Proxy(localStorage, { ownKeys: () => [...store.keys()], getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) });
(globalThis as unknown as { window: unknown }).window = { localStorage: storage };

const { getAppSettings, setAppSettings, forgetOldBookSettings } = await import('./useReaderEnvironment.ts');

assert.deepEqual(getAppSettings(), { brightness: 100, autoHideControls: true }, 'defaults: fit the page, full brightness');

setAppSettings({ brightness: 140, openZoom: 1.4 });
assert.equal(getAppSettings().brightness, 100, 'brightness is clamped');
assert.equal(getAppSettings().openZoom, 1.4);
setAppSettings({ openZoom: undefined });
assert.equal(getAppSettings().openZoom, undefined, 'turning zoom off goes back to fitting the page');

store.set('cloud-novel:reader-environment:global', '{"brightness":"bad","autoHideControls":false}');
assert.deepEqual(getAppSettings(), { brightness: 100, autoHideControls: false }, 'a bad stored value falls back to the default');

store.set('cloud-novel:reader-environment:book-1', '{"brightness":40}');
store.set('cloud-novel:reader-overrides:book-2', '{"brightness":40}');
forgetOldBookSettings();
assert.ok(!store.has('cloud-novel:reader-environment:book-1'), 'old full per-book copies are cleared');
assert.ok(store.has('cloud-novel:reader-environment:global'), 'the app settings stay');
assert.ok(store.has('cloud-novel:reader-overrides:book-2'), 'per-book overrides stay');

console.log('appSettings: ok');
