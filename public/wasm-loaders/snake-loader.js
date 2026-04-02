import init, * as SnakeWasm from '/snake-wasm/snake.js';
await init();
window.SnakeWasm = SnakeWasm;
window.dispatchEvent(new Event('snake-wasm-ready'));
