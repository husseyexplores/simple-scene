import { createScene } from '../src'

/**
 *
 * @param {import('../src').MathConstants} m
 * @returns {import('../src').Scene}
 */
function myScene(m) {
  let t = m.TWO_PI / 4

  return {
    setup() {
      let { ctx } = this
      ctx.fillStyle = '#15151f'
      ctx.fillRect(0, 0, this.CVS_WIDTH, this.CVS_HEIGHT)
    },

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

      // ctx.strokeStyle = hsl
      // ctx.stroke()

      t += m.TWO_PI / 600
    },
  }
}

createScene('first_scene', myScene, {
  canvas: {
    width: 'VIEWPORT',
    height: 'VIEWPORT',
    marginX: 150,
    marginY: 150,
  },
  resetOnResize: true,
})
