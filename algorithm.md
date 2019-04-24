Round Robin:

1. Initialize time to 0
2. Get first process from list
3. Check if it has arrived
   1. If it has not arrived, increment time and restart at step 2
   2. Else, check if anything else arrived at the same time
   3. Pick the highest priority process
4. Run decrease time subroutine
5. Increment the current time
6. If we have an item we are processing, check if there is a new arrival at the current time
   1. if there are new arrivals, check if any have higher priority than our current process, if it does, change current process to the process with highest priority and enqueue our current process and the other processes that arrived at the same time.
   2. if there are no new arrivals, run decrease time subroutine
7. If we do not have an item we are processing, see if we can pop one from the queue
   1. If we can pop one from the queue, pop it and run decrease time subroutine
   2. if we cannot pop one from the queue, we are idle. Increment the current time and continue from step 6.

Decrease Time Subroutine:

1. Decrease process's remaining time by 1, increase current process running time by 1
2. If it has run for more than the time quantum and has remaining time, add it to the back of the queue
3. If it has remaining time but has not run for more than the time quantum, add it to the front of the queue.
4. Else, set process's completion time to the current time and do not add it to the queue, set current item being processed to nil
