"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import {
  getRacePhase,
  getTrackForPhase,
  shouldPlaySoundEffect,
  type RaceMusicPhase,
  type RaceMusicStats,
  type RaceMusicTrack,
  type RaceSoundEffect,
  RACE_TRACKS,
  SOUND_EFFECTS,
} from "@/audio/race-tracks";

export type { RaceMusicStats, RaceMusicPhase };
import type { PacingPlan } from "@/types/engine";

/**
 * Hook for managing adaptive music during a race.
 * Uses Web Audio API for procedural music generation.
 * Automatically transitions between music phases based on race progress and stats.
 */
export function useAdaptiveMusic(stats: RaceMusicStats) {
  const enabled = useSettingsStore((state) => state.settings.sound);
  const [currentPhase, setCurrentPhase] = useState<RaceMusicPhase>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const lastPhaseRef = useRef<RaceMusicPhase>("none");
  const lastBellKmRef = useRef<number>(0);
  const soundEffectTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  // Clean up audio nodes on unmount
  useEffect(() => {
    return () => {
      // Stop all active oscillators
      activeOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      
      // Clear all sound effect timers
      Object.values(soundEffectTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      
      // Close audio context safely
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
  }, []);

  // Determine current phase and handle transitions
  useEffect(() => {
    if (!enabled) {
      setIsPlaying(false);
      return;
    }

    const phase = getRacePhase(stats);
    setCurrentPhase(phase);

    // Only play if we have a valid phase and it's different from last
    if (phase !== "none" && phase !== lastPhaseRef.current) {
      playPhaseMusic(phase);
      lastPhaseRef.current = phase;
    }
  }, [enabled, stats, currentPhase]);

  // Play sound effects based on conditions
  useEffect(() => {
    if (!enabled) return;

    // Check for bell chime at 5km intervals
    const { currentKm, totalDistance } = stats;
    const current5km = Math.floor(currentKm / 5) * 5;
    
    if (current5km > lastBellKmRef.current && current5km < totalDistance) {
      playSoundEffect("bell_chime");
      lastBellKmRef.current = current5km;
    }

    // Check other sound effects
    Object.keys(SOUND_EFFECTS).forEach((effectType) => {
      const effect = effectType as RaceSoundEffect;
      if (effect === "bell_chime") return; // Handled separately
      
      if (shouldPlaySoundEffect(effect, stats)) {
        // Play periodically
        const config = SOUND_EFFECTS[effect];
        if (!soundEffectTimersRef.current[effect]) {
          const timer = setTimeout(() => {
            playSoundEffect(effect);
            delete soundEffectTimersRef.current[effect];
          }, config.frequency * 1000);
          soundEffectTimersRef.current[effect] = timer;
        }
      } else {
        // Clear timer if condition no longer met
        if (soundEffectTimersRef.current[effect]) {
          clearTimeout(soundEffectTimersRef.current[effect]);
          soundEffectTimersRef.current[effect] = undefined;
        }
      }
    });
  }, [enabled, stats]);

  /**
   * Play music for a specific phase
   */
  const playPhaseMusic = useCallback((phase: RaceMusicPhase) => {
    if (!enabled) return;

    // Stop current music
    stopCurrentMusic();

    const track = getTrackForPhase(phase);
    if (!track) return;

    try {
      // Create audio context if it doesn't exist or is closed
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      const { synthParams, layers } = track;

      // Create main synth oscillator
      const mainOsc = ctx.createOscillator();
      const mainGain = ctx.createGain();
      
      mainOsc.type = synthParams.waveType;
      mainOsc.frequency.setValueAtTime(synthParams.baseFrequency, ctx.currentTime);
      
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(
        synthParams.intensity * 0.3,
        ctx.currentTime + 0.1
      );

      mainOsc.connect(mainGain);
      mainGain.connect(ctx.destination);

      mainOsc.start(ctx.currentTime);

      activeOscillatorsRef.current.push(mainOsc);
      activeGainNodesRef.current.push(mainGain);

      // Add bass layer
      if (layers?.bass) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        
        bassOsc.type = layers.bass.waveType;
        bassOsc.frequency.setValueAtTime(layers.bass.frequency, ctx.currentTime);
        
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(
          layers.bass.volume * synthParams.intensity,
          ctx.currentTime + 0.1
        );

        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);

        bassOsc.start(ctx.currentTime);

        activeOscillatorsRef.current.push(bassOsc);
        activeGainNodesRef.current.push(bassGain);
      }

      // Add melody layer
      if (layers?.melody) {
        playMelodyPattern(layers.melody, synthParams);
      }

      // Add drums layer
      if (layers?.drums) {
        playDrumPattern(layers.drums, track.bpm);
      }

      setIsPlaying(true);

    } catch (error) {
      console.warn("Failed to play adaptive music:", error);
    }
  }, [enabled]);

  /**
   * Play melody pattern
   */
  const playMelodyPattern = useCallback((melody: NonNullable<RaceMusicTrack["layers"]>["melody"], synthParams: RaceMusicTrack["synthParams"]) => {
    if (!melody || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const { frequencies, waveType, volume, pattern } = melody;

    // Play each note in the pattern
    pattern.forEach((noteIndex, patternIndex) => {
      const freq = frequencies[noteIndex % frequencies.length];
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + patternIndex * 0.2);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + patternIndex * 0.2);
      gain.gain.linearRampToValueAtTime(
        volume * synthParams.intensity,
        ctx.currentTime + patternIndex * 0.2 + 0.05
      );
      gain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + patternIndex * 0.2 + 0.3
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + patternIndex * 0.2);
      osc.stop(ctx.currentTime + patternIndex * 0.2 + 0.3);

      activeOscillatorsRef.current.push(osc);
      activeGainNodesRef.current.push(gain);
    });
  }, []);

  /**
   * Play drum pattern
   */
  const playDrumPattern = useCallback((drums: NonNullable<RaceMusicTrack["layers"]>["drums"], bpm: number) => {
    if (!drums || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const { kickPattern, snarePattern, bpmMultiplier } = drums;
    const effectiveBpm = bpm * bpmMultiplier;
    const beatDuration = 60 / effectiveBpm; // Duration of one beat in seconds

    // Play kick drum
    kickPattern.forEach((shouldPlay, index) => {
      if (shouldPlay) {
        playDrumHit(ctx, "kick", ctx.currentTime + index * beatDuration);
      }
    });

    // Play snare drum
    snarePattern.forEach((shouldPlay, index) => {
      if (shouldPlay) {
        playDrumHit(ctx, "snare", ctx.currentTime + index * beatDuration);
      }
    });
  }, []);

  /**
   * Play a single drum hit
   */
  const playDrumHit = useCallback((ctx: AudioContext, type: "kick" | "snare", when: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (type === "kick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(30, when + 0.1);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, when);
      filter.frequency.exponentialRampToValueAtTime(100, when + 0.1);
      
      gain.gain.setValueAtTime(0.3, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.1);
    } else { // snare
      // For noise, we need to use a workaround since Web Audio doesn't have a noise type
      // We'll use a high-frequency oscillator with random phase
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1000, when);
      
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2000, when);
      filter.frequency.exponentialRampToValueAtTime(500, when + 0.1);
      
      gain.gain.setValueAtTime(0.2, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.1);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(when);
    osc.stop(when + 0.1);

    activeOscillatorsRef.current.push(osc);
    activeGainNodesRef.current.push(gain);
  }, []);

  /**
   * Play a sound effect
   */
  const playSoundEffect = useCallback((effectType: RaceSoundEffect) => {
    if (!enabled) return;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      const config = SOUND_EFFECTS[effectType];

      switch (effectType) {
        case "heartbeat":
          playHeartbeat(ctx, config.volume);
          break;
        case "crowd_ambient":
          playCrowdAmbient(ctx, config.volume);
          break;
        case "crowd_cheer":
          playCrowdCheer(ctx, config.volume);
          break;
        case "wind_whoosh":
          playWindWhoosh(ctx, config.volume);
          break;
        case "bell_chime":
          playBellChime(ctx, config.volume);
          break;
        case "footsteps":
          playFootsteps(ctx, config.volume);
          break;
      }
    } catch (error) {
      console.warn(`Failed to play sound effect ${effectType}:`, error);
    }
  }, [enabled]);

  /**
   * Play heartbeat sound
   */
  const playHeartbeat = useCallback((ctx: AudioContext, volume: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, ctx.currentTime); // Low frequency for heartbeat
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    activeOscillatorsRef.current.push(osc);
    activeGainNodesRef.current.push(gain);
  }, []);

  /**
   * Play crowd ambient sound (filtered noise)
   */
  const playCrowdAmbient = useCallback((ctx: AudioContext, volume: number) => {
    // Create multiple oscillators with different frequencies to simulate crowd noise
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      const freq = 200 + Math.random() * 300;
      const detune = (Math.random() - 0.5) * 100;
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000 + Math.random() * 2000, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.1, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);

      activeOscillatorsRef.current.push(osc);
      activeGainNodesRef.current.push(gain);
    }
  }, []);

  /**
   * Play crowd cheer sound
   */
  const playCrowdCheer = useCallback((ctx: AudioContext, volume: number) => {
    // Create a rising noise effect for cheer
    for (let i = 0; i < 10; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      const freq = 500 + Math.random() * 1500;
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + i * 0.05 + 0.2);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, ctx.currentTime + i * 0.05);
      filter.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + i * 0.05 + 0.2);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + i * 0.05 + 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.05 + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.3);

      activeOscillatorsRef.current.push(osc);
      activeGainNodesRef.current.push(gain);
    }
  }, []);

  /**
   * Play wind whoosh sound
   */
  const playWindWhoosh = useCallback((ctx: AudioContext, volume: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Workaround for noise type
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);

    activeOscillatorsRef.current.push(osc);
    activeGainNodesRef.current.push(gain);
  }, []);

  /**
   * Play bell chime sound
   */
  const playBellChime = useCallback((ctx: AudioContext, volume: number) => {
    // Create a harmonic bell sound
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + i * 0.05 + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.5);

      activeOscillatorsRef.current.push(osc);
      activeGainNodesRef.current.push(gain);
    });
  }, []);

  /**
   * Play footsteps sound
   */
  const playFootsteps = useCallback((ctx: AudioContext, volume: number) => {
    // Create a low-frequency thump for footsteps
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.2, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);

    activeOscillatorsRef.current.push(osc);
    activeGainNodesRef.current.push(gain);
  }, []);

  /**
   * Stop current music
   */
  const stopCurrentMusic = useCallback(() => {
    activeOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    
    activeGainNodesRef.current.forEach((gain) => {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    
    activeOscillatorsRef.current = [];
    activeGainNodesRef.current = [];
    setIsPlaying(false);
  }, []);

  /**
   * Toggle music on/off
   */
  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopCurrentMusic();
    } else {
      const phase = getRacePhase(stats);
      if (phase !== "none") {
        playPhaseMusic(phase);
      }
    }
  }, [isPlaying, stats, playPhaseMusic, stopCurrentMusic]);

  return {
    currentPhase,
    isPlaying,
    playPhaseMusic,
    stopCurrentMusic,
    toggleMusic,
    playSoundEffect,
  };
}

