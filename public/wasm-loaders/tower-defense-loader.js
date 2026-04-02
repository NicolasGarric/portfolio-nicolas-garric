import init, * as TowerDefenseWasm from '/tower-defense-wasm/tower_defense.js';
await init();
window.TowerDefenseWasm = TowerDefenseWasm;
window.dispatchEvent(new Event('tower-defense-wasm-ready'));
