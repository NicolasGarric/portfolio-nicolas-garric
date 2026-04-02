/* tslint:disable */
/* eslint-disable */

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    can_place(x: number, y: number): boolean;
    debug_path(): string;
    get_base_hp(): number;
    get_cell_size(): number;
    get_enemies(): Float32Array;
    get_grid(): Uint8Array;
    get_grid_height(): number;
    get_grid_width(): number;
    get_path(): Float32Array;
    get_projectiles(): Float32Array;
    get_resources(): number;
    get_total_waves(): number;
    get_tower_cost(tower_type: TowerType): number;
    get_wave(): number;
    is_game_over(): boolean;
    is_wave_in_progress(): boolean;
    is_won(): boolean;
    static new(): GameState;
    place_tower(x: number, y: number, tower_type: TowerType): boolean;
    start_wave(): void;
    tick(): void;
}

export enum TowerType {
    Canon = 0,
    Machinegun = 1,
    Laser = 2,
    Wall = 3,
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_can_place: (a: number, b: number, c: number) => number;
    readonly gamestate_debug_path: (a: number) => [number, number];
    readonly gamestate_get_base_hp: (a: number) => number;
    readonly gamestate_get_cell_size: (a: number) => number;
    readonly gamestate_get_enemies: (a: number) => [number, number];
    readonly gamestate_get_grid: (a: number) => [number, number];
    readonly gamestate_get_grid_height: (a: number) => number;
    readonly gamestate_get_grid_width: (a: number) => number;
    readonly gamestate_get_path: (a: number) => [number, number];
    readonly gamestate_get_projectiles: (a: number) => [number, number];
    readonly gamestate_get_resources: (a: number) => number;
    readonly gamestate_get_total_waves: (a: number) => number;
    readonly gamestate_get_tower_cost: (a: number, b: number) => number;
    readonly gamestate_get_wave: (a: number) => number;
    readonly gamestate_is_game_over: (a: number) => number;
    readonly gamestate_is_wave_in_progress: (a: number) => number;
    readonly gamestate_is_won: (a: number) => number;
    readonly gamestate_new: () => number;
    readonly gamestate_place_tower: (a: number, b: number, c: number, d: number) => number;
    readonly gamestate_start_wave: (a: number) => void;
    readonly gamestate_tick: (a: number) => void;
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
