import { cardToken } from '../game/cardArt';
import type { DuelRecord, MatchPlayer, MatchState } from '../game/match';
import { ROUND_LIMIT, type Card } from '../game/types';

function tokens(cards: Card[]): string {
  return cards.map(cardToken).join(',');
}

function shortName(displayName: string): string {
  const digits = displayName.match(/(\d+)\s*$/);
  return digits ? `P${digits[1]}` : displayName.replaceAll(/\s+/g, '_');
}

function factionToken(infected: boolean, status: MatchPlayer['status'] = 'alive'): string {
  if (status === 'eliminated') {
    return 'X';
  }
  return infected ? 'Z' : 'H';
}

function nameOf(players: MatchPlayer[], id: string): string {
  const player = players.find((entry) => entry.id === id);
  return shortName(player?.displayName ?? id);
}

function groupOf(players: MatchPlayer[], id: string): number {
  return players.find((entry) => entry.id === id)?.group ?? 0;
}

function tableTag(duel: DuelRecord): string {
  return duel.rightGroup === duel.group ? `G${duel.group}` : `G${duel.group}-G${duel.rightGroup}`;
}

function playField(cards: Card[], suit: DuelRecord['leftSuit'], total: number): string {
  const numbers = cards.filter((card) => card.kind === 'regular');
  const special = cards.find((card) => card.kind !== 'regular');
  const pile = numbers.length > 0 ? `${suit ?? '?'}:${tokens(numbers)}=${total}` : `none=0`;
  return special ? `${pile} +${cardToken(special)}` : pile;
}

function outcomeLine(duel: DuelRecord, players: MatchPlayer[]): string {
  const left = nameOf(players, duel.leftId);
  const right = nameOf(players, duel.rightId);
  const taken = duel.takenCard ? ` take=${cardToken(duel.takenCard)}` : '';
  if (duel.kind === 'mutual-shotgun') {
    return `outcome: ${left} and ${right} both shot dead`;
  }
  if (duel.kind === 'tie') {
    return `outcome: tie ${duel.leftTotal}-${duel.rightTotal}${taken}`;
  }
  const winner = duel.winnerId ? nameOf(players, duel.winnerId) : '?';
  const loserId = duel.winnerId === duel.leftId ? duel.rightId : duel.leftId;
  const loser = nameOf(players, loserId);
  if (duel.kind === 'shotgun-kill') {
    return `outcome: ${winner} shotgun-kills ${loser}`;
  }
  if (duel.kind === 'infect') {
    return `outcome: ${winner} infects ${loser} ${duel.leftTotal}-${duel.rightTotal}${taken}`;
  }
  if (duel.kind === 'vaccinate') {
    return `outcome: vax cancels zombie; ${winner} ${duel.leftTotal}-${duel.rightTotal}${taken}`;
  }
  return `outcome: ${winner} wins ${duel.leftTotal}-${duel.rightTotal}${taken}`;
}

function seatLine(
  label: string,
  id: string,
  hand: Card[],
  infected: boolean,
  play: Card[],
  suit: DuelRecord['leftSuit'],
  total: number,
  players: MatchPlayer[],
): string {
  return `${label} ${nameOf(players, id)} G${groupOf(players, id)} ${factionToken(infected)} hand=[${tokens(hand)}] play=${playField(play, suit, total)}`;
}

export function exportMatchMarkdown(match: MatchState): string {
  const lines: string[] = [
    '# Zombie Hunt',
    'schema: zh-md/1',
    `seed: ${match.seed}`,
    `generation: ${match.generation}`,
    `episode: ${match.episode}`,
    `rounds_played: ${match.round}`,
    `round_limit: ${ROUND_LIMIT}`,
    `finished: ${match.finished}`,
    `verdict: ${match.verdict ?? '—'}`,
    '',
    '## Legend',
    'Pip card = rank+suit (AS=Ace of spades, 10H=10 of hearts). Ace=1. No J/Q/K.',
    'shot=shotgun, zombie=zombie card, vax=vaccine.',
    'H=human, Z=infected, X=eliminated.',
    'hand=cards available before the play. play=cards put on the table.',
    '',
  ];

  for (const report of match.reports) {
    lines.push(`## Round ${report.round}`);
    lines.push(`tables: ${report.duels.length}`);
    if (report.byes.length > 0) {
      for (const bye of report.byes) {
        lines.push(
          `bye: ${nameOf(match.players, bye.id)} G${groupOf(match.players, bye.id)} ${factionToken(bye.infected)} hand=[${tokens(bye.cards)}]`,
        );
      }
    }
    lines.push('');
    report.duels.forEach((duel, index) => {
      lines.push(`### T${index + 1} ${tableTag(duel)} ${duel.kind}`);
      lines.push(
        seatLine('L', duel.leftId, duel.leftHand, duel.leftInfected, duel.leftCards, duel.leftSuit, duel.leftTotal, match.players),
      );
      lines.push(
        seatLine(
          'R',
          duel.rightId,
          duel.rightHand,
          duel.rightInfected,
          duel.rightCards,
          duel.rightSuit,
          duel.rightTotal,
          match.players,
        ),
      );
      lines.push(outcomeLine(duel, match.players));
      lines.push('');
    });
  }

  lines.push('## Final roster');
  for (const player of match.players) {
    lines.push(
      `${shortName(player.displayName)} G${player.group} ${factionToken(player.infected, player.status)} cards=[${tokens(player.cards)}] last=${player.lastAction}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

export function matchExportFilename(match: MatchState): string {
  return `zh-s${match.seed}-r${match.round}.md`;
}
