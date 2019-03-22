class Process {
  constructor(identifier, priority, burst, arrival) {
    this.identifier = identifier
    this.priority = priority
    this.burst = burst
    this.arrival = arrival
    this.remainingTime = burst
    this.completionTime = null
    this.firstTouched = null
  }
  complete = time => {
    this.completionTime = time
  }
}

// These are from the assignment handout
const TimeQuantum = 10
const processes = [
  new Process('P1', 40, 15, 0),
  new Process('P2', 30, 25, 25),
  new Process('P3', 30, 20, 30),
  new Process('P4', 35, 15, 50),
  new Process('P5', 5, 15, 100),
  new Process('P6', 10, 10, 105),
]

// Returns a process which has arrived and not queued, if there are multiple it returns the highest priority one
findArrivedProcessWithHighestPriority = currentTime => {
  // foundProcesses contains all processes which have arrived and have not been assigned a firstTouched time
  const foundProcesses = processes.filter(
    Process => processes.arrival <= currentTime && !this.firstTouched
  )

  if (foundProcesses.length < 1) return null

  let highestPriorityProcess = Process[0]
  foundProcesses.forEach(Process => {
    if (Process.priority > highestPriorityProcess)
      highestPriorityProcess = Process
  })
  return highestPriorityProcess
}

class queue {
  constructor(items) {
    this.items = items
  }

  pop = () => {
    if (this.queue.length === 0) {
      return null
    }
    const [itemToReturn, ...newQueue] = this.queue
    this.queue = newQueue
    return itemToReturn
  }

  enqueue = item => {
    this.queue = [...this.queue, item]
  }

  peek = () => {
    if (this.queue.length > 0) {
      return this.queue[0]
    } else {
      return null
    }
  }
}

const schedule = () => {
  let currentTime = 0
  let timeIdle = 0
  let currentProcess = null
  let timeOnCurrentProcess = 0

  const finishCurrentProcess = () => {
    currentProcess.complete(currentTime)
    currentProcess = null
    timeOnCurrentProcess = 0
  }
  while (true) {
    // Create a timeout so if we haven't done anything in 100 time we will shutdown
    if (currentProcess === null && timeIdle >= 100) return

    // When we're idle we should be looking for the next process
    if (currentProcess === null) {
      currentProcess = findArrivedProcessWithHighestPriority(currentTime)
      currentProcess.firstTouched = currentTime
      timeOnCurrentProcess = 0
      // if current process is still null that means we stay idle
      if (currentProcess === null) {
        timeIdle++
        continue
      }
    }
    timeIdle = 0
    // "Process" the item for one time unit
    currentProcess.remainingTime -= 1
    // If the process no longer has any remaining time, it is completed
    if (currentProcess.remainingTime === 0) {
      finishCurrentProcess()
    }

    currentTime++
  }
}
