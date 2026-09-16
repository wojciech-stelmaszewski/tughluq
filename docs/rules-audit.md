# Zombie Hunt — bilingual rules audit

Date: 2026-09-16. Recaps only. Fandom wiki HTML is blocked (HTTP 403). No official Netflix rule sheet.

## Sources

| Source | Language | Weight |
| --- | --- | --- |
| Viewer-quoted on-screen block on [くらげ / note](https://note.com/wakuraba_mt/n/nd805a707b4d0) (`るうる`) | JA | Highest — closest to the announcement |
| Rule list on [雪だるま / note](https://note.com/apple2120/n/n682a9e98690a) | JA | High — same wording, extra special-card notes |
| Fandom *Zombie Hunt (Netflix)* (user paste + search snippets) | EN | High for specials and occupancy |
| [TheDirect](https://thedirect.com/article/alice-in-borderland-season-3-zombie-game-rules-card-hunt), [Film Fugitives](https://fugitives.com/alice-in-borderlands-season-3-zombie-hunt-game-2025/), Reddit | EN | Medium — paraphrase Fandom |
| [VG+](https://virtualgorillaplus.com/drama/alice-in-borderland-s3-games/), [ネオうさ](https://neo.usachannel.info/?p=24685) | JA | Medium recaps |
| [nostalgicdorama](https://nostalgicdorama.com/imawanokuninoarisu-zombiehuntin-rule) | JA | Low — contradicts vaccine and the 7-card split |

## Confirmed

| Rule | Evidence |
| --- | --- |
| 20 turns / rounds | All sources |
| 1v1 at facility tables | All sources |
| Choose opponent, then **touch** to lock the pair | JA: `対戦相手を選んでください` → `タッチすると確定` |
| Play number cards of the **same mark / suit** and compare the **sum of printed numbers** | JA: `マークの同じカードを出し` / `同じ記号を出し合う` / `数字を足した数` |
| Winner takes **one card** | JA split: table pile (`場に出したカードを1枚`) vs loser hand (`カードを一枚譲渡`). Fandom: “one card from the losing player”. |
| GAME OVER if a player has **no number cards** | JA 雪だるま + くらげ + Fandom |
| End: larger faction (humans vs zombies) GAME CLEAR; smaller GAME OVER | All sources |
| 1 starting Zombie per group | All sources except occupancy nit |
| Shotgun: 1 per player, one-use, works even if the zombie did **not** play Z this duel, wasted on a human | JA くらげ + 雪だるま + Fandom |
| Vaccine: cannot be used on self; cancels a **Zombie card placed on the table** | JA 雪だるま + くらげ. Fandom is vaguer (“when placed, cancels the Zombie card”). |
| Playing Z: instant win; opponent becomes a zombie and **receives a Zombie card** | JA + Fandom |
| Vaccines: random, count unknown, scarce | All sources |

## Conflicts

| Topic | Reading A | Reading B | Engine today |
| --- | --- | --- | --- |
| Occupancy | 64 = 4 × 16 (Fandom, most JA) | くらげ wrote “shotgun for all 40” | 64 |
| Are specials extra? | 7 number cards **plus** specials (雪だるま: `数字カード以外`; VG+: `7枚と共に`) | nostalgicdorama: mixed **inside** the 7 | **Locked 2026-09-16: inside the 7** |
| What the winner takes | One card **from the loser’s table pile** (雪だるま) | One card from the loser (unspecified) | Table pile |
| Vaccine vs already-infected | Only if they **played Z this duel** (JA) | Fandom can be read as “cure that zombie” | **JA reading: cancel a played Z, then compare sums** |
| Once a zombie, human again? | Vaccine exists (canon) | nostalgicdorama: never human again | Vaccine can cure |

## Never stated on screen (do not treat as canon)

- Ace / face values: **locked 2026-09-16 — no J/Q/K, Ace = 1.**
- Must dump **every** card of the chosen suit, or a subset.
- Shared table suit vs own suit: recaps lean shared. **Locked 2026-09-16 by operator: each player chooses their own suit; compare sums.**
- Must dump every card of the chosen suit: unstated. Engine: any non-empty subset.
- Ties.
- Odd player left without a pair (bye).
- Shotgun and Vaccine on the same table; Shotgun vs played Z (does infection still happen?). くらげ lists these as holes; one of them is later shown, not quoted.
- Vaccine consumed on a miss.
- Exact vaccine count.
- Whether the original Zombie card is **spent** or copied (JA: opponent *also* receives a copy after the match).

## Engine vs recaps (after 2026-09-16_06-06)

1. **Own suit per player** — locked by operator (recaps still lean shared).
2. **Pairing** — any two living players (random stand-in for choose-and-touch).
3. **Vaccine** — cancels a Zombie card played this duel, then sums decide. Miss is spent.
4. **Zombie card** — attacker keeps it; loser gets a copy if they have none.
5. **Number pile** — non-empty subset of one chosen suit.
6. **Ranks** — locked by operator: pip cards only, Ace = 1.
