/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_gamestate_free: (a: number, b: number) => void;
export const gamestate_add_question: (a: number, b: number, c: number) => void;
export const gamestate_answer: (a: number, b: number) => number;
export const gamestate_get_answers: (a: number) => [number, number];
export const gamestate_get_correct_index: (a: number) => number;
export const gamestate_get_current_index: (a: number) => number;
export const gamestate_get_question: (a: number) => [number, number];
export const gamestate_get_score: (a: number) => number;
export const gamestate_get_time_left: (a: number) => number;
export const gamestate_get_total_questions: (a: number) => number;
export const gamestate_is_answered: (a: number) => number;
export const gamestate_is_game_over: (a: number) => number;
export const gamestate_is_last_correct: (a: number) => number;
export const gamestate_new: () => number;
export const gamestate_next_question: (a: number) => void;
export const gamestate_tick_timer: (a: number) => void;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
