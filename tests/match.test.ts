import { describe, expect, it } from 'vitest';
import {
  canPlayRound,
  createMatch,
  getLegalActions,
  playRound,
} from '../src/game/match';
import { ROUND_LIMIT } from '../src/game/types';
import { randomLegal } from '../src/rl/baselines';
import { encodeAction, encodeView, encodeViewVector } from '../src/rl/features';
import { bindSeating } from '../src/rl/policy';
import { runEpisode } from '../src/rl/runEpisode';
import {
  hasVaccineAction,
  playLargestNumbers,
  playNumbers,
  playSpecial,
  regular,
  special,
  step,
  testMatch,
  testPlayer,
} from './helpers';

describe('getLegalActions', () => {
  it('enumerates every non-empty subset and offers vaccine against a human', () => {
    const human = testPlayer('a', [
      regular('h2', 'hearts', '2'),
      regular('h3', 'hearts', '3'),
      special('vaccine', 'v1'),
      special('shotgun', 's1'),
    ]);
    const opponent = testPlayer('b', [regular('c4', 'clubs', '4')]);
    const actions = getLegalActions(human);
    const heartPlain = actions.filter((play) => play.suit === 'hearts' && play.special === null);
    expect(heartPlain).toHaveLength(3);
    expect(hasVaccineAction(human)).toBe(true);
    expect(opponent.infected).toBe(false);
    expect(actions.some((play) => play.special?.kind === 'shotgun' && play.numbers.length === 0)).toBe(
      true,
    );
  });
});

describe('duel resolution', () => {
  it('compares sums, counts Ace as 1, and steals one card from the loser pile', () => {
    const match = testMatch([
      testPlayer('ace', [regular('as', 'spades', 'A'), special('shotgun', 's-ace')]),
      testPlayer('two', [regular('2s', 'spades', '2'), special('shotgun', 's-two')]),
    ]);
    const next = step(match, { ace: playNumbers, two: playNumbers });
    const duel = next.reports[0]?.duels[0];
    expect(duel?.leftTotal === 1 || duel?.rightTotal === 1).toBe(true);
    expect(duel?.kind).toBe('number');
    expect(duel?.takenCard?.rank).toBe('A');
    const winner = next.players.find((player) => player.id === duel?.winnerId);
    const loser = next.players.find((player) => player.id !== duel?.winnerId);
    expect(winner?.cards.some((card) => card.rank === 'A')).toBe(true);
    expect(loser?.status).toBe('eliminated');
  });

  it('steals nothing on a tie', () => {
    const match = testMatch([
      testPlayer('left', [regular('5h', 'hearts', '5'), special('shotgun', 's-l')]),
      testPlayer('right', [regular('5c', 'clubs', '5'), special('shotgun', 's-r')]),
    ]);
    const next = step(match, { left: playNumbers, right: playNumbers });
    const duel = next.reports[0]?.duels[0];
    expect(duel?.kind).toBe('tie');
    expect(duel?.takenCard).toBeNull();
    expect(next.players[0]?.cards).toHaveLength(2);
    expect(next.players[1]?.cards).toHaveLength(2);
  });
});

