import init, * as NasaQuizWasm from '/nasa-quiz-wasm/nasa_quiz.js';
await init();
window.NasaQuizWasm = NasaQuizWasm;
window.dispatchEvent(new Event('nasa-quiz-wasm-ready'));
