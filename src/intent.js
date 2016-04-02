'use strict'

import {Observable} from 'rx'
import io from 'socket.io-client'

function intent(DOM) {
  const keyMap = {a: 65, d: 68, w: 87, s: 83}
  const socket = io()

  const serverStatus$ = Observable.fromEventPattern(
      function (h) {
        socket.on('status',h);
      }
  );
/*
  socket.on('status', (data) => {
    console.log('data', data)
  })
  const serverStatus$ = Observable.create(observer => {
    socket.on('status', (data) => {
        observer.onNext(data)
    })
    return {
        dispose : socket.close
    }
  })
*/
  const keyDown$ = Observable.fromEvent(document, 'keydown')
  const keyUp$ = Observable.fromEvent(document, 'keyup')
  const keyPressed$ = Observable.merge(keyDown$, keyUp$)

  const aFilter = (e) => (e.key || e.which) === keyMap.a
  const dFilter = (e) => (e.key || e.which) === keyMap.d
  const wFilter = (e) => (e.key || e.which) === keyMap.w
  const sFilter = (e) => (e.key || e.which) === keyMap.s

  const distinctKey = (e) => e.type + (e.key || e.which)

  const aPressed$ = keyPressed$.filter(aFilter).distinctUntilChanged(distinctKey)
  const dPressed$ = keyPressed$.filter(dFilter).distinctUntilChanged(distinctKey)
  const wPressed$ = keyPressed$.filter(wFilter).distinctUntilChanged(distinctKey)
  const sPressed$ = keyPressed$.filter(sFilter).distinctUntilChanged(distinctKey)

  const aUp$ = keyUp$.filter(aFilter)
  const dUp$ = keyUp$.filter(dFilter)

  const aHold$ = aPressed$.flatMap((key) => {
    if (key.type === 'keydown') {
      return Observable.timer(0,100).takeUntil(aUp$)
    }
    return Observable.empty()
  })
  const dHold$ = dPressed$.flatMap((key) => {
    if (key.type === 'keydown') {
      return Observable.timer(0,100).takeUntil(dUp$)
    }
    return Observable.empty()
  })

  const speedChange$ = Observable.merge(sPressed$, wPressed$)

  return {
    status$: serverStatus$,
    turn$: Observable.merge(
        aHold$.map(() => -10),
        dHold$.map(() => 10),
        sPressed$.map((key) => {
          if (key.type === 'keydown') {
            return -180
          }
          return 180
        })
    ),
    speed$: speedChange$.map((key) => {
        if (key.type === 'keydown') {
          return 150
        }
        return 0
      })
  }
}

export default intent
