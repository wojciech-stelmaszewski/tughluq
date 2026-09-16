import { useEffect, useMemo, useState } from 'react';
import { ROUND_LIMIT } from '../game/types';
import { WatchHand } from './WatchHand';
import { WatchReport } from './WatchReport';
import { useMatch } from './useMatch';
import type { WatchPlayerRow } from './snapshot';

function flagCell(on: boolean, label: string, className: string) {
  return on ? <span className={className}>{label}</span> : <span className="watch-flag-off">·</span>;
}

function PlayerRow({
  player,
  selected,
  onSelect,
}: {
  player: WatchPlayerRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr className={selected ? 'watch-row-selected' : undefined} onClick={onSelect}>
      <td className="watch-mono">{player.displayName}</td>
      <td className="watch-mono">G{player.group}</td>
      <td className={`watch-faction watch-faction-${player.faction}`}>{player.faction}</td>
      <td>
        <WatchHand cards={player.cards} size="thumb" />
      </td>
      <td className="watch-flags">
        {flagCell(player.hasZombie, 'Z', 'watch-flag watch-flag-zombie')}
        {flagCell(player.hasShotgun, 'S', 'watch-flag watch-flag-shotgun')}
        {flagCell(player.hasVaccine, 'V', 'watch-flag watch-flag-vaccine')}
      </td>
      <td className="watch-action">{player.lastAction}</td>
      <td className="watch-dim">{player.fitness}</td>
    </tr>
  );
}

export function WatchPage() {
  const { match, snapshot, canPlay, playNext } = useMatch();
  const [selectedId, setSelectedId] = useState(snapshot.players[0]?.id ?? '');
  const selected = snapshot.players.find((player) => player.id === selectedId) ?? snapshot.players[0];
  const names = useMemo(() => {
    return new Map(match.players.map((player) => [player.id, player.displayName]));
  }, [match.players]);

  useEffect(() => {
    document.title = 'Zombie Hunt — Watch';
  }, []);

  const chips = [
    ['Players', String(snapshot.players.length)],
    ['Humans', String(snapshot.stats.humans)],
    ['Zombies', String(snapshot.stats.zombies)],
    ['Eliminated', String(snapshot.stats.eliminated)],
    ['Vaccines', String(snapshot.stats.vaccinesHeld)],
    ['Shotguns', String(snapshot.stats.shotgunsHeld)],
    ['Mean cards', snapshot.stats.meanRegularCards.toFixed(1)],
    ['Games last round', String(match.reports.at(-1)?.duels.length ?? 0)],
  ] as const;

  return (
    <div className="watch-root">
      <header className="watch-bar">
        <div className="watch-bar-top">
          <div className="watch-brand">
            <p className="hud-kicker">National Institute of Virus Research</p>
            <h1>RL Watch</h1>
            <p className="watch-sub">Random legal play · one click per round</p>
          </div>
          <button type="button" className="primary watch-play" disabled={!canPlay} onClick={playNext}>
            {canPlay ? `Play round ${match.round + 1}` : 'Match complete'}
          </button>
        </div>
        <dl className="watch-meters">
          <div>
            <dt>Generation</dt>
            <dd>{snapshot.generation}</dd>
          </div>
          <div>
            <dt>Episode</dt>
            <dd>{snapshot.episode}</dd>
          </div>
          <div>
            <dt>Round</dt>
            <dd>
              {snapshot.round}/{ROUND_LIMIT}
            </dd>
          </div>
          <div>
            <dt>Seed</dt>
            <dd>{snapshot.seed}</dd>
          </div>
          <div>
            <dt>Humans</dt>
            <dd className="watch-faction-human">{snapshot.stats.humans}</dd>
          </div>
          <div>
            <dt>Zombies</dt>
            <dd className="watch-faction-zombie">{snapshot.stats.zombies}</dd>
          </div>
        </dl>
        {match.verdict ? <p className="watch-verdict">{match.verdict}</p> : null}
      </header>

      <section className="watch-chips" aria-label="Run statistics">
        {chips.map(([label, value]) => (
          <div key={label} className="watch-chip">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      {selected ? (
        <section className="watch-inspect" aria-label="Selected hand">
          <div className="watch-inspect-meta">
            <p className="hud-kicker">Selected hand</p>
            <h2>
              {selected.displayName}
              <span className="watch-dim"> · G{selected.group}</span>
            </h2>
            <p className={`watch-faction watch-faction-${selected.faction}`}>{selected.faction}</p>
            <p className="watch-action">{selected.lastAction}</p>
          </div>
          <WatchHand cards={selected.cards} size="inspect" />
        </section>
      ) : null}

      <div className="watch-table-wrap">
        <table className="watch-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Group</th>
              <th>Faction</th>
              <th>Hand</th>
              <th>Specials</th>
              <th>Last action</th>
              <th>Fitness</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                selected={player.id === selected?.id}
                onSelect={() => setSelectedId(player.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <WatchReport match={match} names={names} />
    </div>
  );
}
