import React from 'react'
import produce from 'immer'

export class Process {
  identifier: string
  priority: number
  burst: number
  arrival: number
  remainingTime: number
  completionTime: number | null
  firstTouched: number | null

  constructor(
    identifier: string,
    priority: number,
    burst: number,
    arrival: number
  ) {
    this.identifier = identifier
    this.priority = priority
    this.burst = burst
    this.arrival = arrival
    this.remainingTime = burst
    this.completionTime = null
    this.firstTouched = null
  }
}

interface SchedulerState {
  currentTime: number
  timeIdle: number
  timeOnCurrentProcess: number
  queue: Process[]
  TimeQuantum: number
  processesToSchedule: Process[]
  queueHistory: { name: string; complete: boolean }[]
}

interface SchedulerProps {
  initialProcessesToSchedule: Process[]
}

const sortProcessesByPriority = (a: Process, b: Process) => {
  if (a.priority > b.priority) return -1
  if (b.priority > a.priority) return 1
  return 0
}
class Scheduler extends React.PureComponent<SchedulerProps, SchedulerState> {
  state: Readonly<SchedulerState> = {
    currentTime: 0,
    timeIdle: 0,
    timeOnCurrentProcess: 0,
    queue: [],
    TimeQuantum: 10,
    processesToSchedule: [],
    queueHistory: [],
  }

  // Updates queue with processes that have arrived but not queued, e.g. "new arrival",
  //Additionally, it handles removing the process from our process list so we won't get it again
  enqueueArrivedProcesses = (): boolean => {
    //all remaining processes which have arrived
    const { processesToSchedule, currentTime } = this.state
    const foundProcesses: Process[] = processesToSchedule!.filter(
      (process: Process) => process.arrival <= currentTime
    )

    if (foundProcesses.length < 1) return false

    // sort processes by priority
    foundProcesses.sort(sortProcessesByPriority)
    const [preemptiveProcess, ...restOfProcesses] = foundProcesses
    // enqueue our processes and
    // remove these processes from our list of processes
    this.setState(
      produce(draft => {
        draft.processesToSchedule = draft.processesToSchedule.filter(
          (process: Process) => !foundProcesses.includes(process)
        )
        // Check who wins, the new process or the current process and queue accordingly
        if (draft.queue.length < 1) {
          draft.queue = [preemptiveProcess, ...restOfProcesses]
        } else if (preemptiveProcess.priority > draft.queue[0].priority) {
          const [firstProcessOfOldQueue, ...restOfOldQueue] = draft.queue
          draft.queue = [
            preemptiveProcess,
            ...restOfOldQueue,
            ...restOfProcesses,
            firstProcessOfOldQueue,
          ]
        } else {
          draft.queue = [...draft.queue, preemptiveProcess, ...restOfProcesses]
        }
      })
    )
    return true
  }

  // finishCurrentProcess = () => {
  //   const { currentTime } = this.state
  //   if (!currentProcess)
  //     throw new Error('There is not a current process to complete')
  //   //currentProcess.completionTime = currentTime

  //   this.setState({ timeOnCurrentProcess: 0 })
  // }

  componentDidMount = async () => {
    let { currentTime } = this.state
    const { initialProcessesToSchedule: processesToSchedule } = this.props
    await this.setState({ processesToSchedule })
    // Get the first process
    let enqueuedSuccessfully = false
    while (true) {
      enqueuedSuccessfully = this.enqueueArrivedProcesses()
      // If we didnt enqueue successfully then we need to keep adding time
      // until we get the first processes in queue
      if (!enqueuedSuccessfully) {
        currentTime++
        continue
      } else {
        break
      }
      // }
      // this.setState(
      //   produce(draft => {
      //     draft.currentTime = currentTime
      //     draft.queue = [currentProcess!]
      //     // add this process to queue history as incomplete
      //     draft.queueHistory = [
      //       ...draft.queueHistory,
      //       { name: currentProcess!.identifier, complete: false },
      //     ]
      //   })
      // )
    }
  }

  schedule = () => {
    const { currentTime, processesToSchedule, queue } = this.state
    // Get the current item from queue

    this.setState(
      produce(draft => {
        draft.currentTime++
      })
    )
  }

  decreaseTime = (currentProcess: Process) => {
    const newProcess = {
      ...currentProcess,
      remainingTime: currentProcess.remainingTime - 1,
    }
    if (newProcess.remainingTime === 0)
      this.setState(
        produce(draft => {
          draft.currentTime += 1
          draft.timeOnCurrentProcess += 1
        })
      )
  }

  getRemainingTime = (identifier: string) => {
    const { queue } = this.state
    const { initialProcessesToSchedule } = this.props
    const results = queue.filter(({ identifier: name }) => name === identifier)
    // if no results use the burst time for now
    //TODO: Fix this as it will break in the end when a process is removed from queue
    if (results.length < 1) {
      const [process] = initialProcessesToSchedule.filter(
        ({ identifier: name }) => name === identifier
      )
      return process.remainingTime
    } else {
      return results[0].remainingTime
    }
  }
  render() {
    const { initialProcessesToSchedule } = this.props
    const { queueHistory, currentTime } = this.state
    const { schedule, getRemainingTime } = this
    return (
      <div>
        <h1>Round Robin</h1>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Priority</th>
              <th>Burst</th>
              <th>Arrival</th>
              <th>Remaining Time</th>
            </tr>
          </thead>
          <tbody>
            {initialProcessesToSchedule.map(
              ({ identifier, priority, burst, arrival }) => (
                <tr key={identifier}>
                  <td>{identifier}</td>
                  <td>{priority}</td>
                  <td>{burst}</td>
                  <td>{arrival}</td>
                  <td>{getRemainingTime(identifier)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <div>Current Time: {currentTime}</div>
        <button onClick={schedule}>Advance</button>
        <div>
          Queue:
          {queueHistory.map(({ name, complete }) => (
            <span key={`qh-${name}`}>
              {complete ? <del> {name}</del> : name}
            </span>
          ))}
        </div>
      </div>
    )
  }
}

export default Scheduler
