import init, * as BreakoutWasm from '/breakout-wasm/breakout.mjs';
await init();
window.BreakoutWasm = BreakoutWasm;
window.dispatchEvent(new Event('breakout-wasm-ready'));
