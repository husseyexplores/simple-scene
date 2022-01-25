(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SimpleScene = {}));
})(this, (function (exports) { 'use strict';

  function on(element, eventName, handler, opts = {}) {
    console.log('Adding listener', { element, eventName, handler });

    const listenerOptions = opts.listener || undefined;
    element.addEventListener(eventName, handler, listenerOptions);

    if (typeof opts.runImmediately !== 'boolean') {
      opts.runImmediately = true;
    }

    if (opts.runImmediately) {
      handler();
    }

    return function cleanup() {
      console.log('Removing listener', { element, eventName, handler });
      element.removeEventListener(eventName, handler);
    }
  }

  /**
   *
   * @param {Function} fn
   * @param {Array|undefined} args
   * @param {Object|undefined} context
   * @returns {[Function, Function]}
   */
  function onRAF(fn, args = undefined, context = undefined) {
    let frameId;

    const start = () => {
      frameId = requestAnimationFrame(() => {
        fn.apply(context || this, args || []);
        if (frameId) start();
      });
    };

    function stop() {
      console.log('Actually stopping and cancelling RAF');
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    return [start, stop]
  }

  /**
   *
   * @returns {[number, number]}
   */
  function getViewportSize() {
    return [window.innerWidth, window.innerHeight]
  }

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {SceneOptionsCanvas} options
   */
  function setCanvasHeight(canvas, options = {}) {
    let [vpWidth, vpHeight] = getViewportSize();

    let { marginX, marginY, width, height } = options;

    if (typeof marginX !== 'number' || marginX < 0) options.marginX = 0;
    if (typeof marginY !== 'number' || marginY < 0) options.marginY = 0;

    if (width === 'VIEWPORT' || typeof width !== 'number' || width < 0) {
      width = vpWidth - marginX;
    }

    if (height === 'VIEWPORT' || typeof height !== 'number' || height < 0) {
      height = vpHeight - marginY;
    }

    canvas.width = width;
    canvas.height = height;

    if (marginY) {
      let marginEachSide = marginY / 2;

      canvas.style.marginTop = marginEachSide + 'px';
      canvas.style.marginBottom = marginEachSide + 'px';
    }

    return [width, height]
  }

  const MATH_CONSTANTS = {
    TWO_PI: Math.PI * 2,
    PI: Math.PI
  };
  let _sceneCount = 0;
  const EXISTING_SCENES = new Map();
  function createScene(sceneFn, sceneOptions = {}, id) {
    if (typeof sceneFn !== "function")
      throw new Error("Scene is missing");
    let sceneId = `simple_scene_${id || ++_sceneCount}`;
    let existing = EXISTING_SCENES.get(sceneId);
    if (existing) {
      console.warn(`Another scene with id "${id}" already exists. Please provide a different scene ID`);
      return existing;
    }
    let options = withDefaultSceneOptions(sceneOptions);
    const { canvas, wrapper, toggleAnimateCheckbox } = createCanvas({
      id: sceneId,
      rootNode: options.root,
      toggle: options.toggle,
      toggleChecked: options.startAnimating
    });
    const ctx = canvas.getContext("2d");
    let cleanupFunctions = [];
    let scene = sceneFn(MATH_CONSTANTS);
    if (!scene || !scene.setup && !scene.draw) {
      throw new Error("Please provide a scene - (setup, draw)");
    }
    function cleanupScene() {
      ref.stopAnimating();
      cleanupFunctions.forEach((fn) => fn());
      cleanupFunctions = [];
      toggleAnimateCheckbox?.remove();
      canvas.remove();
      wrapper.remove();
      ref.startAnimating = noop;
      ref.stopAnimating = noop;
      ref.setup = noop;
      ref.cleanup = noop;
      EXISTING_SCENES.delete(sceneId);
    }
    EXISTING_SCENES.set(sceneId, cleanupScene);
    let ref = {
      canvas,
      ctx,
      startAnimating: noop,
      stopAnimating: noop,
      setup: noop,
      cleanup: cleanupScene,
      CVS_WIDTH: 0,
      CVS_HEIGHT: 0,
      CVS_CENTER_X: 0,
      CVS_CENTER_Y: 0
    };
    cleanupFunctions.push(on(window, "resize", () => {
      [ref.CVS_WIDTH, ref.CVS_HEIGHT] = setCanvasHeight(canvas, options?.canvas);
      ref.CVS_CENTER_X = ref.CVS_WIDTH / 2;
      ref.CVS_CENTER_Y = ref.CVS_HEIGHT / 2;
      if (options?.resetOnResize !== false && ref.setup)
        ref.setup();
    }));
    if (typeof scene.draw === "function") {
      let [startLoop, stopLoop] = onRAF(scene.draw.bind(ref));
      if (options.startAnimating) {
        startLoop();
      }
      ref.startAnimating = () => {
        stopLoop();
        startLoop();
        if (toggleAnimateCheckbox && !toggleAnimateCheckbox.checked)
          toggleAnimateCheckbox.checked = true;
      };
      ref.stopAnimating = () => {
        stopLoop();
        if (toggleAnimateCheckbox && toggleAnimateCheckbox.checked)
          toggleAnimateCheckbox.checked = false;
      };
      if (toggleAnimateCheckbox) {
        cleanupFunctions.push(on(toggleAnimateCheckbox, "change", () => {
          const { checked } = toggleAnimateCheckbox;
          checked ? startLoop() : stopLoop();
        }, { runImmediately: false }));
      }
    }
    if (typeof scene.setup === "function") {
      scene.setup.call(ref);
      ref.setup = scene.setup.bind(ref);
    }
    return cleanupScene;
  }
  function noop() {
  }
  function withDefaultSceneOptions(options) {
    if (!(options.root instanceof HTMLElement))
      options.root = document.body;
    if (options.resetOnResize == null)
      options.resetOnResize = true;
    if (options.toggle == null)
      options.toggle = true;
    if (options.startAnimating == null)
      options.startAnimating = true;
    if (options.canvas) {
      let {
        height = "VIEWPORT",
        width = "VIEWPORT",
        marginX = 0,
        marginY = 0
      } = options.canvas;
      if (typeof height === "string" && height !== "VIEWPORT")
        height = "VIEWPORT";
      else if (typeof height === "number" && height < 0)
        height = 0;
      if (typeof width === "string" && width !== "VIEWPORT")
        width = "VIEWPORT";
      else if (typeof width === "number" && width < 0)
        width = 0;
      if (typeof marginX !== "number" || marginX < 0)
        marginX = 0;
      if (typeof marginY !== "number" || marginY < 0)
        marginY = 0;
      options.canvas.width = width;
      options.canvas.height = height;
      options.canvas.marginX = marginX;
      options.canvas.marginY = marginY;
    }
    if (!options.canvas)
      options.canvas = {
        width: "VIEWPORT",
        height: "VIEWPORT",
        marginX: 0,
        marginY: 0
      };
    return options;
  }
  function createCanvas({
    id,
    toggle,
    toggleChecked,
    rootNode
  }) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-scene-id", id);
    wrapper.style.position = "relative";
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    wrapper.appendChild(canvas);
    let toggleAnimateCheckbox;
    if (toggle) {
      let checkbox = toggleAnimateCheckbox = document.createElement("input");
      const attrs = [
        ["type", "checkbox"],
        ["class", "toggle-animate"],
        ["checked", toggleChecked]
      ];
      console.log({ toggleChecked });
      attrs.forEach(([attr, value]) => {
        if (value == null || value === false) {
          checkbox.removeAttribute(attr);
        } else {
          checkbox.setAttribute(attr, value.toString());
        }
      });
      wrapper.appendChild(checkbox);
    }
    rootNode.appendChild(wrapper);
    return {
      wrapper,
      canvas,
      toggleAnimateCheckbox
    };
  }

  exports.createScene = createScene;

  Object.defineProperty(exports, '__esModule', { value: true });
  exports[Symbol.toStringTag] = 'Module';

}));
//# sourceMappingURL=index.umd.js.map
