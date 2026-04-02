import init, * as TowerDefenseWasm from '/tower-defense-wasm/tower_defense.mjs';
await init();
window.TowerDefenseWasm = TowerDefenseWasm;
window.dispatchEvent(new Event('tower-defense-wasm-ready'));
