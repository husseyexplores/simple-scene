import { onRAF, setCanvasHeight, on } from './utils'
import type { GetScene, SceneOptions, SceneRef, MathConstants } from './types'

// -------------------------------------------------

const MATH_CONSTANTS: MathConstants = {
  TWO_PI: Math.PI * 2,
  PI: Math.PI,
}

const EXISTING_SCENES: Map<string, () => void> = new Map()

export function createScene(
  id: Element['id'],
  getScene: GetScene,
  baseOptions: SceneOptions = {},
) {
  if (typeof getScene !== 'function') throw new Error('Scene is missing')

  let existing = EXISTING_SCENES.get(id)
  if (existing) {
    console.warn(
      `Another scene with id "${id}" already exists. Please provide a different scene ID`,
    )
    return existing
  }

  let options = withDefaultSceneOptions(baseOptions)
  const { canvas, wrapper, toggleAnimateCheckbox } = createCanvas({
    id: id,
    rootNode: options.root,
    toggle: options.toggle,
  })
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  let cleanupFunctions: Function[] = []

  let scene = getScene(MATH_CONSTANTS)

  if (!scene || (!scene.setup && !scene.draw)) {
    throw new Error('Please provide a scene - (setup, draw)')
  }

  function cleanupScene() {
    ref.stop()

    cleanupFunctions.forEach(fn => fn())
    cleanupFunctions = []

    toggleAnimateCheckbox?.remove()

    canvas.remove()
    wrapper.remove()

    ref.start = noop
    ref.stop = noop
    ref.setup = noop
    ref.cleanup = noop

    EXISTING_SCENES.delete(id)
    // ref.canvas = null
    // ref.ctx = null
    // ref = null
  }

  EXISTING_SCENES.set(id, cleanupScene)

  let ref: SceneRef = {
    canvas,
    ctx,
    start: noop,
    stop: noop,
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

  if (typeof scene.setup === 'function') {
    scene.setup.call(ref)
    ref.setup = scene.setup.bind(ref)
  }

  if (typeof scene.draw === 'function') {
    let [startLoop, stopLoop] = onRAF(scene.draw.bind(ref as SceneRef))

    ref.start = () => {
      startLoop()
      if (toggleAnimateCheckbox && !toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = true
    }

    ref.stop = () => {
      stopLoop()
      if (toggleAnimateCheckbox && toggleAnimateCheckbox.checked)
        toggleAnimateCheckbox.checked = false
    }

    if (toggleAnimateCheckbox) {
      cleanupFunctions.push(
        on(toggleAnimateCheckbox, 'change', () => {
          const { checked } = toggleAnimateCheckbox
          checked ? startLoop() : stopLoop()
        }),
      )
    }
  }

  return cleanupScene
}

function noop() {}

function withDefaultSceneOptions(
  options: SceneOptions,
): Required<SceneOptions> {
  if (!options.root) options.root = document.body
  if (options.resetOnResize == null) options.resetOnResize = true
  if (options.toggle == null) options.toggle = true

  if (options.canvas) {
    if (!options.canvas.height) options.canvas.height = 'VIEWPORT'
    if (!options.canvas.width) options.canvas.width = 'VIEWPORT'
    if (!options.canvas.marginX) options.canvas.marginX = 0
    if (!options.canvas.marginY) options.canvas.marginX = 0
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
  rootNode,
}: {
  id: Element['id']
  toggle: boolean
  rootNode: HTMLElement
}): {
  wrapper: HTMLElement
  canvas: HTMLCanvasElement
  toggleAnimateCheckbox: undefined | HTMLInputElement
} {
  // 01. Create wrapper
  const wrapper = document.createElement('div')
  wrapper.id = id
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
      ['checked', true],
    ]

    attrs.forEach(([attr, value]) => {
      if (value === null) {
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
