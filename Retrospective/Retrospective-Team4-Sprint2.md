TEMPLATE FOR RETROSPECTIVE (Team 4)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 5 / 5
 
- Total points committed vs. done: 30 / 30
  
  committed:
  - story 4: 10 points
  - story 5: 8 points
  - story 6: 2 points
  - story 7: 5 points
  - story 8: 5 points

  done:
  - story 4: 10 points
  - story 5: 8 points
  - story 6: 2 points
  - story 7: 5 points
  - story 8: 5 points

- Nr of hours planned vs. spent (as a team): 96h 00min / 95h 45min

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points |      Hours est.     |       Hours actual     |
|--------|---------|--------|---------------------|------------------------|
| 0      |    15   |    -   |      38h 30min      |        38h 45min       |
| 4      |    10   |    10   |      19h 30min      |        19h 15min      |
| 5      |    4   |    8   |      5h     |        5h       |
| 6      |    5   |    2   |      7h   |        7h       |
| 7      |    13   |    5   |      20h      |        19h 45min      |
| 8      |    5   |    5   |      6h      |        6h      |

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual) = 
    - Estimated: **111 min/task**
    - Actual: **110 min/task**

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 =  \frac{5745 min}{5760 min} - 1 = -0,0026 $$ 
  
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{0,08 + 0,04 + 0,08 + 0,04 + 0,11 + 0,08 }{52} = 0,0082 $$ 
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated : 3h 
  - Total hours spent : 3h 
  - Nr of automated unit test cases : 12
  - Coverage (if available) : 100% for DAOs; 87,04% for API
- E2E testing:
  - Total hours estimated : 5h 30m
  - Total hours spent : 5h 25m
- Code review 
  - Total hours estimated : 6h 30m
  - Total hours spent: 6h 30m

## ASSESSMENT

- What caused your errors in estimation (if any)?

In this sprint there weren't really big problems with estimation since we paid a lot of attention on how to estimate with a good accuracy.
We have seen that a higher amount of tasks could increase the probability of having worse errors.

- What lessons did you learn (both positive and negative) in this sprint?

In this sprint we have understood more deeply the role of the stakeholders and considered much more their opinions and needs.
We also have understood that it's a good idea to give people assignments they feel confident with, in fact we achieved a good result.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
We have actually achieved more or less all the goals, that were more communication about crucial tasks, coordination among the teammates and more organized task assignment

- Which ones you were not able to achieve? Why?

None of them, maybe we didn't achieve the best coordination but we really improved it.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Finish the sprint tasks one day in advance to check things

  > Coordinate our codes to match the same practices and have a better quality of code

- One thing you are proud of as a Team!!

We work well together, we get along and respect each other.