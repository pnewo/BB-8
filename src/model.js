'use strict'

import {Observable} from 'rx'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  isSocketConnected: false,
  isRobotConnected: false,
  direction: 0,
  speed: 0,
  color: {r: 0, g: 0, b:0},
  audio: []
})

function makeUpdate$(actions) {
  const updateSocketStatus$ = actions.isSocketConnected$.map(isConnected => function updateSocketStatus(oldState) {
      return oldState.update('isSocketConnected', () => isConnected)
  })

  const updateStatus$ = actions.status$.map(status => function updateStatus(oldState) {
    console.log('model new status', status)
    return oldState.update('isRobotConnected', () => status.connected)
  })

  const updateSpeed$ = actions.speed$.map(speed => function updateStateWhenMove(oldState) {
    return oldState.update('speed', () => speed)
  })

  const updateDirection$ = actions.turn$.map(angleDelta => function updateDirection(oldState) {
    const dirMin = 0
    const dirMax = 360
    const dirTest = oldState.get('direction') + angleDelta
    if (dirTest < dirMin) {
      return oldState.update('direction', () => dirMax + dirTest)
    } else if (dirTest >= dirMax) {
      return oldState.update('direction', () => dirMin + dirTest - dirMax)
    } else {
      return oldState.update('direction', () => dirTest)
    }
  })

  const updateAudio$ = actions.audio$.map(audio => function updateAudio(oldState){
    return oldState.update('audio', () => audio)
  })

  return Observable.merge(
    updateSocketStatus$,
    updateStatus$,
    updateSpeed$,
    updateDirection$//,
    //updateAudio$
  )
}

function model(actions) {
  const update$ = makeUpdate$(actions)
  return update$
    .startWith(initialState)
    .scan((state, update) => update(state))
    .map(s => s.toJS())
}

export default model
