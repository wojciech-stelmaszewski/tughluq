# Zombie Hunt — Product Plan

Living roadmap for the Tughluq simulation of *Zombie Hunt* (Alice in Borderland, Netflix).  
Phase 1 details live in [plan-2026-09-15_07-26.md](./plan-2026-09-15_07-26.md).

## Product intent

A **turn-based** browser simulation of the Netflix card game. First we make the opening deal trustworthy and beautiful. Then we add the actual game loop: pairing, one card per round, infection, Shotgun, Vaccine, elimination, and a 20-round majority verdict.

The app is a **simulator / laboratory**, not a multiplayer product. A human operator sets parameters, watches, and later will step turns.

## Working rules (Netflix)

Canonical extract: [rules.md](./rules.md) (Fandom *Zombie Hunt (Netflix)*, provided 2026-09-15).

- Venue: National Institute of Virus Research. **4 groups × 16 = 64**, **20 rounds**.
- Each player starts with **exactly 7 cards, specials included**. Shotgun is guaranteed and occupies a slot.
- **1 Zombie** per group. It trumps every card unless a Vaccine cancels it. The loser is infected and **receives a copy**; the attacker keeps theirs.
- **Vaccine** cards are random within the group. Playing one cancels a **placed** Zombie card and restores that player to human, then sums decide. **Cannot be used on oneself.**
- **Shotgun** may be used at any time, even if no Zombie is on the table. Eliminates a zombie. Against a human it is wasted (one-use, then gone).
- Mini-games are **one-on-one**. Each player **chooses a suit from their hand**; **highest sum** wins; winner **takes one card** from the loser.
- GAME CLEAR: larger faction at the end. GAME OVER: Shotgun-killed as a zombie, out of number cards, or on the smaller faction.

Phase 1 only materializes the **opening deal** for **one group**.

## Phased delivery

### Phase 1 — Deal (current)

- Parameters: `playerCount` (2–16), `vaccineCount` (0–players).
- Pure deal engine + sterile white-lab WebGL table (one wing).
- Omniscient face-up hands.
- `make dev` only.

See the dated plan and [tasks-2026-09-15_07-26.md](./tasks-2026-09-15_07-26.md).

### Phase 2 — Turn skeleton

- Round counter (1–20).
- Manual pairing of two players (click two seats).
- Announced suit for the duel.
- Step / undo one turn. Still no AI.

### Phase 3 — Duel resolution

- Each player chooses a suit from their hand; resolve the higher **sum**.
- Winner takes one card from the loser.
- Cards in one pile share a suit.

### Phase 4 — Specials

- Zombie: instant win + infect loser (add a Zombie card; mark faction).
- Shotgun: kill if target is zombie; waste if human; card consumed.
- Vaccine: cure opponent zombie; illegal on self.
- Hidden information toggle: “player view” vs “dealer view”.

### Phase 5 — End conditions

- Eliminate on zero regular cards or Shotgun-kill.
- After 20 rounds, compare living humans vs living zombies.
- Clear / over presentation (restraint: no gore required).

### Phase 6 — Watch panel (RL observation)

- Second page at `/watch`: 2D admin table for all **64** players (4×16).
- 20-round match, one click each, random legal policy, round report.
- No in-app link to the 3D lab.
- Dated plans: [plan-2026-09-15_10-38.md](./plan-2026-09-15_10-38.md), [plan-2026-09-15_11-02.md](./plan-2026-09-15_11-02.md), [plan-2026-09-16_06-02.md](./plan-2026-09-16_06-02.md), [plan-2026-09-16_06-06.md](./plan-2026-09-16_06-06.md), [plan-2026-09-16_06-39.md](./plan-2026-09-16_06-39.md), [plan-2026-09-16_06-44.md](./plan-2026-09-16_06-44.md).

### Phase 7 — Automation / trainer

