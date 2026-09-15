# Zombie Hunt — Product Plan

Living roadmap for the Tughluq simulation of *Zombie Hunt* (Alice in Borderland, Netflix).  
Phase 1 details live in [plan-2026-09-15_07-26.md](./plan-2026-09-15_07-26.md).

## Product intent

A **turn-based** browser simulation of the Netflix card game. First we make the opening deal trustworthy and beautiful. Then we add the actual game loop: pairing, one card per round, infection, Shotgun, Vaccine, elimination, and a 20-round majority verdict.

The app is a **simulator / laboratory**, not a multiplayer product. A human operator sets parameters, watches, and later will step turns.

## Working rules (Netflix)

Canonical extract: [rules.md](./rules.md) (Fandom *Zombie Hunt (Netflix)*, provided 2026-09-15).

- Venue: National Institute of Virus Research. **4 groups × 16 = 64**, **20 rounds**.
- Each player starts with **7 number cards**. **1 Shotgun** is guaranteed per player (treated as an extra special card in Phase 1).
- **1 Zombie** per group. It trumps every card. The loser is infected and **receives a new Zombie card**.
- **Vaccine** cards are random within the group. Playing one cancels a Zombie and restores that opponent to human. **Cannot be used on oneself.**
- **Shotgun** may be used at any time, even if no Zombie is on the table. Eliminates a zombie. Against a human it is wasted (one-use, then gone).
- Mini-games are **one-on-one**. Follow the **dealt suit**; **highest cumulative total** wins; winner **takes one card** from the loser.
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

- Follow the dealt suit; resolve **highest cumulative total** (confirm whether that is one card or a sum).
- Winner takes one card from the loser.
- Legal-play checks (must follow suit if able).

### Phase 4 — Specials

- Zombie: instant win + infect loser (add a Zombie card; mark faction).
- Shotgun: kill if target is zombie; waste if human; card consumed.
- Vaccine: cure opponent zombie; illegal on self.
- Hidden information toggle: “player view” vs “dealer view”.

### Phase 5 — End conditions

- Eliminate on zero regular cards or Shotgun-kill.
- After 20 rounds, compare living humans vs living zombies.
- Clear / over presentation (restraint: no gore required).

### Phase 6 — Automation (only if still needed)

- Simple pairing heuristic.
- Scripted or greedy card choice so a full 20-round match can run unattended.
- Optional: four groups, 64 seats, inter-group infection (canon tournament). Do **not** start here.

## Improvements log

Record post-Phase-1 upgrades here as they are agreed. Do not implement speculative items.

| Date | Item | Status |
| --- | --- | --- |
| 2026-09-15 | Phase 1 deal + WebGL table | done |
| 2026-09-15 | Rules locked to Fandom page; lab visual (not dark neon) | done |
| 2026-09-15 | Rounded card corners; one table per player; rebuilt wing lighting | done |
| 2026-09-15 | Pair tables, click-to-focus camera, dressed virology wing | done |

## Non-goals (until explicitly requested)

- Multiplayer / networking
- Accounts, persistence, leaderboards
- Faithful scanned Netflix prop art
- Full character models or facility walkthrough
- Docker / CI (Makefile + Vite is enough until it is not)
- Sound design, voice, subtitles
- Mobile-first layout (desktop browser first)
