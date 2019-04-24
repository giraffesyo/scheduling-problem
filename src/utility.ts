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
