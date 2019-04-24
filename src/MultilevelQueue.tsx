import React from 'react'

import { Process } from './utility'
import _ from 'lodash'

interface MultilevelQueueProps {
  initialProcessesToSchedule: Process[]
  timeQuantum: number[]
}

interface MultilevelQueueState {
  queue: Process[][]
}

export default class MultilevelQueue extends React.PureComponent<
  MultilevelQueueProps,
  MultilevelQueueState
> {
  state: MultilevelQueueState = {
    queue: [],
  }

  constructor(props: MultilevelQueueProps) {
    super(props)
    let time = 0
    // Get a copy of our initial Processes
    let queue = [...props.initialProcessesToSchedule]
    let arrived: Process[] = []
    while (queue.length > 0 || arrived.length > 0 && time < 1000){
      // check if there are any  arrived processes
      arrived = [...arrived ,..._.remove(queue,process => process.arrival === time)]
      console.log('arrived',arrived)
      console.log('queue', queue)
      // increment time
      time++
    }
  }

  render() {
    const {
      props: { initialProcessesToSchedule },
    } = this
    const headerLabels = ['Process', 'Burst Time', 'Arrival', 'Priority Queue']

    return (
      <div className="container mt-5">
        <h1>Multilevel Queue</h1>
        <table className="table">
          <thead>
            <tr>
              {headerLabels.map(label => (
                <th key={'th-' + label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialProcessesToSchedule.map(
              ({
                identifier,
                priority,
                burst,
                arrival,
                completionTime,
                remainingTime,
                getTurnaroundTime,
                getWaitingTime,
                current,
              }) => (
                <tr
                  className={
                    completionTime
                      ? 'table-success'
                      : current
                      ? 'table-primary '
                      : ''
                  }
                  key={identifier}>
                  <td>{identifier}</td>
                  <td>{burst}</td>
                  <td>{arrival}</td>
                  <td>{priority}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    )
  }
}
