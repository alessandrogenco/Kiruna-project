TEMPLATE FOR RETROSPECTIVE 4 (Team #4)
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
| 0      |   36    |    -   |    69h30m  |      69h30m  |
| 11     |   6     |   8    |    10h     |      10h     |
| 17     |   5     |   5    |    8h      |      8h      |
| 12     |   6     |   5    |    8h30m   |      8h25m   |


> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation | 1h49m| 88.80 | 
| Actual     | 1h48m| 88.84 |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
     $$\frac{5770}{5880} - 1 = −0,000868056$$ 
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0,000471698$$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated 2h
  - Total hours spent 2h
  - Nr of automated unit test cases 68
  - Coverage 91.61
- E2E testing:
  - Total hours estimated 6h
  - Total hours spent 6h
- Code review 
  - Total hours estimated 6h30m
  - Total hours spent 6h30m
- Technical Debt management:
  - The strategy is written in TD_strategy.md
  - Total hours estimated estimated 4h
  - Total hours spent 4h
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

We overstimated the time of some tasks to avoid to leave them uncompleted, since this was the last sprint and we wanted to complete all the work.

- What lessons did you learn (both positive and negative) in this sprint?

We have learned to help each other in tasks we cannot do in the best way and it helped to achieve better results.

- Which improvement goals set in the previous retrospective were you able to achieve? 

We kept the techincal debt always under control and increased the quality of the code, and we used some practices to standardize the code more than before.
  
- Which ones you were not able to achieve? Why?

We did not finish some critical tasks one day in advance because we needed some more time to complete them, since we faced unexpected difficulties.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

This is the last sprint. but if we had to set goals for a new one we would like to
 - Learn to trust the others and the fact that they will work well but still checking their work
 - Learn to ask for help in difficult situations, when we cannot find out how to do something

> Propose one or two

- One thing you are proud of as a Team!!

We grew up a lot together as individuals and as a team and we have learned to be patient and precise.