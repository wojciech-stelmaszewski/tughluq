# Tughluq — Zombie Hunt

Browser simulation of *Zombie Hunt* (Alice in Borderland, Netflix). Phase 1 deals opening hands for one group and shows them on a 3D wing of the National Institute of Virus Research.

## Prerequisite

Node.js 20 or newer.

## Run locally

```bash
make dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). If that port is taken, Vite prints another address (often `5174`).

Other targets: `make build`, `make preview`, `make clean`.

## Deal parameters

- **Players:** 2–16 (one group / one wing)
- **Vaccines:** 0–player count
- **Seed:** optional; leave empty for a random deal

Each player receives seven number cards and one Shotgun. One Zombie card is assigned in the group. Vaccines go to distinct random players.

## Scene

- Players sit in pairs, facing each other, at scattered lab tables.
- Click a table to orbit around it. Click the central podium to return to the hall view.
- Drag to orbit, scroll to zoom.

## Docs

| File | Contents |
| --- | --- |
| [`docs/rules.md`](docs/rules.md) | Working rules from the Fandom page |
| [`docs/plan.md`](docs/plan.md) | Product roadmap |
| [`docs/ATTRIBUTION.md`](docs/ATTRIBUTION.md) | Card art credits |

Regular faces are Byron Knoll's public-domain vector cards. Specials (Zombie, Shotgun, Vaccine) were drawn for this project. See the attribution file.
