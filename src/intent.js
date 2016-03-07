import {Observable} from 'rx'

function intent(DOM) {
  const AWSDMap = {65: 'left', 68: 'right', 87: 'frwd', 83: 'rev'}
  const moveKeys = ['frwd', 'rev']
  const frwdLeft = ['frwd', 'left']
  const keyDirections$ = Observable.merge(
      Observable.fromEvent(document, 'keydown'),
      Observable.fromEvent(document, 'keyup')
    ).filter(e => {
        const AWSD = Object.keys(AWSDMap).map(s => parseInt(s, 10))
        const k = e.key || e.which;
        return AWSD.includes(k)
      }
    ).map(
      (e) => {
        return {direction: AWSDMap[e.key || e.which], isDown: (e.type === 'keydown')}
      }
    ).distinctUntilChanged()

  const moveDirections$ = keyDirections$.filter(dir => moveKeys.includes(dir.direction))
  const turnDirections$ = keyDirections$.filter(dir => !moveKeys.includes(dir.direction))
  return {
    scroll$: Observable.merge(
      DOM.select('.bb-8').events('click').map(() => +2),
      DOM.select('.css-robot-info').events('click').map(() => -2)
    ),
    move$: moveDirections$.map(dir => {
      return {isFrwd: frwdLeft.includes(dir.direction), isDown: dir.isDown}
    }),
    turn$: turnDirections$.map(dir => {
      return {isLeft: frwdLeft.includes(dir.direction), isDown: dir.isDown}
    }),
  }
}

export default intent
