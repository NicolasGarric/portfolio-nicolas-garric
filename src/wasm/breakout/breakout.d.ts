/* tslint:disable */
/* eslint-disable */

export class GameState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get_ball_size(): number;
    get_ball_x(): number;
    get_ball_y(): number;
    get_brick_height(): number;
    get_brick_width(): number;
    get_bricks(): Float32Array;
    get_canvas_height(): number;
    get_canvas_width(): number;
    get_lives(): number;
    get_paddle_height(): number;
    get_paddle_width(): number;
    get_paddle_x(): number;
    get_paddle_y(): number;
    get_score(): number;
    is_ball_stuck(): boolean;
    is_game_over(): boolean;
    is_won(): boolean;
    launch_ball(): void;
    static new(): GameState;
    set_paddle_direction(dir: PaddleDirection): void;
    tick(): void;
}

export enum PaddleDirection {
    Left = 0,
    Right = 1,
    None = 2,
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamestate_free: (a: number, b: number) => void;
    readonly gamestate_get_ball_size: (a: number) => number;
    readonly gamestate_get_ball_x: (a: number) => number;
    readonly gamestate_get_ball_y: (a: number) => number;
    readonly gamestate_get_brick_height: (a: number) => number;
    readonly gamestate_get_brick_width: (a: number) => number;
    readonly gamestate_get_bricks: (a: number) => [number, number];
    readonly gamestate_get_canvas_height: (a: number) => number;
    readonly gamestate_get_canvas_width: (a: number) => number;
    readonly gamestate_get_lives: (a: number) => number;
    readonly gamestate_get_paddle_height: (a: number) => number;
    readonly gamestate_get_paddle_width: (a: number) => number;
    readonly gamestate_get_paddle_x: (a: number) => number;
    readonly gamestate_get_paddle_y: (a: number) => number;
    readonly gamestate_get_score: (a: number) => number;
    readonly gamestate_is_ball_stuck: (a: number) => number;
    readonly gamestate_is_game_over: (a: number) => number;
    readonly gamestate_is_won: (a: number) => number;
    readonly gamestate_launch_ball: (a: number) => void;
    readonly gamestate_new: () => number;
    readonly gamestate_set_paddle_direction: (a: number, b: number) => void;
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
