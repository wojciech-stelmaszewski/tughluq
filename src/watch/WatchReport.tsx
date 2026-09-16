import { useEffect, useState } from 'react';
import { cardAssetUrl, cardLabel } from '../game/cardArt';
import type { DuelKind, DuelRecord, MatchState } from '../game/match';
import type { Card, Suit } from '../game/types';
import { WatchHand } from './WatchHand';
import { exportMatchMarkdown, matchExportFilename } from './exportMatch';

function ReportCard({ card, size }: { card: Card | null; size: 'play' | 'loot' }) {
  if (!card) {
    return <div className={`watch-face watch-face-${size} watch-face-empty`}>No card</div>;
  }
  return <img className={`watch-face watch-face-${size}`} src={cardAssetUrl(card)} alt={cardLabel(card)} />;
}

function PlayPile({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return <div className="watch-face watch-face-play watch-face-empty">Empty hand</div>;
  }
  return (
    <ul className="watch-pile">
      {cards.map((card) => (
        <li key={card.id}>
          <ReportCard card={card} size="play" />
        </li>
      ))}
    </ul>
  );
}

function playNote(cards: Card[], suit: Suit | null, total: number, kind: DuelKind, won: boolean): string {
  const special = cards.find((card) => card.kind !== 'regular');
  const numbers = cards.filter((card) => card.kind === 'regular');
  const bits: string[] = [];
  if (numbers.length > 0 && suit) {
    bits.push(`${numbers.length}× ${suit} = ${total}`);
  } else {
    bits.push(suit ? `Chose no ${suit} pile (total 0)` : 'No number pile (total 0)');
  }
  if (special?.kind === 'shotgun') {
    if (kind === 'shotgun-kill' && won) {
      bits.push('Shotgun — killed the zombie');
    } else if (kind === 'mutual-shotgun') {
      bits.push('Shotgun — both died');
    } else {
      bits.push('Shotgun — wasted on a human');
    }
  } else if (special?.kind === 'zombie') {
    if (kind === 'vaccinate') {
      bits.push('Zombie — cancelled by vaccine');
    } else if (kind === 'infect' && won) {
      bits.push('Zombie — infects the loser');
    } else {
      bits.push('Zombie');
    }
  } else if (special?.kind === 'vaccine') {
    bits.push(kind === 'vaccinate' ? 'Vaccine — cancelled the Zombie card' : 'Vaccine — no Zombie on the table');
  }
  return bits.join(' · ');
}

const KIND_LABEL: Record<DuelKind, string> = {
  number: 'Number cards',
  tie: 'Tie',
  infect: 'Infection',
  vaccinate: 'Vaccine',
  'shotgun-kill': 'Shotgun kill',
  'mutual-shotgun': 'Double shotgun',
};

function roleLabel(duel: DuelRecord, playerId: string): string {
  if (duel.kind === 'tie' || duel.kind === 'mutual-shotgun') {
    return duel.kind === 'tie' ? 'Tie' : 'Dead';
  }
  if (duel.winnerId === playerId) {
    return 'Wins';
  }
  if (duel.kind === 'shotgun-kill') {
    return 'Killed';
  }
  return 'Loses';
}

function Seat({
  name,
  infected,
  available,
  cards,
  total,
  note,
  role,
  won,
}: {
  name: string;
  infected: boolean;
  available: Card[];
  cards: Card[];
  total: number;
  note: string;
  role: string;
  won: boolean;
}) {
  return (
    <div className={`watch-seat ${won ? 'watch-seat-win' : ''}`}>
      <p className="watch-mono">{name}</p>
      <p className={`watch-faction ${infected ? 'watch-faction-zombie' : 'watch-faction-human'}`}>
        {infected ? 'zombie' : 'human'}
      </p>
      <p className="watch-seat-kicker">Available</p>
      <WatchHand cards={available} size="thumb" />
      <p className="watch-seat-kicker">Played</p>
      <PlayPile cards={cards} />
      <p className="watch-seat-total">Total {total}</p>
      <p className="watch-seat-note">{note}</p>
      <p className={`watch-seat-role ${won ? 'watch-seat-role-win' : ''}`}>{role}</p>
    </div>
  );
}

