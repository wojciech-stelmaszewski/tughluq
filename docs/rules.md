# Zombie Hunt (Netflix) — Working Rules

Canonical extract for this project, taken from the Fandom page *Zombie Hunt (Netflix)* as provided by the user on 2026-09-15.

Live-action debut: Season 3, Episodes 2–3. No manga prototype.

## Venue

- **Name:** National Institute of Virus Research
- **Look:** sterile white research lab; four wings; designated mini-game tables (white table, archway, central elimination device — a small metallic dome / bullet emitter)
- **Canon occupancy:** 64 players, **four teams of 16**
- **Duration:** 20 rounds

## Opening deal

Locked 2026-09-16: each player is dealt **exactly 7 cards, specials included**.

| Card | How it is dealt |
| --- | --- |
| Number / suit cards | Fill the remaining slots after specials. Typical human: **6** numbers + Shotgun. |
| Shotgun | **1 per player**, occupies one of the seven slots. |
| Zombie | **1 per group**, occupies one slot of that player (5 numbers + Shotgun + Zombie). |
| Vaccine | Random distinct players. Occupies one slot. Count is a deal parameter. |

A player may hold Shotgun + Zombie + Vaccine (4 numbers). Infection later may **add** a Zombie card, so a hand can grow past 7 after the opening deal.

Vaccine cannot later be used on oneself.

## Mini-game

Locked 2026-09-16: each player **chooses one suit from their own hand** and places those number cards. Compare **sums**. The two piles do **not** have to be the same suit.

See [rules-audit.md](./rules-audit.md) for items still open.

- Pairing is **one-on-one**. Choose any living opponent (the watch loop picks at random across the facility). One bye if the living count is odd.
- A player may place **any non-empty subset** of one suit. Compare sums.
- Winner takes **one card** the loser placed on the table.
- Locked 2026-09-16: **no J / Q / K**. Ace = **1**. A tie steals nothing.
- Specials may be placed with the pile or alone. An uncancelled Zombie still trumps the total.

## Special cards (later phases)

**Zombie** — trumps every other card unless a Vaccine cancels it. The loser becomes infected and **receives a copy** of the Zombie card. The attacker **keeps** theirs.

**Shotgun** — may be used **at any time**, whether or not a Zombie card is on the table. Eliminates a zombie (stops multiplication). Ineffective against humans. **One-use**, then gone.

**Vaccine** — cancels a **Zombie card placed this duel** and turns that player back into a human. Then the number sums decide the table. If no Zombie was placed, the Vaccine is spent and does nothing. **Cannot be used on oneself.**

## End conditions (later phases)

| Result | When |
| --- | --- |
| GAME CLEAR | Player is on the **larger** side at the end (zombies vs humans). |
| GAME OVER | Zombie **eliminated by Shotgun**. |
| GAME OVER | Player **runs out of number cards**. |
| GAME OVER | Player is on the **smaller** side at the end. |

Canon solution (narrative, not encoded in Phase 1): convert everyone to zombies. Vaccines are scarce and one-use; shotgun kills require the willingness to take a life.

## Scope note

The 3D lab only **deals** one group. `/watch` runs the 20-round match with a random legal policy.
