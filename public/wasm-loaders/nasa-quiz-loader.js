import init, * as NasaQuizWasm from 'https://cdn.jsdelivr.net/gh/NicolasGarric/portfolio-nicolas-garric@main/public/nasa-quiz-wasm/nasa_quiz.js';
await init();
window.NasaQuizWasm = NasaQuizWasm;
window.dispatchEvent(new Event('nasa-quiz-wasm-ready'));
