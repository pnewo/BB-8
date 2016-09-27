'use strict'

import {Observable, Scheduler, ReplaySubject} from 'rx'
import io from 'socket.io-client'

function intent(DOM) {
  const keyMap = {a: 65, d: 68, w: 87, s: 83}
  const socket = io()
  //socket.on('connect',function(){console.log('connect')})

  const socketConnect$ = Observable.fromEventPattern(
    function (h) {
      socket.on('connect',h)
    }
  );

  const socketDisconnect$ = Observable.fromEventPattern(
    function (h) {
      socket.on('disconnect',h)
    }
  );

  const serverStatus$ = Observable.fromEventPattern(
    function (h) {
      socket.on('status',h)
    }
  );

  const audio$ = new ReplaySubject()
  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(
    media => {
      let audioContext = new AudioContext()
      let audioSrc = audioContext.createMediaStreamSource(media)
      let analyser = audioContext.createAnalyser()
      audioSrc.connect(analyser)
      let frequencyData = new Uint8Array(analyser.frequencyBinCount)
      function renderFrame() {
       requestAnimationFrame(renderFrame)
       analyser.getByteFrequencyData(frequencyData)
       audio$.onNext(frequencyData)
      }
      renderFrame()
    })
  //audio$.subscribe(data => console.log('audio',data))



  const keyDown$ = Observable.fromEvent(document, 'keydown')
  const keyUp$ = Observable.fromEvent(document, 'keyup')
  const keyPressed$ = Observable.merge(keyDown$, keyUp$)

  const aFilter = (e) => (e.keyCode || e.which) === keyMap.a
  const dFilter = (e) => (e.keyCode || e.which) === keyMap.d
  const wFilter = (e) => (e.keyCode || e.which) === keyMap.w
  const sFilter = (e) => (e.keyCode || e.which) === keyMap.s

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
    isSocketConnected$: Observable.merge(
      socketConnect$.map(() => true),
      socketDisconnect$.map(() => false)
    ),
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
    }),
    audio$: audio$
  }
}

export default intent
