# Linear ES train log

seed 1 · generations 8 · population 8 · episodes 5 · dim 30

Reference column is the league used **this** generation (logged before promotion).

| Gen | vs reference | vs randomLegal | vs aggressive | zombie share | reference |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.082 | 0.277 | -0.504 | 0.500 | randomLegal |
| 2 | 0.339 | 0.344 | -0.295 | 1.000 | randomLegal |
| 3 | 0.039 | 0.286 | -0.353 | 1.000 | elite@2 |
| 4 | 0.129 | 0.161 | -0.094 | 0.500 | elite@2 |
| 5 | 0.107 | 0.219 | 0.040 | 0.750 | elite@4 |
| 6 | 0.143 | 0.362 | -0.049 | 1.000 | elite@4 |
| 7 | 0.089 | 0.330 | -0.129 | 0.750 | elite@6 |
| 8 | 0.011 | 0.353 | -0.094 | 0.750 | elite@6 |

Wrote `docs/weights-latest.json`.

## Held-out (seed 1, 50 episodes, 8 vs 56)

| Candidate | vs | Diff | 95% CI |
| --- | --- | --- | --- |
| linear ES | `randomLegal` | +0.271 | [0.240, 0.303] |
| `aggressive` (Stage A) | `randomLegal` | +0.257 | [0.218, 0.296] |
| linear ES | `aggressive` | −0.070 | [−0.115, −0.025] |

Point estimate vs `randomLegal` clears the Stage A bar (+0.257). Confidence intervals
overlap `aggressive`, and the elite still loses as a minority on an aggressive table.
Linear ES found the “play Zombie” neighbourhood; it did not dominate `aggressive`.
