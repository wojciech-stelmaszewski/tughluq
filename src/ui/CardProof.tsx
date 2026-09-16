import type { Card } from '../game/types';
import { cardAssetUrl } from '../scene/cardTextures';

const SAMPLES: Card[] = [
  { id: 'proof-as', kind: 'regular', suit: 'spades', rank: 'A' },
  { id: 'proof-2h', kind: 'regular', suit: 'hearts', rank: '2' },
  { id: 'proof-7d', kind: 'regular', suit: 'diamonds', rank: '7' },
  { id: 'proof-10c', kind: 'regular', suit: 'clubs', rank: '10' },
  { id: 'proof-z', kind: 'zombie' },
  { id: 'proof-s', kind: 'shotgun' },
  { id: 'proof-v', kind: 'vaccine' },
];

export function CardProof() {
  return (
    <div className="card-proof">
      <p className="hud-kicker">Deck faces</p>
      <ul>
        {SAMPLES.map((card) => (
          <li key={card.id}>
            <img
              src={cardAssetUrl(card)}
              alt={card.kind === 'regular' ? `${card.rank} of ${card.suit}` : card.kind}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
