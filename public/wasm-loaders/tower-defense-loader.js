import init, * as TowerDefenseWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/tower-defense-wasm/tower_defense.js';
await init();
window.TowerDefenseWasm = TowerDefenseWasm;
window.dispatchEvent(new Event('tower-defense-wasm-ready'));
