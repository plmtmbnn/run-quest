/**
 * Crowd Noise Hook
 *
 * Manages ambient crowd noise and cheer bursts using Web Audio API.
 * Volume and intensity adjust based on race conditions and player performance.
 */

import { useCallback, useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settings-store";

export type CrowdMood = "supportive" | "excited" | "tense" | "celebratory";

export interface CrowdState {
  intensity: number; // 0-100
  dominantMood: CrowdMood;
  density: number; // 0-100, increases near finish
}

/**
 * Hook for managing crowd atmosphere audio
 */
export function useCrowdAtmosphereNoise(crowdState: CrowdState) {
  const enabled = useSettingsStore((state) => state.settings.sound);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientOscillatorsRef = useRef<OscillatorNode[]>([]);
  const ambientGainsRef = useRef<GainNode[]>([]);
  const cheerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  /**
   * Initialize audio context if needed
   */
  const initAudioContext = useCallback(() => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Stop ambient noise
   */
  const stopAmbientNoise = useCallback(() => {
    ambientOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore
      }
    });

    ambientGainsRef.current.forEach((gain) => {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignore
      }
    });

    ambientOscillatorsRef.current = [];
    ambientGainsRef.current = [];
  }, []);

  /**
   * Update ambient crowd noise
   */
  const updateAmbientNoise = useCallback(
    (intensity: number, density: number) => {
      if (!enabled) return;

      const ctx = initAudioContext();
      if (!ctx) return;

      // Stop existing oscillators
      stopAmbientNoise();

      // Calculate volume based on intensity and density
      const baseVolume = (intensity / 100) * 0.15;
      const densityMultiplier = 0.5 + (density / 100) * 0.5;
      const volume = baseVolume * densityMultiplier;

      if (volume < 0.01) return; // Too quiet, don't play

      // Create multiple oscillators for richer crowd sound
      const oscillatorCount = Math.min(5, Math.ceil(density / 20));

      for (let i = 0; i < oscillatorCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Random frequency for crowd-like noise
        const baseFreq = 200 + Math.random() * 400;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 100, ctx.currentTime);

        // Filter to make it sound more like crowd
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
          1000 + Math.random() * 2000,
          ctx.currentTime,
        );
        filter.Q.setValueAtTime(0.5, ctx.currentTime);

        // Set volume
        gain.gain.setValueAtTime(volume / oscillatorCount, ctx.currentTime);

        // Connect nodes
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);

        ambientOscillatorsRef.current.push(osc);
        ambientGainsRef.current.push(gain);
      }
    },
    [enabled, initAudioContext, stopAmbientNoise],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAmbientNoise();
      if (cheerTimerRef.current) {
        clearTimeout(cheerTimerRef.current);
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== "closed") {
          try {
            audioContextRef.current.close().catch(() => {});
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
        audioContextRef.current = null;
      }
    };
  }, [stopAmbientNoise]);

  // Update ambient noise based on crowd state
  useEffect(() => {
    if (!enabled) {
      stopAmbientNoise();
      return;
    }

    updateAmbientNoise(crowdState.intensity, crowdState.density);
  }, [
    enabled,
    crowdState.intensity,
    crowdState.density,
    updateAmbientNoise,
    stopAmbientNoise,
  ]);

  /**
   * Play a cheer burst sound
   */
  const playCheerBurst = useCallback(
    (mood: CrowdMood = "excited") => {
      if (!enabled) return;

      const ctx = initAudioContext();
      if (!ctx) return;

      const duration = mood === "celebratory" ? 1.5 : 0.8;
      const oscillatorCount = mood === "celebratory" ? 15 : 10;

      for (let i = 0; i < oscillatorCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Rising frequency for cheer effect
        const startFreq = 500 + Math.random() * 1500;
        const endFreq = startFreq * (mood === "celebratory" ? 1.8 : 1.5);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime + i * 0.05);
        osc.frequency.exponentialRampToValueAtTime(
          endFreq,
          ctx.currentTime + i * 0.05 + duration,
        );

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, ctx.currentTime + i * 0.05);
        filter.frequency.exponentialRampToValueAtTime(
          5000,
          ctx.currentTime + i * 0.05 + duration,
        );

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
        gain.gain.linearRampToValueAtTime(
          0.12,
          ctx.currentTime + i * 0.05 + 0.1,
        );
        gain.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + i * 0.05 + duration,
        );

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + duration);
      }
    },
    [enabled, initAudioContext],
  );

  /**
   * Play underdog support cheer
   */
  const playUnderdogCheer = useCallback(() => {
    if (!enabled) return;

    const ctx = initAudioContext();
    if (!ctx) return;

    // Special rising cheer pattern for underdog moment
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const freq = 400 + i * 100;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(
        0.15,
        ctx.currentTime + i * 0.08 + 0.05,
      );
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.4);
    }
  }, [enabled, initAudioContext]);

  /**
   * Play finish line roar
   */
  const playFinishRoar = useCallback(() => {
    if (!enabled) return;

    playCheerBurst("celebratory");
  }, [enabled, playCheerBurst]);

  return {
    updateAmbientNoise,
    playCheerBurst,
    playUnderdogCheer,
    playFinishRoar,
  };
}
