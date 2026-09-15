import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { useDeal } from './hooks/useDeal';
import { preloadDeckTextures } from './scene/cardTextures';
import { TableScene } from './scene/TableScene';
import { DealControls } from './ui/DealControls';
import { DealLegend } from './ui/DealLegend';
import { R3FErrorBoundary } from './ui/R3FErrorBoundary';

export function App() {
  const state = useDeal();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    preloadDeckTextures()
      .then(() => setReady(true))
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Failed to load the deck');
      });
  }, []);

  if (!ready) {
    return (
      <aside className="hud-panel hud-controls">
        <p className="hud-kicker">National Institute of Virus Research</p>
        <h1>Zombie Hunt</h1>
        <p className="hud-status">{loadError ?? 'Loading deck…'}</p>
      </aside>
    );
  }

  return (
    <>
      <div className="canvas-root">
        <R3FErrorBoundary>
          <Canvas
            camera={{ position: [7.4, 5.1, 8.6], fov: 40, near: 0.1, far: 90 }}
            dpr={[1, 2]}
            gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              gl.setClearColor('#4a5552');
            }}
          >
            <TableScene
              deal={state.deal}
              dealKey={state.dealKey}
              onDealComplete={state.onDealComplete}
            />
          </Canvas>
        </R3FErrorBoundary>
      </div>
      <DealControls
        playerCount={state.playerCount}
        vaccineCount={state.vaccineCount}
        seedText={state.seedText}
        animating={state.animating}
        error={state.error}
        onPlayerCount={state.setPlayerCount}
        onVaccineCount={state.setVaccineCount}
        onSeedText={state.setSeedText}
        onDeal={state.dealAgain}
        onRedeal={state.redeal}
      />
      <DealLegend
        deal={state.deal}
        zombieHolder={state.zombieHolder}
        vaccineHolders={state.vaccineHolders}
      />
    </>
  );
}
