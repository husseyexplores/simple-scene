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
const EXISTING_SCENES = new Map();
function createScene(id, getScene, baseOptions = {}) {
  if (typeof getScene !== "function")
    throw new Error("Scene is missing");
  let existing = EXISTING_SCENES.get(id);
  if (existing) {
    console.warn(`Another scene with id "${id}" already exists. Please provide a different scene ID`);
    return existing;
  }
  let options = withDefaultSceneOptions(baseOptions);
  const { canvas, wrapper, toggleAnimateCheckbox } = createCanvas({
    id,
    rootNode: options.root,
    toggle: options.toggle
  });
  const ctx = canvas.getContext("2d");
  let cleanupFunctions = [];
  let scene = getScene(MATH_CONSTANTS);
  if (!scene || !scene.setup && !scene.draw) {
    throw new Error("Please provide a scene - (setup, draw)");
  }
  function cleanupScene() {
    ref.stop();
    cleanupFunctions.forEach((fn) => fn());
    cleanupFunctions = [];
    toggleAnimateCheckbox?.remove();
    canvas.remove();
    wrapper.remove();
    ref.start = noop;
    ref.stop = noop;
    ref.setup = noop;
    ref.cleanup = noop;
    EXISTING_SCENES.delete(id);
  }
  EXISTING_SCENES.set(id, cleanupScene);
  let ref = {
    canvas,
    ctx,
    start: noop,
    stop: noop,
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
  if (typeof scene.setup === "function") {
    scene.setup.call(ref);
    ref.setup = scene.setup.bind(ref);
  }
  if (typeof scene.draw === "function") {
    let [startLoop, stopLoop] = onRAF(scene.draw.bind(ref));
    ref.start = () => {
      startLoop();
      if (toggleAnimateCheckbox && !toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = true;
    };
    ref.stop = () => {
      stopLoop();
      if (toggleAnimateCheckbox && toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = false;
    };
    if (toggleAnimateCheckbox) {
      cleanupFunctions.push(on(toggleAnimateCheckbox, "change", () => {
        const { checked } = toggleAnimateCheckbox;
        checked ? startLoop() : stopLoop();
      }));
    }
  }
  return cleanupScene;
}
function noop() {
}
function withDefaultSceneOptions(options) {
  if (!options.root)
    options.root = document.body;
  if (options.resetOnResize == null)
    options.resetOnResize = true;
  if (options.toggle == null)
    options.toggle = true;
  if (options.canvas) {
    if (!options.canvas.height)
      options.canvas.height = "VIEWPORT";
    if (!options.canvas.width)
      options.canvas.width = "VIEWPORT";
    if (!options.canvas.marginX)
      options.canvas.marginX = 0;
    if (!options.canvas.marginY)
      options.canvas.marginX = 0;
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
  rootNode
}) {
  const wrapper = document.createElement("div");
  wrapper.id = id;
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
      ["checked", true]
    ];
    attrs.forEach(([attr, value]) => {
      if (value === null) {
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

export { createScene };
//# sourceMappingURL=index.es.js.map
