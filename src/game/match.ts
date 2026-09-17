import { cardLabel } from './cardArt';
import { createSpecialCard } from './deck';
import { createRng, pickOne, shuffleInPlace } from './rng';
import { dealTournament, type TournamentPlayer } from './tournament';
import { DEFAULT_VACCINES_PER_GROUP, ROUND_LIMIT, SUITS, type Card, type Rank, type Suit } from './types';

export type MatchPlayer = TournamentPlayer & {
  infected: boolean;
  status: 'alive' | 'eliminated';
  lastAction: string;
};

export type DuelKind = 'number' | 'tie' | 'infect' | 'vaccinate' | 'shotgun-kill' | 'mutual-shotgun';

export type TablePlay = {
  suit: Suit | null;
  numbers: Card[];
  special: Card | null;
};

export const EMPTY_PLAY: TablePlay = { suit: null, numbers: [], special: null };

export type DuelRecord = {
  id: string;
  group: number;
  rightGroup: number;
  leftSuit: Suit | null;
  rightSuit: Suit | null;
  leftId: string;
  rightId: string;
  leftHand: Card[];
  rightHand: Card[];
  leftInfected: boolean;
  rightInfected: boolean;
  leftCards: Card[];
  rightCards: Card[];
  leftTotal: number;
  rightTotal: number;
  winnerId: string | null;
  takenCard: Card | null;
  kind: DuelKind;
  summary: string;
};

export type ByeRecord = {
  id: string;
  cards: Card[];
  infected: boolean;
};

export type RoundRecord = {
  round: number;
  duels: DuelRecord[];
  byes: ByeRecord[];
};

export type MatchState = {
  seed: number;
  generation: number;
  episode: number;
  round: number;
  finished: boolean;
  verdict: string | null;
  players: MatchPlayer[];
  reports: RoundRecord[];
};

export type ChoosePlay = (
  player: MatchPlayer,
  opponent: MatchPlayer,
  random: () => number,
  match: MatchState,
) => TablePlay;

const EMPTY_ACTION = '—';

export function rankValue(rank: Rank): number {
  if (rank === 'A') {
    return 1;
  }
  return Number(rank);
}

export function handTotal(cards: Card[]): number {
  return cards.reduce((sum, card) => {
    if (card.kind !== 'regular' || !card.rank) {
      return sum;
    }
    return sum + rankValue(card.rank);
  }, 0);
}

function displayedCards(play: TablePlay): Card[] {
  return play.special ? [...play.numbers, play.special] : [...play.numbers];
}

function nonEmptySubsets<T>(items: T[]): T[][] {
  const n = items.length;
  if (n > 16) {
    throw new Error(`Cannot enumerate subsets of ${n} cards`);
  }
  const subsets: T[][] = [];
  const limit = 1 << n;
  for (let mask = 1; mask < limit; mask += 1) {
    const subset: T[] = [];
    for (let i = 0; i < n; i += 1) {
      if (mask & (1 << i)) {
        const item = items[i];
        if (item) {
          subset.push(item);
        }
      }
    }
    subsets.push(subset);
  }
  return subsets;
}

function playerById(players: MatchPlayer[], id: string): MatchPlayer {
  const player = players.find((entry) => entry.id === id);
  if (!player) {
    throw new Error(`Unknown player ${id}`);
  }
  return player;
}

function regularCount(player: MatchPlayer): number {
  return player.cards.filter((card) => card.kind === 'regular').length;
}

function isInfected(player: MatchPlayer): boolean {
  return player.status === 'alive' && player.infected;
}

function takeFromHand(player: MatchPlayer, cardId: string): Card | null {
  const index = player.cards.findIndex((card) => card.id === cardId);
  if (index < 0) {
    return null;
  }
  const [card] = player.cards.splice(index, 1);
  return card ?? null;
}

function cure(player: MatchPlayer): void {
  player.infected = false;
  player.cards = player.cards.filter((card) => card.kind !== 'zombie');
}

