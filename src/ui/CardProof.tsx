import type { Card } from '../game/types';
import { cardAssetUrl } from '../scene/cardTextures';

const SAMPLES: Card[] = [
  { id: 'proof-as', kind: 'regular', suit: 'spades', rank: 'A' },
  { id: 'proof-10h', kind: 'regular', suit: 'hearts', rank: '10' },
  { id: 'proof-jd', kind: 'regular', suit: 'diamonds', rank: 'J' },
  { id: 'proof-qc', kind: 'regular', suit: 'clubs', rank: 'Q' },
  { id: 'proof-ks', kind: 'regular', suit: 'spades', rank: 'K' },
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
