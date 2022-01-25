type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type MathConstants = {
  PI: number
  TWO_PI: number
}

export type SceneRef = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  start: Function
  stop: Function
  setup: Function
  cleanup: Function
  CVS_WIDTH: number
  CVS_HEIGHT: number
  CVS_CENTER_X: number
  CVS_CENTER_Y: number
}

export type SceneOptionsCanvas = {
  width?: 'VIEWPORT' | number
  height?: 'VIEWPORT' | number
  marginX?: number
  marginY?: number
}

export type SceneOptions = {
  canvas?: SceneOptionsCanvas
  toggle?: boolean
  resetOnResize?: boolean
  root?: HTMLElement
}

export type SceneFull = {
  draw: (this: SceneRef) => void
  setup: (this: SceneRef) => void
}

export type Scene = AtLeastOne<SceneFull>

export type GetScene = (constants: MathConstants) => Scene

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