function eliminate(player: MatchPlayer, reason: string): void {
  player.status = 'eliminated';
  player.lastAction = reason;
}

function legalSpecials(player: MatchPlayer): Card[] {
  return player.cards.filter(
    (card) => card.kind === 'shotgun' || card.kind === 'zombie' || card.kind === 'vaccine',
  );
}

export function getLegalActions(player: MatchPlayer): TablePlay[] {
  const specials = legalSpecials(player);
  const plays: TablePlay[] = [];
  for (const suit of SUITS) {
    const follow = player.cards.filter((card) => card.kind === 'regular' && card.suit === suit);
    if (follow.length === 0) {
      continue;
    }
    for (const numbers of nonEmptySubsets(follow)) {
      plays.push({ suit, numbers, special: null });
      for (const special of specials) {
        plays.push({ suit, numbers, special });
      }
    }
  }
  for (const special of specials) {
    plays.push({ suit: null, numbers: [], special });
  }
  return plays;
}

function defaultChoosePlay(
  player: MatchPlayer,
  _opponent: MatchPlayer,
  random: () => number,
): TablePlay {
  return pickOne(getLegalActions(player), random) ?? EMPTY_PLAY;
}

function consumePlayedSpecial(player: MatchPlayer, special: Card | null): void {
  if (!special || special.kind === 'zombie') {
    return;
  }
  takeFromHand(player, special.id);
}

function stealFromTable(winner: MatchPlayer, loser: MatchPlayer, pile: Card[], random: () => number): Card | null {
  const stolen = pickOne(pile, random);
  if (!stolen) {
    return null;
  }
  takeFromHand(loser, stolen.id);
  winner.cards.push(stolen);
  return stolen;
}

function infectLoser(loser: MatchPlayer, round: number): void {
  loser.infected = true;
  if (loser.cards.some((card) => card.kind === 'zombie')) {
    return;
  }
  loser.cards.push(createSpecialCard('zombie', `${round}-${loser.id}`));
}

function compareTotals(leftTotal: number, rightTotal: number): 'left' | 'right' | 'tie' {
  if (leftTotal === rightTotal) {
    return 'tie';
  }
  return leftTotal > rightTotal ? 'left' : 'right';
}

function playLabel(play: TablePlay): string {
  return play.suit ?? 'specials';
}

