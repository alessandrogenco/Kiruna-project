TEMPLATE FOR RETROSPECTIVE (Team 4)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 3 / 3
 
- Total points committed vs. done: 14 / 14
  
  committed:
  - story 1: 5 points
  - story 2: 6 points
  - story 3: 3 points

  done:
  - story 1: 5 points
  - story 2: 6 points
  - story 3: 3 points

- Nr of hours planned vs. spent (as a team): 90h 05min / 87h 42min

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|--------|--------|------------|--------------|
| 0   |     10    |   -    |      22h 40min      |        22h 40min       |
| 1    |     15    |    5    |       21h 45min     |      21h 52min         |
| 2    |     10    |    6   |      12h 00min      |      11h 20min        |
| 3    |    11     |    3    |     17h 20min       |        16h 25min      |
|    |         |        |            |              |
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual) = 

    - Estimated: **96 min/task**
    - Actual: **94 min/task**
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{4324 min}{4416 min} -1 = -0,02 $$ 

    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{[(0,125 + 0,5) + (0,08 + 0,375 + 0,25 + 0,125 + 0,125 + 0,17 + 0,05 + 0,11 + 0,25) + (0,08 + 0,11 + 0,5 + 0,33) + (0,25 + 0,11 + 0,33 + 0,11)]}{10+15+10+11} = \frac{3,98}{46} = 0,0865
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated : 8h45m
  - Total hours spent  : 8h35m
  - Nr of automated unit test cases : 31 in the first 3 stories 
  - Coverage (if available) : 100% in the first 3 stories for the dao, 93% in the first 3 stories for the api
- E2E testing:
  - Total hours estimated : 5h30m
  - Total hours spent : 5h
- Code review 
  - Total hours estimated : 4h20m
  - Total hours spent: 3h20m
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

They were caused by the fact that it was our first experience in estimating.
Our idea was to estimate a higher amount of hours that would let us be safe and not have problems.

- What lessons did you learn (both positive and negative) in this sprint?

We understood that working in such a big team is difficult since according 7 people is challenging.
We learnt that coordinating on related tasks is very important and we'll do it from now on.
We also have understood the strong points of each of us so now we know how to organize and work more efficiently than before, always being calm and patient one to each other.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
This is the first retrospective, so we had no goal.

- Which ones you were not able to achieve? Why?

This is the first retrospective, so we had no goal.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Better time scheduling during the sprint

  > Coordination among the teammates

  > More organized task assignment

- One thing you are proud of as a Team!!

We work well together, we get along and respect each other.