import React from 'react'

import { Process } from './utility'

interface MultilevelQueueProps {
  initialProcessesToSchedule: Process[]
  timeQuantum: number[]
}

export default class MultilevelQueue extends React.PureComponent<
  MultilevelQueueProps
> {
  render() {
    return <div />
  }
}
