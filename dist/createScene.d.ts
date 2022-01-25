import type { SceneFn, SceneOptions } from './types';
export declare function createScene(sceneFn: SceneFn, sceneOptions?: SceneOptions, id?: 'string'): () => void;
