import {Observable} from 'rx'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  isSocketConnected: false,
  isRobotConnected: false,
  direction: 0,
  speed: 0,
  color: {r: 0, g: 0, b:0},
})

function makeUpdate$(actions) {
  const updateStateWhenScrolledEvent$ = actions.scroll$
    .map(delta => function updateStateWhenScrolled(oldState) {
      if (delta > 0 ) {
        return oldState.update('direction', dir =>
          dir + delta
        )
      } else {
        return oldState.update('speed', spd =>
          spd + delta
        )
      }
    })

    const updateStateWhenMoveEvent$ = actions.move$
      .map(key => function updateStateWhenMove(oldState) {
        if (key.isFrwd) {
          if (key.isDown) {
            return oldState.update('speed', () => 100)
          }
          return oldState.update('speed', () => 0)
        } else {
          if (key.isDown) {
            return oldState
              .update('speed', () => 100)
              .update('direction', () => 180) //TODO
          }
          return oldState
            .update('speed', () => 0)
            .update('direction', () => 0) //TODO
        }
      })
    const updateStateWhenTurnEvent$ = Observable.timer(0, 30)
      .flatMapLatest(
        actions.turn$.map(key => function updateStateWhenTurn(oldState) {
          if (!key.isDown) {
            return oldState
          }
          const dirMin = 0
          const dirMax = 359
          const dirDelta = key.isLeft ? -6 : 6
          const dirTest = oldState.get('direction') + dirDelta
          if (dirTest < dirMin) {
            return oldState.update('direction', () => dirMax + dirTest)
          } else if (dirTest > dirMax) {
            return oldState.update('direction', () => dirMin + dirTest - dirMax)
          } else {
            return oldState.update('direction', () => dirTest)
          }
        })
      )

  return Observable.merge(
    updateStateWhenMoveEvent$,
    updateStateWhenTurnEvent$,
    updateStateWhenScrolledEvent$,
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