function DuelCard({ duel, names }: { duel: DuelRecord; names: Map<string, string> }) {
  const left = names.get(duel.leftId) ?? duel.leftId;
  const right = names.get(duel.rightId) ?? duel.rightId;
  const leftWon = duel.winnerId === duel.leftId;
  const rightWon = duel.winnerId === duel.rightId;

  return (
    <li className="watch-duel">
      <header className="watch-duel-head">
        <span className="watch-mono">
          {duel.rightGroup === duel.group ? `G${duel.group}` : `G${duel.group}–G${duel.rightGroup}`} ·{' '}
          {duel.leftSuit ?? '—'} vs {duel.rightSuit ?? '—'}
        </span>
        <span className={`watch-duel-kind watch-duel-kind-${duel.kind}`}>{KIND_LABEL[duel.kind]}</span>
      </header>
      <div className="watch-duel-board">
        <Seat
          name={left}
          infected={duel.leftInfected}
          available={duel.leftHand}
          cards={duel.leftCards}
          total={duel.leftTotal}
          note={playNote(duel.leftCards, duel.leftSuit, duel.leftTotal, duel.kind, leftWon)}
          role={roleLabel(duel, duel.leftId)}
          won={leftWon}
        />
        <span className="watch-duel-vs">
          {duel.leftTotal}–{duel.rightTotal}
        </span>
        <Seat
          name={right}
          infected={duel.rightInfected}
          available={duel.rightHand}
          cards={duel.rightCards}
          total={duel.rightTotal}
          note={playNote(duel.rightCards, duel.rightSuit, duel.rightTotal, duel.kind, rightWon)}
          role={roleLabel(duel, duel.rightId)}
          won={rightWon}
        />
      </div>
      <footer className="watch-duel-foot">
        <p>{duel.summary}</p>
        {duel.takenCard ? (
          <div className="watch-loot">
            <span>Taken</span>
            <ReportCard card={duel.takenCard} size="loot" />
            <span className="watch-mono">{cardLabel(duel.takenCard)}</span>
          </div>
        ) : null}
      </footer>
    </li>
  );
}

function downloadMarkdown(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  void navigator.clipboard?.writeText(text).catch(() => undefined);
}

export function WatchReport({ match, names }: { match: MatchState; names: Map<string, string> }) {
  const reports = match.reports;
  const [selectedRound, setSelectedRound] = useState(reports.at(-1)?.round ?? 0);

  useEffect(() => {
    if (match.round > 0) {
      setSelectedRound(match.round);
    }
  }, [match.round]);

  if (reports.length === 0) {
    return (
      <section className="watch-report" aria-label="Round report">
        <div className="watch-report-head">
          <h2>Round report</h2>
          <button type="button" className="watch-export" onClick={() => downloadMarkdown(matchExportFilename(match), exportMatchMarkdown(match))}>
            Export Markdown
          </button>
        </div>
        <p className="watch-dim">No rounds yet. Play a round to see every table.</p>
      </section>
    );
  }

  const report = reports.find((entry) => entry.round === selectedRound) ?? reports[reports.length - 1];
  if (!report) {
    return null;
  }

  return (
    <section className="watch-report" aria-label="Round report">
      <div className="watch-report-head">
        <h2>Round report</h2>
        <button type="button" className="watch-export" onClick={() => downloadMarkdown(matchExportFilename(match), exportMatchMarkdown(match))}>
          Export Markdown
        </button>
      </div>
      <div className="watch-round-bar" role="tablist" aria-label="Round">
        {reports.map((entry) => (
          <button
            key={entry.round}
            type="button"
            role="tab"
            aria-selected={entry.round === report.round}
            className={entry.round === report.round ? 'watch-round-tab watch-round-tab-on' : 'watch-round-tab'}
            onClick={() => setSelectedRound(entry.round)}
          >
            {entry.round}
          </button>
        ))}
      </div>
      <article className="watch-round">
        <h3>
          Round {report.round}
          <span className="watch-dim"> · {report.duels.length} tables</span>
        </h3>
        {report.byes.length > 0 ? (
          <p className="watch-dim">
            Bye:{' '}
            {report.byes.map((bye) => names.get(bye.id) ?? bye.id).join(', ')}
          </p>
        ) : null}
        <ul className="watch-duel-grid">
          {report.duels.map((duel) => (
            <DuelCard key={duel.id} duel={duel} names={names} />
          ))}
        </ul>
      </article>
    </section>
  );
}
