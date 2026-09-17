# Baseline table — RL stage A (2026-09-16)

Reference point for stage B. Seed `1`, 50 episodes, 64 seats, 20-round matches.
Player view is private (no opponent faction, no zombie share). Vaccine is always
legal and can miss. Pairing is random.

## Absolute (all 64 seats run the same policy)

| Policy | Clear rate | Mean survival |
| --- | --- | --- |
| `randomLegal` | 0.682 | 0.684 |
| `aggressive` | 0.770 | 0.770 |
| `conservative` | 0.938 | 1.000 |

`conservative` never spends specials and always plays the smallest pile. When
every seat does that, infection barely spreads, nobody is shotgunned, and the
human majority clears. That is a coordination artefact, not a skilled strategy.

## Differential (8 candidate seats vs 56 `randomLegal` in the same match)

Fitness = candidate clear rate − reference clear rate. 95% CI from the
per-match differences.

| Candidate | Candidate clear | Reference clear | Diff | 95% CI |
| --- | --- | --- | --- | --- |
| `aggressive` | 0.897 | 0.640 | +0.257 | [0.218, 0.296] |
| `conservative` | 0.072 | 0.738 | −0.666 | [−0.703, −0.629] |
| `randomLegal` | 0.708 | 0.679 | +0.029 | [−0.022, 0.079] |

`aggressive` (play Zombie whenever held) lands on the winning side more often
than uniform legal play. `conservative` stays human while the random table
infects; zombies then win and the conservative seats get 0. Same-policy
`randomLegal` vs itself is consistent with zero.

`hoarder` was not implemented: with this engine a player always has a legal
number pile, so “never spend a special unless forced” is `conservative`.

Replay:

```bash
npm run simulate -- --seed 1 --episodes 50 --policy aggressive --reference randomLegal
```