function resolveDuel(
  match: MatchState,
  leftId: string,
  rightId: string,
  round: number,
  table: number,
  random: () => number,
  choosePlay: ChoosePlay,
): DuelRecord {
  const left = playerById(match.players, leftId);
  const right = playerById(match.players, rightId);
  const leftHand = [...left.cards];
  const rightHand = [...right.cards];
  const leftInfected = isInfected(left);
  const rightInfected = isInfected(right);
  const leftPlay = choosePlay(left, right, random, match);
  const rightPlay = choosePlay(right, left, random, match);
  consumePlayedSpecial(left, leftPlay.special);
  consumePlayedSpecial(right, rightPlay.special);

  const leftTotal = handTotal(leftPlay.numbers);
  const rightTotal = handTotal(rightPlay.numbers);
  const leftChoice = leftPlay.special;
  const rightChoice = rightPlay.special;

  const record: DuelRecord = {
    id: `r${round}-t${table}`,
    group: left.group,
    rightGroup: right.group,
    leftSuit: leftPlay.suit,
    rightSuit: rightPlay.suit,
    leftId,
    rightId,
    leftHand,
    rightHand,
    leftInfected,
    rightInfected,
    leftCards: displayedCards(leftPlay),
    rightCards: displayedCards(rightPlay),
    leftTotal,
    rightTotal,
    winnerId: null,
    takenCard: null,
    kind: 'number',
    summary: '',
  };

  const leftShot = leftChoice?.kind === 'shotgun';
  const rightShot = rightChoice?.kind === 'shotgun';
  if (leftShot || rightShot) {
    if (leftShot && isInfected(right)) {
      eliminate(right, `shotgunned by ${left.displayName}`);
    }
    if (rightShot && isInfected(left)) {
      eliminate(left, `shotgunned by ${right.displayName}`);
    }
    if (left.status === 'eliminated' && right.status === 'eliminated') {
      record.kind = 'mutual-shotgun';
      record.summary = 'Both fired shotguns and both died';
      return record;
    }
    if (right.status === 'eliminated') {
      record.kind = 'shotgun-kill';
      record.winnerId = left.id;
      left.lastAction = `shotgun killed ${right.displayName}`;
      record.summary = `${left.displayName} killed ${right.displayName} with a shotgun`;
      return record;
    }
    if (left.status === 'eliminated') {
      record.kind = 'shotgun-kill';
      record.winnerId = right.id;
      right.lastAction = `shotgun killed ${left.displayName}`;
      record.summary = `${right.displayName} killed ${left.displayName} with a shotgun`;
      return record;
    }
  }

  const leftPlayedZ = leftChoice?.kind === 'zombie';
  const rightPlayedZ = rightChoice?.kind === 'zombie';
  const leftVaccineHits = leftChoice?.kind === 'vaccine' && rightPlayedZ;
  const rightVaccineHits = rightChoice?.kind === 'vaccine' && leftPlayedZ;
  if (leftVaccineHits) {
    cure(right);
  }
  if (rightVaccineHits) {
    cure(left);
  }

  const leftZombie = leftPlayedZ && !rightVaccineHits;
  const rightZombie = rightPlayedZ && !leftVaccineHits;
  const cured = leftVaccineHits || rightVaccineHits;

  let side: 'left' | 'right' | 'tie' = 'tie';
  if (leftZombie && !rightZombie) {
    side = 'left';
  } else if (rightZombie && !leftZombie) {
    side = 'right';
  } else if (leftZombie && rightZombie) {
    side = pickOne(['left', 'right'] as const, random) ?? 'tie';
  } else {
    side = compareTotals(leftTotal, rightTotal);
  }

  if (side === 'tie') {
    left.lastAction = `played ${playLabel(leftPlay)} for ${leftTotal} (tie)`;
    right.lastAction = `played ${playLabel(rightPlay)} for ${rightTotal} (tie)`;
    record.kind = cured ? 'vaccinate' : 'tie';
    record.summary = cured
      ? `Vaccine cancelled the Zombie card. Tie ${leftTotal}–${rightTotal}`
      : `Tie ${leftTotal}–${rightTotal} (${playLabel(leftPlay)} vs ${playLabel(rightPlay)})`;
    return record;
  }

  const winner = side === 'left' ? left : right;
  const loser = side === 'left' ? right : left;
  const winnerTotal = winner.id === left.id ? leftTotal : rightTotal;
  const loserTotal = loser.id === left.id ? leftTotal : rightTotal;
  const winnerPlay = winner.id === left.id ? leftPlay : rightPlay;
  const loserPile = winner.id === left.id ? rightPlay.numbers : leftPlay.numbers;
  const taken = stealFromTable(winner, loser, loserPile, random);
  if (leftZombie || rightZombie) {
    infectLoser(loser, round);
  }

  winner.lastAction = taken
    ? `played ${playLabel(winnerPlay)} for ${winnerTotal}, took ${cardLabel(taken)}`
    : `played ${playLabel(winnerPlay)} for ${winnerTotal}, won`;
  loser.lastAction = `lost to ${winner.displayName}`;
  record.winnerId = winner.id;
  record.takenCard = taken;
  const score = taken
    ? `won ${winnerTotal}–${loserTotal} and took ${cardLabel(taken)}`
    : `won ${winnerTotal}–${loserTotal}`;
  if (cured) {
    const curedName = leftVaccineHits ? right.displayName : left.displayName;
    record.kind = 'vaccinate';
    record.summary = `${winner.displayName} ${score} after the Zombie card on ${curedName} was cancelled`;
  } else if (leftZombie || rightZombie) {
    record.kind = 'infect';
    record.summary = `${winner.displayName} infected ${loser.displayName} and ${score}`;
  } else {
    record.kind = 'number';
    record.summary = `${winner.displayName} ${score}`;
  }
  return record;
}

