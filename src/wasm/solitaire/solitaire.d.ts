/* tslint:disable */
/* eslint-disable */

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    auto_move_to_foundation(col: number): boolean;
    auto_move_waste_to_foundation(): boolean;
    can_move_tableau_to_tableau(from_col: number, card_idx: number, to_col: number): boolean;
    draw_from_stock(): void;
    get_foundation_suits(): Int8Array;
    get_foundations(): Int8Array;
    get_moves(): number;
    get_score(): number;
    get_stock_count(): number;
    get_tableau(): Uint8Array;
    get_waste_top(): Uint8Array;
    is_won(): boolean;
    move_tableau_to_foundation(col: number, foundation: number): boolean;
    move_tableau_to_tableau(from_col: number, card_idx: number, to_col: number): boolean;
    move_waste_to_foundation(foundation: number): boolean;
    move_waste_to_tableau(col: number): boolean;
    static new(seed: number): GameState;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_auto_move_to_foundation: (a: number, b: number) => number;
    readonly gamestate_auto_move_waste_to_foundation: (a: number) => number;
    readonly gamestate_can_move_tableau_to_tableau: (a: number, b: number, c: number, d: number) => number;
    readonly gamestate_draw_from_stock: (a: number) => void;
    readonly gamestate_get_foundation_suits: (a: number) => [number, number];
    readonly gamestate_get_foundations: (a: number) => [number, number];
    readonly gamestate_get_moves: (a: number) => number;
    readonly gamestate_get_score: (a: number) => number;
    readonly gamestate_get_stock_count: (a: number) => number;
    readonly gamestate_get_tableau: (a: number) => [number, number];
    readonly gamestate_get_waste_top: (a: number) => [number, number];
    readonly gamestate_is_won: (a: number) => number;
    readonly gamestate_move_tableau_to_foundation: (a: number, b: number, c: number) => number;
    readonly gamestate_move_tableau_to_tableau: (a: number, b: number, c: number, d: number) => number;
    readonly gamestate_move_waste_to_foundation: (a: number, b: number) => number;
    readonly gamestate_move_waste_to_tableau: (a: number, b: number) => number;
    readonly gamestate_new: (a: number) => number;
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