describe('specials', () => {
  it('lets zombie trump, keeps the attacker copy, and infects the loser with a new copy', () => {
    const attacker = testPlayer('z', [
      regular('9h', 'hearts', '9'),
      special('zombie', 'z-card'),
      special('shotgun', 's-z'),
    ]);
    const human = testPlayer('h', [regular('10c', 'clubs', '10'), special('shotgun', 's-h')]);
    const next = step(testMatch([attacker, human]), {
      z: playSpecial('zombie'),
      h: playNumbers,
    });
    const duel = next.reports[0]?.duels[0];
    expect(duel?.kind).toBe('infect');
    const z = next.players.find((player) => player.id === 'z');
    const h = next.players.find((player) => player.id === 'h');
    expect(z?.cards.filter((card) => card.kind === 'zombie')).toHaveLength(1);
    expect(h?.infected).toBe(true);
    expect(h?.cards.some((card) => card.kind === 'zombie')).toBe(true);
  });

  it('cancels a zombie played this duel and spends a miss against a human', () => {
    const vax = testPlayer('v', [
      regular('3h', 'hearts', '3'),
      special('vaccine', 'vax'),
      special('shotgun', 's-v'),
    ]);
    const zed = testPlayer('z', [
      regular('4c', 'clubs', '4'),
      special('zombie', 'z-card'),
      special('shotgun', 's-z'),
    ]);
    const cancelled = step(testMatch([vax, zed], 2), {
      v: playSpecial('vaccine'),
      z: playSpecial('zombie'),
    });
    expect(cancelled.reports[0]?.duels[0]?.kind).toBe('vaccinate');
    expect(cancelled.players.find((player) => player.id === 'z')?.infected).toBe(false);
    expect(cancelled.players.find((player) => player.id === 'v')?.cards.some((card) => card.kind === 'vaccine')).toBe(
      false,
    );

    const human = testPlayer('h', [regular('8s', 'spades', '8'), special('shotgun', 's-h')]);
    const miss = step(testMatch([vax, human], 3), {
      v: playSpecial('vaccine'),
      h: playNumbers,
    });
    expect(miss.reports[0]?.duels[0]?.kind).not.toBe('vaccinate');
    expect(miss.players.find((player) => player.id === 'v')?.cards.some((card) => card.kind === 'vaccine')).toBe(
      false,
    );
    expect(miss.players.find((player) => player.id === 'h')?.infected).toBe(false);
  });

  it('kills an infected player with a shotgun and wastes it on a human', () => {
    const shooter = testPlayer('s', [
      regular('2h', 'hearts', '2'),
      special('shotgun', 'shot'),
    ]);
    const zombie = testPlayer('z', [
      regular('3c', 'clubs', '3'),
      special('zombie', 'z-card'),
      special('shotgun', 's-z'),
    ]);
    const kill = step(testMatch([shooter, zombie], 4), {
      s: playSpecial('shotgun'),
      z: playNumbers,
    });
    expect(kill.reports[0]?.duels[0]?.kind).toBe('shotgun-kill');
    expect(kill.players.find((player) => player.id === 'z')?.status).toBe('eliminated');
    expect(kill.players.find((player) => player.id === 's')?.cards.some((card) => card.kind === 'shotgun')).toBe(
      false,
    );

    const human = testPlayer('h', [
      regular('4d', 'diamonds', '4'),
      regular('5d', 'diamonds', '5'),
      special('shotgun', 's-h'),
    ]);
    const waste = step(testMatch([shooter, human], 5), {
      s: playSpecial('shotgun'),
      h: playLargestNumbers,
    });
    expect(waste.reports[0]?.duels[0]?.kind).not.toBe('shotgun-kill');
    expect(waste.players.find((player) => player.id === 'h')?.status).toBe('alive');
    expect(waste.players.find((player) => player.id === 's')?.cards.some((card) => card.kind === 'shotgun')).toBe(
      false,
    );
  });
});

describe('end conditions', () => {
  it('eliminates a player who runs out of number cards', () => {
    const poor = testPlayer('poor', [regular('2h', 'hearts', '2'), special('shotgun', 's-p')]);
    const rich = testPlayer('rich', [regular('9c', 'clubs', '9'), special('shotgun', 's-r')]);
    const next = step(testMatch([poor, rich]), { poor: playNumbers, rich: playNumbers });
    expect(next.players.find((player) => player.id === 'poor')?.status).toBe('eliminated');
    expect(next.verdict).toMatch(/Human side wins|Zombie side wins|Tie/);
  });

  it('seals a 20-round match with a majority verdict', () => {
    let match = createMatch(9);
    while (canPlayRound(match)) {
      match = playRound(match);
    }
    expect(match.finished).toBe(true);
    expect(match.round).toBeLessThanOrEqual(ROUND_LIMIT);
    expect(match.verdict).toMatch(/wins\.|Tie /);
  });
});

describe('determinism and observation', () => {
  it('replays the same seed and policies into an identical match', () => {
    const choose = bindSeating(randomLegal, randomLegal);
    const left = runEpisode(21, randomLegal);
    const right = runEpisode(21, randomLegal);
    expect(left.match).toEqual(right.match);
    const first = playRound(createMatch(21), choose);
    const second = playRound(createMatch(21), choose);
    expect(first).toEqual(second);
  });

  it('hides opponent faction and living zombie share from the player view', () => {
    const me = testPlayer('me', [
      regular('ah', 'hearts', 'A'),
      regular('2h', 'hearts', '2'),
      special('shotgun', 's-me'),
    ]);
    const foe = testPlayer('foe', [regular('3c', 'clubs', '3'), special('zombie', 'z-foe')]);
    const extra = testPlayer('extra', [regular('4d', 'diamonds', '4'), special('shotgun', 's-x')]);
    const match = testMatch([me, foe, extra], 8);
    match.round = 3;
    const view = encodeView(me, foe, match);
    const altFoe = { ...foe, infected: false };
    const altMatch = testMatch([me, altFoe, { ...extra, infected: true }], 8);
    altMatch.round = 3;
    expect(encodeViewVector(encodeView(me, altFoe, altMatch))).toEqual(encodeViewVector(view));
    expect(view).not.toHaveProperty('opponentInfected');
    expect(view).not.toHaveProperty('zombieShare');
    expect(view.opponentHandSize).toBe(2);
    expect(view.livingCount).toBe(3);

    const play = getLegalActions(me).find((action) => action.special === null);
    expect(play).toBeTruthy();
    if (play) {
      expect(encodeAction(play, view)).toHaveLength(10);
    }
  });
});
