import { onRAF, setCanvasHeight, on } from './utils'
import type { SceneFn, SceneOptions, SceneRef, MathConstants } from './types'

// -------------------------------------------------

const MATH_CONSTANTS: MathConstants = {
  TWO_PI: Math.PI * 2,
  PI: Math.PI,
}
let _sceneCount = 0
const EXISTING_SCENES: Map<string, () => void> = new Map()

export function createScene(
  sceneFn: SceneFn,
  sceneOptions: SceneOptions = {},
  id?: 'string',
) {
  if (typeof sceneFn !== 'function') throw new Error('Scene is missing')

  let sceneId = `simple_scene_${id || ++_sceneCount}`
  let existing = EXISTING_SCENES.get(sceneId)
  if (existing) {
    console.warn(
      `Another scene with id "${id}" already exists. Please provide a different scene ID`,
    )
    return existing
  }

  let options = withDefaultSceneOptions(sceneOptions)
  const { canvas, wrapper, toggleAnimateCheckbox } = createCanvas({
    id: sceneId,
    rootNode: options.root,
    toggle: options.toggle,
    toggleChecked: options.startAnimating,
  })
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  let cleanupFunctions: Function[] = []

  let scene = sceneFn(MATH_CONSTANTS)

  if (!scene || (!scene.setup && !scene.draw)) {
    throw new Error('Please provide a scene - (setup, draw)')
  }

  function cleanupScene() {
    ref.stopAnimating()

    cleanupFunctions.forEach(fn => fn())
    cleanupFunctions = []

    toggleAnimateCheckbox?.remove()

    canvas.remove()
    wrapper.remove()

    ref.startAnimating = noop
    ref.stopAnimating = noop
    ref.setup = noop
    ref.cleanup = noop

    EXISTING_SCENES.delete(sceneId)
    // ref.canvas = null
    // ref.ctx = null
    // ref = null
  }

  EXISTING_SCENES.set(sceneId, cleanupScene)

  let ref: SceneRef = {
    canvas,
    ctx,
    startAnimating: noop,
    stopAnimating: noop,
    setup: noop,
    cleanup: cleanupScene,
    CVS_WIDTH: 0,
    CVS_HEIGHT: 0,
    CVS_CENTER_X: 0,
    CVS_CENTER_Y: 0,
  }

  cleanupFunctions.push(
    on(window, 'resize', () => {
      ;[ref.CVS_WIDTH, ref.CVS_HEIGHT] = setCanvasHeight(
        canvas,
        options?.canvas,
      )

      ref.CVS_CENTER_X = ref.CVS_WIDTH / 2
      ref.CVS_CENTER_Y = ref.CVS_HEIGHT / 2

      if (options?.resetOnResize !== false && ref.setup) ref.setup()
    }),
  )

  if (typeof scene.draw === 'function') {
    let [startLoop, stopLoop] = onRAF(scene.draw.bind(ref as SceneRef))
    if (options.startAnimating) {
      // This is run on the next-tick. So `draw` will always run after the `setup`
      startLoop()
    }

    ref.startAnimating = () => {
      // Cancel any previous frame
      stopLoop()

      startLoop()

      if (toggleAnimateCheckbox && !toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = true
    }

    ref.stopAnimating = () => {
      stopLoop()
      if (toggleAnimateCheckbox && toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = false
    }

    if (toggleAnimateCheckbox) {
      cleanupFunctions.push(
        on(
          toggleAnimateCheckbox,
          'change',
          () => {
            const { checked } = toggleAnimateCheckbox
            checked ? startLoop() : stopLoop()
          },
          { runImmediately: false },
        ),
      )
    }
  }

  if (typeof scene.setup === 'function') {
    scene.setup.call(ref)
    ref.setup = scene.setup.bind(ref)
  }

  return cleanupScene
}

function noop() {}

function withDefaultSceneOptions(
  options: SceneOptions,
): Required<SceneOptions> {
  if (!(options.root instanceof HTMLElement)) options.root = document.body

  if (options.resetOnResize == null) options.resetOnResize = true
  if (options.toggle == null) options.toggle = true
  if (options.startAnimating == null) options.startAnimating = true

  if (options.canvas) {
    let {
      height = 'VIEWPORT',
      width = 'VIEWPORT',
      marginX = 0,
      marginY = 0,
    } = options.canvas

    if (typeof height === 'string' && height !== 'VIEWPORT') height = 'VIEWPORT'
    else if (typeof height === 'number' && height < 0) height = 0

    if (typeof width === 'string' && width !== 'VIEWPORT') width = 'VIEWPORT'
    else if (typeof width === 'number' && width < 0) width = 0

    if (typeof marginX !== 'number' || marginX < 0) marginX = 0
    if (typeof marginY !== 'number' || marginY < 0) marginY = 0

    options.canvas.width = width
    options.canvas.height = height
    options.canvas.marginX = marginX
    options.canvas.marginY = marginY
  }

  if (!options.canvas)
    options.canvas = {
      width: 'VIEWPORT',
      height: 'VIEWPORT',
      marginX: 0,
      marginY: 0,
    }

  return options as Required<SceneOptions>
}

function createCanvas({
  id,
  toggle,
  toggleChecked,
  rootNode,
}: {
  id: string
  toggle: boolean
  toggleChecked: boolean
  rootNode: HTMLElement
}): {
  wrapper: HTMLElement
  canvas: HTMLCanvasElement
  toggleAnimateCheckbox: undefined | HTMLInputElement
} {
  // 01. Create wrapper
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-scene-id', id)
  wrapper.style.position = 'relative'

  // 02. Create canvas
  const canvas = document.createElement('canvas')
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
  // const ctx = canvas.getContext('2d')
  wrapper.appendChild(canvas)

  // 03. Create toggle
  let toggleAnimateCheckbox: undefined | HTMLInputElement
  if (toggle) {
    let checkbox = (toggleAnimateCheckbox = document.createElement('input'))

    const attrs: [string, string | boolean | null][] = [
      ['type', 'checkbox'],
      ['class', 'toggle-animate'],
      ['checked', toggleChecked],
    ]

    console.log({ toggleChecked })
    attrs.forEach(([attr, value]) => {
      if (value == null || value === false) {
        checkbox.removeAttribute(attr)
      } else {
        checkbox.setAttribute(attr, value.toString())
      }
    })
    wrapper.appendChild(checkbox)
  }

  rootNode.appendChild(wrapper)

  return {
    wrapper,
    canvas,
    toggleAnimateCheckbox,
  }
}
