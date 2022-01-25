type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type MathConstants = {
  PI: number
  TWO_PI: number
}

export type SceneRef = {
  /** Canvas HTML element */
  canvas: HTMLCanvasElement
  /** Canvas 2d contenxt - canvas.getContent('2d') */
  ctx: CanvasRenderingContext2D

  /** Start the animation */
  startAnimating: Function

  /** stop the animation */
  stopAnimating: Function

  /** Run the `setup` function */
  setup: Function

  /** Remove the scene */
  cleanup: Function

  /** Canvas width */
  CVS_WIDTH: number

  /** Canvas height */
  CVS_HEIGHT: number

  /** Canvas X center value */
  CVS_CENTER_X: number

  /** Canvas Y center value */
  CVS_CENTER_Y: number
}

export type SceneOptionsCanvas = {
  /** default: 'VIEWPORT' */
  width?: 'VIEWPORT' | number

  /** default: 'VIEWPORT' */
  height?: 'VIEWPORT' | number

  /** default: 0 */
  marginX?: number

  /** default: 0 */
  marginY?: number
}

export type SceneOptions = {
  canvas?: SceneOptionsCanvas

  /**
   * Adds a checkbox to toggle `draw` function animation
   *
   * default: true */
  toggle?: boolean

  /**
   * Runs `setup` whenever the window is resized
   *
   * default: true */
  resetOnResize?: boolean

  /**
   * Where to mount the canvas
   *
   * default: document.body */
  root?: HTMLElement

  /**
   *  Starts animating by default.
   *  If set to false, only `setup` function will run initially.
   *  And the actual animation can be run via toggle checkbox or from `setup`
   *  function programatically.
   *
   * default: true */
  startAnimating?: boolean
}

export type SceneFull = {
  /** Only runs initially before starting the `draw` animation */
  setup: (this: SceneRef) => void

  /** Runs on every frame (requestAnimationFrame) */
  draw: (this: SceneRef) => void
}

export type Scene = AtLeastOne<SceneFull>

export type SceneFn = (constants: MathConstants) => Scene

// export type RemoveListenerFn = () => void

// type AnyFunction = (...args: any[]) => any
// type GetEventTypeFromListener<T extends AnyFunction> = T extends (
//   this: any,
//   event: infer U,
// ) => any
//   ? U extends Event
//     ? U
//     : Event
//   : Event

// type GetEventType<
//   Target extends EventTarget,
//   Type extends string,
// > = Target extends unknown
//   ? `on${Type}` extends keyof Target
//     ? GetEventTypeFromListener<
//         // remove types that aren't assignable to `AnyFunction`
//         // so that we don't end up with union like `MouseEvent | Event`
//         Extract<Target[`on${Type}`], AnyFunction>
//       >
//     : Event
//   : never

// type ListenerObject<Ev extends Event> = {
//   // For listener objects, the handleEvent function has the object as the `this` binding
//   handleEvent(this: ListenerObject<Ev>, Ee: Ev): void
// }

// export type Listener<Ev extends Event, Target extends EventTarget> =
//   | ListenerObject<Ev>
//   // For a listener function, the `this` binding is the target the event listener is added to
//   // using bivariance hack here so if the user
//   // wants to narrow event type by hand TS
//   // won't give them an error
//   | { bivarianceHack(this: Target, e: Ev): void }['bivarianceHack']

// export type Binding<
//   Target extends EventTarget = EventTarget,
//   Type extends string = string,
// > = {
//   type: Type
//   listener: Listener<GetEventType<Target, Type>, Target>
//   options?: boolean | AddEventListenerOptions
// }
