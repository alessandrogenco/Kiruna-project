TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 5 / 5 

- Total points committed vs done: 41 / 41

  committed:
    - story 9: 13 points
    - story 19: 5 points
    - story 10: 13 points
    - story 20: 5 points
    - story 14: 5 points

  done:
    - story 9: 13 points
    - story 19: 5 points
    - story 10: 13 points
    - story 20: 5 points
    - story 14: 5 points

- Nr of hours planned vs spent (as a team): 96h 00min / 95h 40min

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| 0      |   25    |    -   |     50h    |  49h 40min   |
| 9      |    9    |   13   |     15h    |     15h      |
| 19     |    4    |    5   |      5h    |      5h      |
| 10     |    8    |   13   |     13h    |  13h 10min   |
| 20     |    5    |    5   |      7h    |   6h 50min   |
| 14     |    3    |    5   |      6h    |       6h     |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)

- Hours per task average including Sprint Planning
    - Estimated: **1h 47m/task**
    - Actual: **1h 46m/task**
- Standard deviation including Sprint Planning
    - Estimate = **1,470911**
    - Actual = **1,473897**
- Hours per task average without Sprint Planning
    - Estimated: **1h 35m/task**
    - Actual: **1h 34m/task**
- Standard deviation without Sprint Planning
    - Estimate = **0,442291**
    - Actual = **0,449614**

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1

  $$\frac{\sum_i estimation_{task_i}}{\sum_i spent_{task_i}} - 1 =  \frac{5760 min}{5740 min} - 1 = 0,0035 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated : 3h 30min
  - Total hours spent : 3h 30min
  - Nr of automated unit test cases 34
  - Coverage (if available) : 98% for DAOs; 80% for API
- E2E testing:
  - Total hours estimated : 9h
  - Total hours spent : 8h 50min
- Code review 
  - Total hours estimated : 8h 30min
  - Total hours spent : 8h 30min
- Technical Debt management:
  - Strategy adopted
    - The strategy is written in TD_strategy.md
  - Total hours estimated estimated at sprint planning : 3h
  - Total hours spent : 3h
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

We made small errors due to overestimating or underestimating some tasks

- What lessons did you learn (both positive and negative) in this sprint?

We learned that it is better to finish all the critical tasks a few days before sprint ending and that it is often better to spend more time on writing good quality code, rather than fixing it.

- Which improvement goals set in the previous retrospective were you able to achieve? 

We finished almost all the tasks in advance, apart from a few ones and we were able to increase the coordination and the usage of common best practices in our team to write code.
  
- Which ones you were not able to achieve? Why?

None of them, we didn't finish all the tasks in advance, as we wanted but we finished almost all of them.
Although we increased the coordination among ourselves, we think we can still get better.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Finish the critical sprint tasks at least one day in advance to have more time to check things

  > Coordinate our codes to match the same practices and have a better quality of code

- One thing you are proud of as a Team!!

We work well together, we get along and respect each other.