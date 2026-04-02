/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_gamestate_free: (a: number, b: number) => void;
export const gamestate_can_place: (a: number, b: number, c: number) => number;
export const gamestate_debug_path: (a: number) => [number, number];
export const gamestate_get_base_hp: (a: number) => number;
export const gamestate_get_cell_size: (a: number) => number;
export const gamestate_get_enemies: (a: number) => [number, number];
export const gamestate_get_grid: (a: number) => [number, number];
export const gamestate_get_grid_height: (a: number) => number;
export const gamestate_get_grid_width: (a: number) => number;
export const gamestate_get_path: (a: number) => [number, number];
export const gamestate_get_projectiles: (a: number) => [number, number];
export const gamestate_get_resources: (a: number) => number;
export const gamestate_get_total_waves: (a: number) => number;
export const gamestate_get_tower_cost: (a: number, b: number) => number;
export const gamestate_get_wave: (a: number) => number;
export const gamestate_is_game_over: (a: number) => number;
export const gamestate_is_wave_in_progress: (a: number) => number;
export const gamestate_is_won: (a: number) => number;
export const gamestate_new: () => number;
export const gamestate_place_tower: (a: number, b: number, c: number, d: number) => number;
export const gamestate_start_wave: (a: number) => void;
export const gamestate_tick: (a: number) => void;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
