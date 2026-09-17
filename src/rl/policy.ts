import { EMPTY_PLAY, getLegalActions, type ChoosePlay, type MatchPlayer, type TablePlay } from '../game/match';
import { pickOne } from '../game/rng';
import { encodeView, type PlayerView } from './features';

export type PolicyContext = {
  view: PlayerView;
  actions: TablePlay[];
  random: () => number;
};

export type Policy = (ctx: PolicyContext) => TablePlay;

export type Seating = Policy | Partial<Record<string, Policy>>;

export function samePlay(left: TablePlay, right: TablePlay): boolean {
  if (left.suit !== right.suit || left.special?.id !== right.special?.id) {
    return false;
  }
  if (left.numbers.length !== right.numbers.length) {
    return false;
  }
  return left.numbers.every((card, index) => card.id === right.numbers[index]?.id);
}

export function bindSeating(seating: Seating, fallback: Policy): ChoosePlay {
  const policyFor = (player: MatchPlayer): Policy => {
    if (typeof seating === 'function') {
      return seating;
    }
    return seating[player.id] ?? fallback;
  };

  return (player, opponent, random, match) => {
    const actions = getLegalActions(player);
    if (actions.length === 0) {
      return EMPTY_PLAY;
    }
    const view = encodeView(player, opponent, match);
    const chosen = policyFor(player)({ view, actions, random });
    if (actions.some((action) => samePlay(action, chosen))) {
      return chosen;
    }
    return pickOne(actions, random) ?? EMPTY_PLAY;
  };
}
