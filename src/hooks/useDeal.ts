import { useCallback, useMemo, useState } from 'react';
import { deal, validateDealParams } from '../game/deal';
import { randomSeed } from '../game/rng';
import {
  DEFAULT_PLAYER_COUNT,
  DEFAULT_VACCINE_COUNT,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type Deal,
} from '../game/types';
import { playerHasKind } from '../game/deal';

function parseSeed(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed >>> 0;
}

export function useDeal() {
  const initial = useMemo(() => {
    const seed = randomSeed();
    return {
      seed,
      deal: deal(
        { playerCount: DEFAULT_PLAYER_COUNT, vaccineCount: DEFAULT_VACCINE_COUNT },
        seed,
      ),
    };
  }, []);

  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYER_COUNT);
  const [vaccineCount, setVaccineCount] = useState(DEFAULT_VACCINE_COUNT);
  const [seedText, setSeedText] = useState(String(initial.seed));
  const [current, setCurrent] = useState<Deal>(initial.deal);
  const [dealKey, setDealKey] = useState(0);
  const [animating, setAnimating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyPlayerCount = useCallback((next: number) => {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, next));
    setPlayerCount(clamped);
    setVaccineCount((currentVaccines) => Math.min(currentVaccines, clamped));
  }, []);

  const applyVaccineCount = useCallback(
    (next: number) => {
      if (!Number.isFinite(next)) {
        return;
      }
      setVaccineCount(Math.min(playerCount, Math.max(0, Math.floor(next))));
    },
    [playerCount],
  );

  const runDeal = useCallback(
    (freshSeed: boolean) => {
      const params = {
        playerCount,
        vaccineCount: Math.min(vaccineCount, playerCount),
      };
      const validation = validateDealParams(params);
      if (validation) {
        setError(validation);
        return;
      }
      const nextSeed = freshSeed ? randomSeed() : (parseSeed(seedText) ?? randomSeed());
      setError(null);
      setCurrent(deal(params, nextSeed));
      setSeedText(String(nextSeed));
      setDealKey((key) => key + 1);
      setAnimating(true);
    },
    [playerCount, seedText, vaccineCount],
  );

  const zombieHolder = current.players.find((player) => playerHasKind(player, 'zombie'));
  const vaccineHolders = current.players.filter((player) => playerHasKind(player, 'vaccine'));

  return {
    playerCount,
    vaccineCount,
    seedText,
    deal: current,
    dealKey,
    animating,
    error,
    zombieHolder,
    vaccineHolders,
    setPlayerCount: applyPlayerCount,
    setVaccineCount: applyVaccineCount,
    setSeedText,
    dealAgain: () => runDeal(false),
    redeal: () => runDeal(true),
    onDealComplete: () => setAnimating(false),
  };
}
