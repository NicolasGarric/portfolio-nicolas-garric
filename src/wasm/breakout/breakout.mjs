/* @ts-self-types="./breakout.d.ts" */

export class GameState {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GameState.prototype);
        obj.__wbg_ptr = ptr;
        GameStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameStateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gamestate_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get_ball_size() {
        const ret = wasm.gamestate_get_ball_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_ball_x() {
        const ret = wasm.gamestate_get_ball_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_ball_y() {
        const ret = wasm.gamestate_get_ball_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_brick_height() {
        const ret = wasm.gamestate_get_brick_height(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_brick_width() {
        const ret = wasm.gamestate_get_brick_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float32Array}
     */
    get_bricks() {
        const ret = wasm.gamestate_get_bricks(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_canvas_height() {
        const ret = wasm.gamestate_get_canvas_height(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_canvas_width() {
        const ret = wasm.gamestate_get_canvas_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_lives() {
        const ret = wasm.gamestate_get_lives(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get_paddle_height() {
        const ret = wasm.gamestate_get_paddle_height(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_paddle_width() {
        const ret = wasm.gamestate_get_paddle_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_paddle_x() {
        const ret = wasm.gamestate_get_paddle_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_paddle_y() {
        const ret = wasm.gamestate_get_paddle_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get_score() {
        const ret = wasm.gamestate_get_score(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {boolean}
     */
    is_ball_stuck() {
        const ret = wasm.gamestate_is_ball_stuck(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_game_over() {
        const ret = wasm.gamestate_is_game_over(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_won() {
        const ret = wasm.gamestate_is_won(this.__wbg_ptr);
        return ret !== 0;
    }
    launch_ball() {
        wasm.gamestate_launch_ball(this.__wbg_ptr);
    }
    /**
     * @returns {GameState}
     */
    static new() {
        const ret = wasm.gamestate_new();
        return GameState.__wrap(ret);
    }
    /**
     * @param {PaddleDirection} dir
     */
    set_paddle_direction(dir) {
        wasm.gamestate_set_paddle_direction(this.__wbg_ptr, dir);
    }
    tick() {
        wasm.gamestate_tick(this.__wbg_ptr);
    }
}
if (Symbol.dispose) GameState.prototype[Symbol.dispose] = GameState.prototype.free;

/**
 * @enum {0 | 1 | 2}
 */
export const PaddleDirection = Object.freeze({
    Left: 0, "0": "Left",
    Right: 1, "1": "Right",
    None: 2, "2": "None",
});

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_6ddd609b62940d55: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./breakout_bg.js": import0,
    };
}

const GameStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gamestate_free(ptr >>> 0, 1));

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('breakout_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
