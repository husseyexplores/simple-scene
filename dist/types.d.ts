declare type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
export declare type MathConstants = {
    PI: number;
    TWO_PI: number;
};
export declare type SceneRef = {
    /** Canvas HTML element */
    canvas: HTMLCanvasElement;
    /** Canvas 2d contenxt - canvas.getContent('2d') */
    ctx: CanvasRenderingContext2D;
    /** Start the animation */
    startAnimating: Function;
    /** stop the animation */
    stopAnimating: Function;
    /** Run the `setup` function */
    setup: Function;
    /** Remove the scene */
    cleanup: Function;
    /** Canvas width */
    CVS_WIDTH: number;
    /** Canvas height */
    CVS_HEIGHT: number;
    /** Canvas X center value */
    CVS_CENTER_X: number;
    /** Canvas Y center value */
    CVS_CENTER_Y: number;
};
export declare type SceneOptionsCanvas = {
    /** default: 'VIEWPORT' */
    width?: 'VIEWPORT' | number;
    /** default: 'VIEWPORT' */
    height?: 'VIEWPORT' | number;
    /** default: 0 */
    marginX?: number;
    /** default: 0 */
    marginY?: number;
};
export declare type SceneOptions = {
    canvas?: SceneOptionsCanvas;
    /**
     * Adds a checkbox to toggle `draw` function animation
     *
     * default: true */
    toggle?: boolean;
    /**
     * Runs `setup` whenever the window is resized
     *
     * default: true */
    resetOnResize?: boolean;
    /**
     * Where to mount the canvas
     *
     * default: document.body */
    root?: HTMLElement;
    /**
     *  Starts animating by default.
     *  If set to false, only `setup` function will run initially.
     *  And the actual animation can be run via toggle checkbox or from `setup`
     *  function programatically.
     *
     * default: true */
    startAnimating?: boolean;
};
export declare type SceneFull = {
    /** Only runs initially before starting the `draw` animation */
    setup: (this: SceneRef) => void;
    /** Runs on every frame (requestAnimationFrame) */
    draw: (this: SceneRef) => void;
};
export declare type Scene = AtLeastOne<SceneFull>;
export declare type SceneFn = (constants: MathConstants) => Scene;
export {};
