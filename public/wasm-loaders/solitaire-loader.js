import init, * as SolitaireWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/solitaire-wasm/solitaire.js'\;
await init();
window.SolitaireWasm = SolitaireWasm;
window.dispatchEvent(new Event('solitaire-wasm-ready'));
