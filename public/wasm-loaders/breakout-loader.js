import init, * as BreakoutWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/breakout-wasm/breakout.js';
await init();
window.BreakoutWasm = BreakoutWasm;
window.dispatchEvent(new Event('breakout-wasm-ready'));
