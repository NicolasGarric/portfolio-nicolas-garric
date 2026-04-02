import init, * as MemoryWasm from '/memory-wasm/memory.mjs';
await init();
window.MemoryWasm = MemoryWasm;
window.dispatchEvent(new Event('memory-wasm-ready'));
