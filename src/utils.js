export function on(element, eventName, handler, opts = {}) {
  console.log('Adding listener', { element, eventName, handler })

  const listenerOptions = opts.listener || undefined
  element.addEventListener(eventName, handler, listenerOptions)

  if (typeof opts.runImmediately !== 'boolean') {
    opts.runImmediately = true
  }

  if (opts.runImmediately) {
    handler()
  }

  return function cleanup() {
    console.log('Removing listener', { element, eventName, handler })
    element.removeEventListener(eventName, handler)
  }
}

/**
 *
 * @param {Function} fn
 * @param {Array|undefined} args
 * @param {Object|undefined} context
 * @returns {[Function, Function]}
 */
export function onRAF(fn, args = undefined, context = undefined) {
  let frameId

  const start = () => {
    frameId = requestAnimationFrame(() => {
      fn.apply(context || this, args || [])
      if (frameId) start()
    })
  }

  function stop() {
    console.log('Actually stopping and cancelling RAF')
    cancelAnimationFrame(frameId)
    frameId = null
  }

  return [start, stop]
}

/**
 *
 * @returns {[number, number]}
 */
export function getViewportSize() {
  return [window.innerWidth, window.innerHeight]
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {SceneOptionsCanvas} options
 */
export function setCanvasHeight(canvas, options = {}) {
  let [vpWidth, vpHeight] = getViewportSize()

  let { marginX, marginY, width, height } = options

  if (typeof marginX !== 'number' || marginX < 0) options.marginX = 0
  if (typeof marginY !== 'number' || marginY < 0) options.marginY = 0

  if (width === 'VIEWPORT' || typeof width !== 'number' || width < 0) {
    width = vpWidth - marginX
  }

  if (height === 'VIEWPORT' || typeof height !== 'number' || height < 0) {
    height = vpHeight - marginY
  }

  canvas.width = width
  canvas.height = height

  if (marginY) {
    let marginEachSide = marginY / 2

    canvas.style.marginTop = marginEachSide + 'px'
    canvas.style.marginBottom = marginEachSide + 'px'
  }

  return [width, height]
}
