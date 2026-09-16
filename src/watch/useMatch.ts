import { useCallback, useMemo, useState } from 'react';
import { canPlayRound, createMatch, playRound } from '../game/match';
import { randomSeed } from '../game/rng';
import { snapshotFromMatch } from './snapshot';

export function useMatch() {
  const seed = useMemo(() => randomSeed(), []);
  const [match, setMatch] = useState(() => createMatch(seed));

  const playNext = useCallback(() => {
    setMatch((current) => playRound(current));
  }, []);

  return {
    match,
    snapshot: snapshotFromMatch(match),
    canPlay: canPlayRound(match),
    playNext,
  };
}
