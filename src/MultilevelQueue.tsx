import React from 'react'

import { Process } from './utility'
import _ from 'lodash'

import gant from './gant.module.css'

const noBorder = {
  border: 0,
}

const GantTable = ({ history }: { history: string[] }) => {
  const cells = [{ identifier: history[0], start: 0, stop: 1 }]
  let cellsIndex = 0
  for (let i = 1; i < history.length; i++) {
    if (history[i] === history[i - 1]) {
      cells[cellsIndex].stop++
    } else {
      cellsIndex++
      cells[cellsIndex] = { identifier: history[i], start: i, stop: i + 1 }
    }
  }
  console.log(`cells Index = ${cellsIndex}, cells are `, cells)
  return (
    <table className="table">
      <thead>
        <tr>
          {cells.map(cell => (
            <th
              scope="col"
              style={{ border: '1px solid black' }}
              key={cell.identifier + cell.start + '-' + cell.stop}
              colSpan={cell.stop - cell.start}>
              {cell.identifier}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr style={noBorder}>
          {cells.map((cell, index) => (
            <td
              className={gant.timing}
              key={'time' + '-' + cell.start}
              colSpan={cell.stop - cell.start}>
              <span>{cell.start}</span>
              {index === cells.length - 1 ? (
                <span className={gant.last}>{cell.stop}</span>
              ) : null}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

interface MultilevelQueueProps {
  initialProcessesToSchedule: Process[]
  timeQuantum: number[]
}

interface MultilevelQueueState {
  history: string[]
}

const chooseCurrentProcess = (processes: Process[]) => {}
export default class MultilevelQueue extends React.PureComponent<
  MultilevelQueueProps,
  MultilevelQueueState
> {
  constructor(props: MultilevelQueueProps) {
    super(props)
    let time = 0
    let timeOnCurrentProcess = 0
    let processingQueue = 0 // the queue we're currently processing (0 or 1)
    // Get a copy of our initial Processes
    let unarrived = [...props.initialProcessesToSchedule]
    // get initial queue 1 and queue 2 at arrival time 0
    let queues: Process[][] = [
      [
        ..._.remove(
          unarrived,
          process => process.arrival === time && process.priority === 1
        ),
      ],
      [
        ..._.remove(
          unarrived,
          process => process.arrival === time && process.priority === 2
        ),
      ],
    ]

    // This makes the assumption that we have an arrival at time zero
    let currentProcess: Process | undefined =
      queues[0].shift() || queues[1].shift()
    processingQueue = currentProcess!.priority - 1
    // history is an array that represents what process was in the queue in each time unit,
    // e.g. if Process P1 was in the array position 0 then it occupied the time from 0 to 1
    const history = []
    while (
      (unarrived.length > 0 ||
        queues[0].length > 0 ||
        queues[1].length > 0 ||
        currentProcess) &&
      time < 150
    ) {
      // get queue 1 length
      const previousHighPriorityQueueSize = queues[0].length
      // check if there are any  arrived processes and put them in their queue
      queues = [
        [
          ...queues[0],
          ..._.remove(
            unarrived,
            process => process.arrival === time && process.priority === 1
          ),
        ],
        [
          ...queues[1],
          ..._.remove(
            unarrived,
            process => process.arrival === time && process.priority === 2
          ),
        ],
      ]

      // handle context switch up on new process arrival
      if (
        currentProcess!.priority == 2 &&
        previousHighPriorityQueueSize < queues[0].length
      ) {
        // At least one newly arrived process is in a higher priority queue than what we're currently processing
        // we should switch to working on that new process
        queues[1].push(currentProcess!)
        currentProcess = queues[0]!.shift()
      }

      // handle if time quantum has passed
      if (timeOnCurrentProcess > props.timeQuantum[processingQueue]) {
        // get the queue of the current process
        let currentQueue = currentProcess!.priority
        // put our current process back at the end of its queue
        queues[currentQueue - 1].push(currentProcess!)
        // find out next queue
        let nextQueue = queues[0].length > 0 ? 0 : 1
        // get the next item to process from the highest priority queue with arrived processes
        currentProcess = queues[nextQueue].shift()
      }

      console.log('unarrived', unarrived)

      // Handle the current process ( consume a second )

      if (currentProcess) {
        history[time] = currentProcess.identifier
      } else {
        history[time] = 'idle'
      }
      if (currentProcess) {
        currentProcess.remainingTime--
        timeOnCurrentProcess++
        // if we used up all of the time, switch to the next process
        if (currentProcess.remainingTime === 0) {
          currentProcess.completionTime = time + 1
          currentProcess = queues[0].shift() || queues[1].shift()
          timeOnCurrentProcess = 0
          if (currentProcess) {
            processingQueue = currentProcess.priority - 1
          }
        }
      } else if (queues[0].length === 0 && queues[1].length === 0) {
        // handle if both queues are empty and we have no current process (idle time)
        time++
        continue
      }
      if (!currentProcess) {
        console.log(
          `We are currently idle there are ${queues[0].length +
            queues[1].length} items in queue (if > 0 theres an issue)`
        )
      } else {
        console.log(
          `It is time ${time} and current process is `,
          currentProcess
        )
      }
      // increment time
      time++
    }
    console.log(`Finished execution at time ${time}`)
    this.state = { history }
  }

  render() {
    const {
      props: { initialProcessesToSchedule },
    } = this
    const headerLabels = [
      'Process',
      'Burst Time',
      'Arrival',
      'Priority Queue',
      'Completion Time',
      'Turnaround Time',
      'Waiting Time',
    ]

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
                getTurnaroundTime,
                getWaitingTime,
              }) => (
                <tr key={identifier}>
                  <td>{identifier}</td>
                  <td>{burst}</td>
                  <td>{arrival}</td>
                  <td>{priority}</td>
                  <td>{completionTime}</td>
                  <td>{getTurnaroundTime()}</td>
                  <td>{getWaitingTime()}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <GantTable history={this.state.history} />
        <h3>
          Average turnaround time:{' '}
          {initialProcessesToSchedule.reduce(
            (collector, currentProcess) =>
              collector + currentProcess.getTurnaroundTime()!,
            0
          ) / initialProcessesToSchedule.length}
        </h3>
        <h3>
          Average waiting time:{' '}
          {initialProcessesToSchedule.reduce(
            (collector, currentProcess) =>
              collector + currentProcess.getWaitingTime()!,
            0
          ) / initialProcessesToSchedule.length}
        </h3>
      </div>
    )
  }
}
