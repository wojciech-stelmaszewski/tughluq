import { MAX_PLAYERS, MIN_PLAYERS } from '../game/types';

type DealControlsProps = {
  playerCount: number;
  vaccineCount: number;
  seedText: string;
  animating: boolean;
  error: string | null;
  onPlayerCount: (value: number) => void;
  onVaccineCount: (value: number) => void;
  onSeedText: (value: string) => void;
  onDeal: () => void;
  onRedeal: () => void;
};

export function DealControls({
  playerCount,
  vaccineCount,
  seedText,
  animating,
  error,
  onPlayerCount,
  onVaccineCount,
  onSeedText,
  onDeal,
  onRedeal,
}: DealControlsProps) {
  return (
    <aside className="hud-panel hud-controls">
      <p className="hud-kicker">National Institute of Virus Research</p>
      <h1>Zombie Hunt</h1>
      <p className="hud-sub">Opening deal · one wing</p>

      <label className="hud-field">
        <span>Players</span>
        <input
          type="number"
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          value={playerCount}
          onChange={(event) => onPlayerCount(Number(event.target.value))}
        />
      </label>

      <label className="hud-field">
        <span>Vaccines</span>
        <input
          type="number"
          min={0}
          max={playerCount}
          value={vaccineCount}
          onChange={(event) => onVaccineCount(Number(event.target.value))}
        />
      </label>

      <label className="hud-field">
        <span>Seed</span>
        <input
          type="text"
          inputMode="numeric"
          value={seedText}
          onChange={(event) => onSeedText(event.target.value)}
        />
      </label>

      <div className="hud-actions">
        <button type="button" className="primary" disabled={animating} onClick={onDeal}>
          Deal
        </button>
        <button type="button" disabled={animating} onClick={onRedeal}>
          Redeal
        </button>
      </div>
      {animating ? <p className="hud-status">Dealing…</p> : null}
      {error ? <p className="hud-error">{error}</p> : null}
    </aside>
  );
}
