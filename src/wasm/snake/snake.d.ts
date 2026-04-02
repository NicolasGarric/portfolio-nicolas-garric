/* tslint:disable */
/* eslint-disable */

export enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    change_direction(dir: Direction): void;
    get_cells(): Uint8Array;
    get_height(): number;
    get_score(): number;
    get_width(): number;
    is_game_over(): boolean;
    static new(): GameState;
    tick(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_change_direction: (a: number, b: number) => void;
    readonly gamestate_get_cells: (a: number) => [number, number];
    readonly gamestate_get_height: (a: number) => number;
    readonly gamestate_get_score: (a: number) => number;
    readonly gamestate_is_game_over: (a: number) => number;
    readonly gamestate_new: () => number;
    readonly gamestate_tick: (a: number) => void;
    readonly gamestate_get_width: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
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
