/* tslint:disable */
/* eslint-disable */

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    add_question(data: string): void;
    answer(index: number): boolean;
    get_answers(): string;
    get_correct_index(): number;
    get_current_index(): number;
    get_question(): string;
    get_score(): number;
    get_time_left(): number;
    get_total_questions(): number;
    is_answered(): boolean;
    is_game_over(): boolean;
    is_last_correct(): boolean;
    static new(): GameState;
    next_question(): void;
    tick_timer(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_add_question: (a: number, b: number, c: number) => void;
    readonly gamestate_answer: (a: number, b: number) => number;
    readonly gamestate_get_answers: (a: number) => [number, number];
    readonly gamestate_get_correct_index: (a: number) => number;
    readonly gamestate_get_current_index: (a: number) => number;
    readonly gamestate_get_question: (a: number) => [number, number];
    readonly gamestate_get_score: (a: number) => number;
    readonly gamestate_get_time_left: (a: number) => number;
    readonly gamestate_get_total_questions: (a: number) => number;
    readonly gamestate_is_answered: (a: number) => number;
    readonly gamestate_is_game_over: (a: number) => number;
    readonly gamestate_is_last_correct: (a: number) => number;
    readonly gamestate_new: () => number;
    readonly gamestate_next_question: (a: number) => void;
    readonly gamestate_tick_timer: (a: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
