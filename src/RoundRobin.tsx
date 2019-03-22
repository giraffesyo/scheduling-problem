import React from 'react'
import produce from 'immer'

export class Process {
  identifier: string
  priority: number
  burst: number
  arrival: number
  remainingTime: number
  completionTime: number | null
  current: boolean

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
    this.current = false
  }

  getTurnaroundTime = () =>
    this.completionTime ? this.completionTime - this.arrival : undefined
  getWaitingTime = () =>
    this.completionTime ? this.getTurnaroundTime()! - this.burst : undefined
}

interface SchedulerState {
  currentTime: number
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
  interval?: NodeJS.Timeout

  state: Readonly<SchedulerState> = {
    currentTime: 0,
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
          preemptiveProcess.current = true
          draft.queue = [preemptiveProcess, ...restOfProcesses]
          draft.timeOnCurrentProcess = 0
        } else if (preemptiveProcess.priority > draft.queue[0].priority) {
          const [firstProcessOfOldQueue, ...restOfOldQueue] = draft.queue
          firstProcessOfOldQueue.current = false
          preemptiveProcess.current = true
          draft.queue = [
            preemptiveProcess,
            ...restOfOldQueue,
            ...restOfProcesses,
            firstProcessOfOldQueue,
          ]
          draft.timeOnCurrentProcess = 0
        } else {
          draft.queue = [...draft.queue, preemptiveProcess, ...restOfProcesses]
        }
      })
    )
    return true
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

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
    }
  }

  schedule = async () => {
    const { enqueueArrivedProcesses } = this
    // Get the current item from queue
    await enqueueArrivedProcesses()
    const {
      currentTime,
      processesToSchedule,
      timeOnCurrentProcess,
      TimeQuantum,
      queue,
    } = this.state

    if (queue.length < 1) {
      this.setState(
        produce(draft => {
          draft.currentTime++
          draft.timeOnCurrentProcess++
        })
      )
    } else {
      this.setState(
        produce(draft => {
          const currentProcess = draft.queue[0]
          draft.currentTime++
          draft.timeOnCurrentProcess++
          currentProcess.remainingTime--
          if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = draft.currentTime
            currentProcess.current = false
            draft.queue.splice(0, 1)
            if (draft.queue.length > 0) {
              draft.queue[0].current = true
            }
          } else if (draft.timeOnCurrentProcess >= TimeQuantum) {
            const [firstItem, ...restOfQueue] = draft.queue
            draft.queue = [...restOfQueue, firstItem]
            if (restOfQueue.length != 0) {
              firstItem.current = false
              restOfQueue[0].current = true
            }
            draft.timeOnCurrentProcess = 0
          } // else we leave the item in place
        })
      )
    }
  }

  scheduleAutomatically = () => {
    if (this.interval) {
      clearInterval(this.interval)
    } else {
      this.interval = setInterval(this.schedule, 100)
    }
  }

  render() {
    const { initialProcessesToSchedule } = this.props
    const { queueHistory, currentTime } = this.state
    const { schedule, scheduleAutomatically } = this
    return (
      <div className="container">
        <h1>Round Robin</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Priority</th>
              <th>Burst</th>
              <th>Arrival</th>
              <th>Remaining Time</th>
              <th>Completion Time</th>
              <th>Turnaround Time</th>
              <th>Waiting Time</th>
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
                  <td>{priority}</td>
                  <td>{burst}</td>
                  <td>{arrival}</td>
                  <td>{remainingTime}</td>
                  <td>{completionTime}</td>
                  <td>{getTurnaroundTime()}</td>
                  <td>{getWaitingTime()}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <div>Current Time: {currentTime}</div>
        <button onClick={schedule}>Advance</button>
        <button onClick={scheduleAutomatically}>
          {this.interval ? 'Stop' : 'Advance automatically'}
        </button>
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
