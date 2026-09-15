import type { Deal, PlayerHand } from '../game/types';
import { CardProof } from './CardProof';

type DealLegendProps = {
  deal: Deal;
  zombieHolder: PlayerHand | undefined;
  vaccineHolders: PlayerHand[];
};

export function DealLegend({ deal, zombieHolder, vaccineHolders }: DealLegendProps) {
  return (
    <aside className="hud-panel hud-legend">
      <p className="hud-kicker">Dealer view</p>
      <dl>
        <div>
          <dt>Players</dt>
          <dd>{deal.params.playerCount}</dd>
        </div>
        <div>
          <dt>Zombie</dt>
          <dd className="zombie">{zombieHolder?.displayName ?? '—'}</dd>
        </div>
        <div>
          <dt>Vaccines</dt>
          <dd className="vaccine">
            {vaccineHolders.length
              ? vaccineHolders.map((player) => player.displayName).join(', ')
              : 'None'}
          </dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd>{deal.seed}</dd>
        </div>
      </dl>
      <CardProof />
      <ul className="swatches">
        <li>
          <i className="regular" /> Number card
        </li>
        <li>
          <i className="shotgun" /> Shotgun
        </li>
        <li>
          <i className="zombie" /> Zombie
        </li>
        <li>
          <i className="vaccine" /> Vaccine
        </li>
      </ul>
    </aside>
  );
}
