import React from 'react'

import { Process } from './utility'

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
    console.log(props)
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
