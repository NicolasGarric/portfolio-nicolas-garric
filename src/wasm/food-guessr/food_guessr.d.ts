/* tslint:disable */
/* eslint-disable */

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get_attempts(): number;
    get_current_answer(): string;
    get_current_round(): number;
    get_max_attempts(): number;
    get_potential_score(): number;
    get_round_score(): number;
    get_total_rounds(): number;
    get_total_score(): number;
    is_game_over(): boolean;
    is_round_over(): boolean;
    static new(): GameState;
    next_round(): void;
    set_current_answer(answer: string): void;
    submit_answer(correct: number): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_get_attempts: (a: number) => number;
    readonly gamestate_get_current_answer: (a: number) => [number, number];
    readonly gamestate_get_current_round: (a: number) => number;
    readonly gamestate_get_max_attempts: (a: number) => number;
    readonly gamestate_get_potential_score: (a: number) => number;
    readonly gamestate_get_round_score: (a: number) => number;
    readonly gamestate_get_total_rounds: (a: number) => number;
    readonly gamestate_get_total_score: (a: number) => number;
    readonly gamestate_is_game_over: (a: number) => number;
    readonly gamestate_is_round_over: (a: number) => number;
    readonly gamestate_new: () => number;
    readonly gamestate_next_round: (a: number) => void;
    readonly gamestate_set_current_answer: (a: number, b: number, c: number) => void;
    readonly gamestate_submit_answer: (a: number, b: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
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
