'use strict'

//import Rx from 'rx'
import Cycle from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import intent from './intent'
import model from './model'
import view from './view'

function main(sources) {
  const actions = intent(sources.DOM)
  const state$ = model(actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
  }
}

const drivers = {
  DOM: makeDOMDriver('#app-container'),
}

Cycle.run(main, drivers)