/**
 * Hook specifically for crowd noise management
 */
export function useCrowdNoise(stats: RaceMusicStats) {
  const enabled = useSettingsStore((state) => state.settings.sound);
  const [crowdIntensity, setCrowdIntensity] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const crowdOscRef = useRef<OscillatorNode | null>(null);
  const crowdGainRef = useRef<GainNode | null>(null);

  // Calculate crowd intensity based on race stats
  useEffect(() => {
    if (!enabled) {
      setCrowdIntensity(0);
      return;
    }

    const { currentKm, totalDistance, energy, focus } = stats;
    const progress = currentKm / totalDistance;
    
    // Base intensity from progress
    let intensity = progress * 50;
    
    // Boost from good stats
    if (energy > 80) intensity += 10;
    if (focus > 80) intensity += 10;
    
    // Cap at 100
    intensity = Math.min(100, intensity);
    
    setCrowdIntensity(intensity);
    
    // Update crowd noise
    updateCrowdNoise(intensity);
  }, [enabled, stats]);

  const updateCrowdNoise = useCallback((intensity: number) => {
    if (!enabled) return;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      
      // Stop existing crowd noise
      if (crowdOscRef.current) {
        crowdOscRef.current.stop();
        crowdOscRef.current.disconnect();
      }
      if (crowdGainRef.current) {
        crowdGainRef.current.disconnect();
      }

      // Create new crowd noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      
      const volume = (intensity / 100) * 0.15;
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);

      crowdOscRef.current = osc;
      crowdGainRef.current = gain;
      
    } catch (error) {
      console.warn("Failed to update crowd noise:", error);
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (crowdOscRef.current) {
        try {
          crowdOscRef.current.stop();
          crowdOscRef.current.disconnect();
        } catch (e) {
          // Ignore errors
        }
      }
      if (crowdGainRef.current) {
        try {
          crowdGainRef.current.disconnect();
        } catch (e) {
          // Ignore errors
        }
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== "closed") {
          try {
            audioContextRef.current.close().catch(() => {});
          } catch (e) {
            // Ignore errors
          }
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    crowdIntensity,
    updateCrowdNoise,
  };
}
