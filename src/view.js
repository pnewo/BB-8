'use strict'

import {h} from '@cycle/dom'
import hh from 'hyperscript-helpers'
import io from 'socket.io-client'
const {div, h1, h3, h6, ul, li, button, section, p} = hh(h)
const socket = io()


function movementMonitor(state) {

  socket.emit('move', {direction: state.direction, speed: state.speed})
  return (
    div('.css-movement-monitor',[
      h3('.css-robot-status',
        state.isRobotConnected ? 'Robot online' : 'Robot offline'
      ),
      p('.css-robot-info', `Robot moving in direction ${state.direction} with speed ${state.speed}`),
      p('.css-robot-info', `Color is set to ${JSON.stringify(state.color)}`),
    ])
  )
}

function view(state$) {
  return state$.map(state =>
    div('.css-root', [
      h1('.bb-8','BB-8'),
      movementMonitor(state),
      p('.footer', 'footer'),
    ])
  )
}

export default view
