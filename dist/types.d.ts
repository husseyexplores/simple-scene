declare type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
export declare type MathConstants = {
    PI: number;
    TWO_PI: number;
};
export declare type SceneRef = {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    start: Function;
    stop: Function;
    setup: Function;
    cleanup: Function;
    CVS_WIDTH: number;
    CVS_HEIGHT: number;
    CVS_CENTER_X: number;
    CVS_CENTER_Y: number;
};
export declare type SceneOptionsCanvas = {
    width?: 'VIEWPORT' | number;
    height?: 'VIEWPORT' | number;
    marginX?: number;
    marginY?: number;
};
export declare type SceneOptions = {
    canvas?: SceneOptionsCanvas;
    toggle?: boolean;
    resetOnResize?: boolean;
    root?: HTMLElement;
};
export declare type SceneFull = {
    draw: (this: SceneRef) => void;
    setup: (this: SceneRef) => void;
};
export declare type Scene = AtLeastOne<SceneFull>;
export declare type GetScene = (constants: MathConstants) => Scene;
export {};