- Stage A done: policy seam, rules tests, headless runner, handwritten baselines.
- Stage B done: linear scorer + evolution strategy. Log:
  [train-log.md](./train-log.md).
- Stage B result on a real budget (60 × 24 × 50): the linear scorer **ties** `aggressive`
  (+0.003, CI [−0.020, 0.026]) and beats `randomLegal` by +0.265. Thirty weights cannot express
  more than “play Zombie”, so the plateau is the model, not the budget.
- MLP done, both cold and warm start: it ties the same plateau. Capacity is not what caps the
  policy, so PPO would be solving the wrong problem.
- **Phase 7 closed 2026-09-18.** Under private infection the game has a simple optimum and the
  search found it. The learned policy and the `aggressive` heuristic are the same strategy
  reached from opposite directions. Write-up: [rl-explained.md](./rl-explained.md).
- Not planned, in order of interest if this is ever reopened: the information ablation
  (opponent faction in the view, retrain linear), loading trained weights into `/watch`, PPO.
- Do not start the trainer from `/watch`.
- Reward is **individual** (clear = larger side at the end) but the game is general-sum and
  many-player, so training is **self-play**, never one agent against fixed random bots.
- Staged: (A) policy interface + rules tests + baselines, (B) evolution strategy, (C) PPO.
- Player view: own hand and own faction, opponent hand size, living count. Not opponent faction,
  not zombie share. `/watch` stays omniscient.
- Dated plan: [plan-2026-09-16_17-49.md](./plan-2026-09-16_17-49.md),
  [tasks-2026-09-16_17-49.md](./tasks-2026-09-16_17-49.md),
  [plan-2026-09-17_17-58.md](./plan-2026-09-17_17-58.md),
  [tasks-2026-09-17_17-58.md](./tasks-2026-09-17_17-58.md).

## Improvements log

Record post-Phase-1 upgrades here as they are agreed. Do not implement speculative items.

| Date | Item | Status |
| --- | --- | --- |
| 2026-09-15 | Phase 1 deal + WebGL table | done |
| 2026-09-15 | Rules locked to Fandom page; lab visual (not dark neon) | done |
| 2026-09-15 | Rounded card corners; one table per player; rebuilt wing lighting | done |
| 2026-09-15 | Pair tables, click-to-focus camera, dressed virology wing | done |
| 2026-09-15 | `/watch` 2D RL observation panel (64 players, no trainer) | done |
| 2026-09-15 | `/watch` 20-round random-legal match + round report | done |
| 2026-09-16 | Own-suit sums; opening hand is 7 cards including specials | done |
| 2026-09-16 | Facility-wide pairing; Z copy; vaccine only on played Z; suit subsets | done |
| 2026-09-16 | No J/Q/K; Ace counts as 1 | done |
| 2026-09-16 | Round report: pre-play hands, round bar, Markdown export | done |
| 2026-09-16 | Redrawn `BACK.svg` (lace pattern, bovine skull medallions) | done |
| 2026-09-16 | RL stage A: policy seam, rules tests, baselines | done |
| 2026-09-16 | Infection private for the playing policy; watch stays dealer view | done |
| 2026-09-17 | RL stage B: linear scorer + evolution strategy | done |
| 2026-09-17 | Probe episodes split from the search budget; per-generation progress log | done |
| 2026-09-17 | Real training budget: linear ES ties `aggressive`, plateau earned | done |
| 2026-09-18 | MLP scorer + model dispatch in the trainer and weight files | done |
| 2026-09-18 | MLP cold start does not train; warm start from linear weights next | done |
| 2026-09-18 | Warm-started MLP ties the linear plateau; capacity is not the constraint | done |

## Non-goals (until explicitly requested)

- Multiplayer / networking
- Accounts, persistence, leaderboards
- Faithful scanned Netflix prop art
- Full character models or facility walkthrough
- Docker / CI (Makefile + Vite is enough until it is not)
- Sound design, voice, subtitles
- Mobile-first layout (desktop browser first)
