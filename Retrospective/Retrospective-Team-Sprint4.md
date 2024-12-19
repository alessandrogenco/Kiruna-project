TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done 
- Total points committed vs done 
- Nr of hours planned vs spent (as a team)

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

  committed:
  - story 11: 8 points
  - story 17: 5 points
  - story 12: 5 points 

  done:
  - story 11: 8 points
  - story 17: 5 points
  - story 12: 5 points

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| 0      |   36    |    -   |     71h5m  |      69h45m  |
| 11     |   6     |   8    |     10h    |      10h     |
| 17     |   5     |   5    |    8h30m   |      8h25m   |
| 12     |   6     |   5    |     8h     |      8h      |


> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation | 1h50m|       | 
| Actual     | 1h49m|       |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
     $$\frac{5770}{5880} - 1 = −0,018707483$$ 
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated 2h
  - Total hours spent 2h
  - Nr of automated unit test cases 68
  - Coverage 91.61
- E2E testing:
  - Total hours estimated 6h
  - Total hours spent 6h
  - Nr of test cases -
- Code review 
  - Total hours estimated 6h30m
  - Total hours spent 6h30m
- Technical Debt management:
  - The strategy is written in TD_strategy.md
  - Total hours estimated estimated 4h
  - Total hours spent 4h
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

We overstimated the time of some tasks to avoid to leave them uncompleted.

- What lessons did you learn (both positive and negative) in this sprint?

We have learned to help each other in tasks we cannot do in the best way.

- Which improvement goals set in the previous retrospective were you able to achieve? 

We kept the techincal debt always under control and increased the quality of the code.
  
- Which ones you were not able to achieve? Why?

We did not finish some critical tasks one day in advance because we needed some more time to complete them.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

This is the last sprint. but if we had to set goals for a new one we would like to
 - Learn to trust the others and the fact that they will work well
 - Learn to ask for help in difficult situation, when we cannot find out how to do something

> Propose one or two

- One thing you are proud of as a Team!!

We grew up a lot together as individuals and as a team and we have learned to be patient and precise.