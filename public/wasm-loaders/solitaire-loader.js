import init, * as SolitaireWasm from '/solitaire-wasm/solitaire.mjs';
await init();
window.SolitaireWasm = SolitaireWasm;
window.dispatchEvent(new Event('solitaire-wasm-ready'));
