import init, * as SnakeWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/snake-wasm/snake.js';
await init();
window.SnakeWasm = SnakeWasm;
window.dispatchEvent(new Event('snake-wasm-ready'));
