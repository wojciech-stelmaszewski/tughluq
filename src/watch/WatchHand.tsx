import { cardAssetUrl, cardLabel } from '../game/cardArt';
import type { Card } from '../game/types';

type WatchHandProps = {
  cards: Card[];
  size: 'thumb' | 'inspect';
};

export function WatchHand({ cards, size }: WatchHandProps) {
  return (
    <ul className={`watch-hand watch-hand-${size}`}>
      {cards.map((card) => (
        <li key={card.id}>
          <img src={cardAssetUrl(card)} alt={cardLabel(card)} title={cardLabel(card)} />
        </li>
      ))}
    </ul>
  );
}
