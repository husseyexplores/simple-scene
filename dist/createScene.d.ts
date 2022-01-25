import type { GetScene, SceneOptions } from './types';
export declare function createScene(id: Element['id'], getScene: GetScene, baseOptions?: SceneOptions): () => void;
