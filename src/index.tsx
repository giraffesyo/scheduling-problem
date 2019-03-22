import React from 'react'
import ReactDOM from 'react-dom'

import RoundRobin from './RoundRobin'
import { Process } from './RoundRobin'

ReactDOM.render(
  <RoundRobin
    initialProcessesToSchedule={[
      new Process('P1', 40, 15, 0),
      new Process('P2', 30, 25, 25),
      new Process('P3', 30, 20, 30),
      new Process('P4', 35, 15, 50),
      new Process('P5', 5, 15, 100),
      new Process('P6', 10, 10, 105),
    ]}
  />,
  document.getElementById('root')
)
