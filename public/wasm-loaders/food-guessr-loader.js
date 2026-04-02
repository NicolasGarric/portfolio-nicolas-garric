import init, * as FoodGuessrWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/food-guessr-wasm/food_guessr.js'\;
await init();
window.FoodGuessrWasm = FoodGuessrWasm;
window.dispatchEvent(new Event('food-guessr-wasm-ready'));
