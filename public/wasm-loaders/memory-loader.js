import init, * as MemoryWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/memory-wasm/memory.js';
await init();
window.MemoryWasm = MemoryWasm;
window.dispatchEvent(new Event('memory-wasm-ready'));
