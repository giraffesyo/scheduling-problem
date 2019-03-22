import React from 'react'
import produce from 'immer'

class Process {
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

class Queue {
  queue: Process[] = []

  pop = () => {
    if (this.queue.length === 0) {
      return null
    }
    const [itemToReturn, ...newQueue] = this.queue
    this.queue = newQueue
    return itemToReturn
  }

  enqueue = (process: Process) => {
    this.queue = [...this.queue, process]
  }

  enqueueAtFront = (process: Process) => {
    this.queue = [process, ...this.queue]
  }

  peek = () => {
    if (this.queue.length > 0) {
      return this.queue[0]
    } else {
      return null
    }
  }
}

interface SchedulerState {
  currentTime: number
  timeIdle: number
  timeOnCurrentProcess: number
  queue: Queue
  TimeQuantum: number
  processesToSchedule: Process[]
}

class Scheduler extends React.PureComponent<{}, SchedulerState> {
  state = {
    currentTime: 0,
    timeIdle: 0,
    timeOnCurrentProcess: 0,
    queue: new Queue(),
    TimeQuantum: 10,
    processesToSchedule: [
      new Process('P1', 40, 15, 0),
      new Process('P2', 30, 25, 25),
      new Process('P3', 30, 20, 30),
      new Process('P4', 35, 15, 50),
      new Process('P5', 5, 15, 100),
      new Process('P6', 10, 10, 105),
    ],
  }

  // Returns a process which has arrived and not queued, e.g. "new arrival",
  //if there are multiple it returns the highest priority one
  //Additionally, it handles removing the process from our process list so we won't get it again
  findArrivedProcessWithHighestPriority = () => {
    const { currentTime, processesToSchedule } = this.state
    //all remaining processes which have arrived
    const foundProcesses = processesToSchedule!.filter(
      Process => Process.arrival <= currentTime
    )

    if (foundProcesses.length < 1) return null

    let highestPriorityProcess = foundProcesses[0]
    foundProcesses.forEach(Process => {
      if (Process.priority > highestPriorityProcess.priority)
        highestPriorityProcess = Process
    })
    // remove this process from our list of processes
    this.setState(
      produce(draft => {
        draft.processesToSchedule.splice(
          draft.processesToSchedule.findIndex(
            ({ identifier }) => identifier === highestPriorityProcess.identifier
          ),
          1
        )
      })
    )
    return highestPriorityProcess
  }

  finishCurrentProcess = () => {
    const { currentTime } = this.state
    if (!currentProcess)
      throw new Error('There is not a current process to complete')
    //currentProcess.completionTime = currentTime

    this.setState({ timeOnCurrentProcess: 0 })
  }

  componentDidMount = () => {
    let { currentTime } = this.state
    // Get the first process
    let currentProcess
    while (true) {
      currentProcess = this.findArrivedProcessWithHighestPriority()
      // If we got null then we need to keep adding time until we get the first process
      if (!currentProcess) {
        currentTime++
        continue
      } else {
        break
      }
    }
    this.state.queue
    this.setState({ currentTime })
  }

  schedule = () => {
    const { currentTime } = this.state
    const { processesToSchedule } = this.state
    const currentProcess = processesToSchedule!.filter(
      Process => Process.identifier === currentProcessName
    )[0]
    //Run
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

  render() {
    const { processesToSchedule } = this.state
    console.log(processesToSchedule)
    return (
      <div>
        <h1>Round Robin</h1>
        <table>
          <tr>
            <th>Process</th>
            <th>Priority</th>
            <th>Burst</th>
            <th>Arrival</th>
          </tr>
          {processesToSchedule.map(
            ({ identifier, priority, burst, arrival }) => (
              <tr>
                <td>{identifier}</td>
                <td>{priority}</td>
                <td>{burst}</td>
                <td>{arrival}</td>
              </tr>
            )
          )}
        </table>
      </div>
    )
  }
}

export default Scheduler
