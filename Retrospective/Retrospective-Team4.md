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
 
- Total points committed vs. done: 11 / 11
  
  committed:
  - story 1: 3 points
  - story 2: 4 points
  - story 3: 4 points

  done:
  - story 1: 3 points
  - story 2: 4 points
  - story 3: 4 points

- Nr of hours planned vs. spent (as a team): 96h 00min / 96h 10min

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points |      Hours est.     |       Hours actual     |
|--------|---------|--------|---------------------|------------------------|
| 0      |    23   |    -   |      37h 55min      |        38h 00min       |
| 1      |    12   |    3   |      18h 15min      |        18h 45min       |
| 2      |    13   |    4   |      21h 45min      |        21h 45min       |
| 3      |    13   |    4   |      18h 05min      |        17h 40min       |
   
> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual) = 
    - Estimated: **94 min/task**
    - Actual: **95 min/task**

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{5770 min}{5760 min} -1 = 0,00174 $$ 
  
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{0,0769 + 0,333 + 0,125 + 0,066 + 0,2}{61} = 0,0865
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated : 20h 00m
  - Total hours spent : 20h 15m
  - Nr of automated unit test cases : 86
  - Coverage (if available) : 98% for DAOs; 89,4% for API
- E2E testing:
  - Total hours estimated : 8h
  - Total hours spent : 8h
- Code review 
  - Total hours estimated : 4h
  - Total hours spent: 4h

## ASSESSMENT

- What caused your errors in estimation (if any)?

They were caused by the fact that some user stories had details we couldn't see at first glance.
In this sprint we tried to do estimations as accurately as possible.

- What lessons did you learn (both positive and negative) in this sprint?

// TO DO
We understood that coordination is fundamental, in particular on crucial tasks for the project.
We'll coordinate a lot more from now on.
We also have understood the strong points of each of us so now we know how to organize and work more efficiently than before, always being calm and patient one to each other.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
We achieved to do better time scheduling for the sprint, since our estimations were more accurate then in the first sprint.
We also coordinated more and were more organized on tasks, but we still have to improve ourselves.

- Which ones you were not able to achieve? Why?

We weren't able to complete achieve the kind of improvements we wanted, so we chose to keep some goals the same, to keep improving on them.
We became a lot more organized, but in some cases we didn't organize tasks perfectly among all the team mates, so we still want to improve at it.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > More communication about crucial tasks

  > Coordination among the teammates

  > More organized task assignment

- One thing you are proud of as a Team!!

We work well together, we get along and respect each other.