# Simple Scene - HTML Canvas

Tiny canvas boilerplate/quickstarter. Why? Because p5.js is too big for our small use case. And it's too magical for newbies like me learning the Canvas for the first time.

It's best to learn the basics first and build a solid foundation, and then learn the abstractions or libraries.


## Install

`npm install simple-scene@next`

CDN link: https://unpkg.com/simple-scene@next


## Usage

Copy 👉 paste 👉 modify the following:

```js
import { createScene } from 'simple-scene'

createScene((m) => {
  let t = m.TWO_PI / 4

  return {
    // Only runs initially
    setup() {
      let { ctx } = this
      ctx.fillStyle = '#15151f'
      ctx.fillRect(0, 0, this.CVS_WIDTH, this.CVS_HEIGHT)
    },

    // Runs on every frame (requestAnimation frame)
    draw() {
      let { ctx } = this

      const { CVS_CENTER_X, CVS_CENTER_Y } = this

      let x = Math.cos(-t)
      let y = Math.sin(-t)
      let hsl = `hsl(${t * 80}, 100%, 50%)`

      ctx.beginPath()
      ctx.arc(CVS_CENTER_X + x * 200, CVS_CENTER_Y + y * 200, 10, 0, m.TWO_PI)
      ctx.fillStyle = hsl
      ctx.fill()

      t += m.TWO_PI / 400
    }
  }
})
```

More examples can be [found here](https://github.com/husseyexplores/simple-scene/tree/main/examples)


## API
```typescript
import { createScene } from 'simple-scene'

createScene(sceneFn, sceneOptions?, sceneId?)

// Required
let sceneFn : SceneFn = (constants: MathConstants) => {
  return {
    // Runs only once, initially,
    setup(this: SceneRef) {}

    // Runs on every frame (requestAnimationFrame)
    draw(this: SceneRef) {}
  }
}

// Optional, defaults to this
let sceneOptions : SceneOptions = {
  canvas: {
    width: 'VIEWPORT', // Or number
    height: 'VIEWPORT', // Or number

    // Margin round the canvas
    marginX: 0,

    // Margin round the canvas
    marginY:0,
  },

  // Adds a checkbox to toggle `draw` function animation
  toggle: true,

  // Runs `setup` whenever the window is resized
  resetOnResize: true,

  //  Starts animating by default.
  //  If set to false, only `setup` function will run initially.
  //  And the actual animation can be run via toggle checkbox or from `setup`
  //  function programatically.
  startAnimating: true,

  // Where to mount the canvas
  root: document.body,
}

// Optional - Must be unique. There can't be two scenes with the same id
let sceneId = 'my_first_scene'
```


## Local development

```bash
git clone git@github.com:husseyexplores/simple-scene.git
cd simple-scene
npm install
npm run dev
```

simple-scene entrypoint: `/src/createScene.ts`

front-end entrypoint: `/examples/1.js`