function livingPlayers(players: MatchPlayer[]): MatchPlayer[] {
  return players.filter((player) => player.status === 'alive');
}

export function factionTally(players: MatchPlayer[]): { living: number; humans: number; zombies: number } {
  const living = players.filter((player) => player.status === 'alive');
  const zombies = living.filter((player) => player.infected).length;
  return { living: living.length, humans: living.length - zombies, zombies };
}

export function playerReward(player: MatchPlayer, players: MatchPlayer[]): number {
  if (player.status !== 'alive') {
    return 0;
  }
  const { humans, zombies } = factionTally(players);
  if (zombies === humans) {
    return 0;
  }
  const zombieSideWins = zombies > humans;
  return player.infected === zombieSideWins ? 1 : 0;
}

function majorityVerdict(players: MatchPlayer[]): string {
  const { humans, zombies } = factionTally(players);
  if (zombies > humans) {
    return `Zombies ${zombies}–${humans}. Zombie side wins.`;
  }
  if (humans > zombies) {
    return `Humans ${humans}–${zombies}. Human side wins.`;
  }
  return `Tie ${humans}–${zombies}.`;
}

export function canPlayRound(match: MatchState): boolean {
  if (match.finished || match.round >= ROUND_LIMIT) {
    return false;
  }
  return livingPlayers(match.players).length >= 2;
}

export function createMatch(seed: number): MatchState {
  const tournament = dealTournament({ vaccinesPerGroup: DEFAULT_VACCINES_PER_GROUP }, seed);
  return {
    seed,
    generation: 1,
    episode: 1,
    round: 0,
    finished: false,
    verdict: null,
    players: tournament.players.map((player) => ({
      ...player,
      cards: [...player.cards],
      infected: player.cards.some((card) => card.kind === 'zombie'),
      status: 'alive',
      lastAction: EMPTY_ACTION,
    })),
    reports: [],
  };
}

export function cloneMatch(match: MatchState): MatchState {
  return {
    ...match,
    players: match.players.map((player) => ({ ...player, cards: [...player.cards] })),
    reports: match.reports.map((report) => ({
      ...report,
      duels: [...report.duels],
      byes: [...report.byes],
    })),
  };
}

export function playRound(match: MatchState, choosePlay: ChoosePlay = defaultChoosePlay): MatchState {
  if (!canPlayRound(match)) {
    const sealed = cloneMatch(match);
    sealed.finished = true;
    sealed.verdict = sealed.verdict ?? majorityVerdict(sealed.players);
    return sealed;
  }

  const next = cloneMatch(match);
  next.round += 1;
  const random = createRng((Math.imul(next.seed ^ (next.round * 0x9e3779b9), 0x85ebca6b) >>> 0));
  const duels: DuelRecord[] = [];
  let table = 0;

  const ids = livingPlayers(next.players).map((player) => player.id);
  shuffleInPlace(ids, random);
  const byes: ByeRecord[] = [];
  for (let i = 0; i + 1 < ids.length; i += 2) {
    const leftId = ids[i];
    const rightId = ids[i + 1];
    if (!leftId || !rightId) {
      continue;
    }
    table += 1;
    duels.push(resolveDuel(next, leftId, rightId, next.round, table, random, choosePlay));
  }
  if (ids.length % 2 === 1) {
    const byeId = ids[ids.length - 1];
    if (byeId) {
      const bye = playerById(next.players, byeId);
      bye.lastAction = 'bye';
      byes.push({ id: bye.id, cards: [...bye.cards], infected: isInfected(bye) });
    }
  }

  for (const player of next.players) {
    if (player.status === 'alive' && regularCount(player) === 0) {
      eliminate(player, 'out of number cards');
    }
  }

  next.reports.push({ round: next.round, duels, byes });
  if (next.round >= ROUND_LIMIT || !canPlayRound({ ...next, finished: false })) {
    next.finished = true;
    next.verdict = majorityVerdict(next.players);
  }
  return next;
}
