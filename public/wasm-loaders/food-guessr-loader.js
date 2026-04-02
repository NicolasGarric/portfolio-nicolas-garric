import init, * as FoodGuessrWasm from '/food-guessr-wasm/food_guessr.js';
await init();
window.FoodGuessrWasm = FoodGuessrWasm;
window.dispatchEvent(new Event('food-guessr-wasm-ready'));
