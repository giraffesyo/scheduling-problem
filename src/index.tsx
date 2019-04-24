import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap-css-only'
import RoundRobin from './RoundRobin'
import { Process } from './utility'
import MultilevelQueue from './MultilevelQueue'

ReactDOM.render(
  <div>
    <RoundRobin
      initialProcessesToSchedule={[
        new Process('P1', 40, 15, 0),
        new Process('P2', 30, 25, 25),
        new Process('P3', 30, 20, 30),
        new Process('P4', 35, 15, 50),
        new Process('P5', 5, 15, 100),
        new Process('P6', 10, 10, 105),
      ]}
    />
    <MultilevelQueue
      timeQuantum={[3, 4]}
      initialProcessesToSchedule={[
        new Process('P1', 1, 12, 0),
        new Process('P2', 2, 8, 4),
        new Process('P3', 1, 6, 5),
        new Process('P4', 2, 5, 12),
        new Process('P5', 2, 10, 18),
      ]}
    />
  </div>,
  document.getElementById('root')
)
