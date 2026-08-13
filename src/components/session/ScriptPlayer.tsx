'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScriptTurn {
  speaker: string;
  voice: string;
  text: string;
}

const VOICE_PROFILES: Record<string, { rate: number; pitch: number; match: string[] }> = {
  narrator: { rate: 0.97, pitch: 1.0, match: ['daniel', 'ryan', 'uk english male', 'george'] },
  speaker_a: { rate: 1.02, pitch: 1.08, match: ['samantha', 'aria', 'us english', 'jenny', 'female'] },
  speaker_b: { rate: 0.99, pitch: 0.9, match: ['alex', 'guy', 'uk english male', 'male'] },
  speaker_c: { rate: 1.05, pitch: 1.16, match: ['karen', 'moira', 'sonia', 'female'] },
  reporter: { rate: 0.95, pitch: 1.02, match: ['uk english female', 'sonia', 'moira', 'female'] },
};

/**
 * Listening audio is synthesised in the browser.
 *
 * This is a deliberate architectural choice, not a stopgap for its own sake:
 * it costs the learner nothing, works without a network once voices are
 * installed, and guarantees every learner hears the same script. The player
 * assigns a distinct rate and pitch per speaker role and inserts a real pause
 * between turns, which is what makes a multi-voice conversation followable.
 *
 * `lib/providers/audioUrlFor()` is the seam for pre-recorded audio: when a
 * recording exists for a stimulus, this component plays the file instead and
 * nothing else changes.
 */
export function ScriptPlayer({
  turns,
  audioUrl,
  allowReplay,
  onFinished,
}: {
  turns: ScriptTurn[];
  audioUrl: string | null;
  allowReplay: boolean;
  onFinished?: () => void;
}) {
  const [state, setState] = useState<'idle' | 'playing' | 'paused' | 'done'>('idle');
  const [current, setCurrent] = useState(-1);
  const [supported, setSupported] = useState(true);
  const [plays, setPlays] = useState(0);
  const cancelled = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const pickVoice = useCallback((role: string) => {
    const profile = VOICE_PROFILES[role] ?? VOICE_PROFILES.narrator;
    const voices = voicesRef.current.filter((v) => v.lang.toLowerCase().startsWith('en'));
    for (const needle of profile.match) {
      const found = voices.find((v) => v.name.toLowerCase().includes(needle));
      if (found) return found;
    }
    return voices[0];
  }, []);

  const speakTurn = useCallback(
    (turn: ScriptTurn) =>
      new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(turn.text);
        const profile = VOICE_PROFILES[turn.voice] ?? VOICE_PROFILES.narrator;
        const voice = pickVoice(turn.voice);
        if (voice) utterance.voice = voice;
        utterance.rate = profile.rate;
        utterance.pitch = profile.pitch;
        utterance.lang = voice?.lang ?? 'en-CA';
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      }),
    [pickVoice],
  );

  const play = useCallback(async () => {
    if (!supported) return;
    cancelled.current = false;
    setState('playing');
    setPlays((n) => n + 1);
    window.speechSynthesis.cancel();

    for (let i = 0; i < turns.length; i++) {
      if (cancelled.current) return;
      setCurrent(i);
      await speakTurn(turns[i]);
      if (cancelled.current) return;
      await new Promise((r) => setTimeout(r, 420));
    }

    setCurrent(-1);
    setState('done');
    onFinished?.();
  }, [supported, turns, speakTurn, onFinished]);

  const stop = useCallback(() => {
    cancelled.current = true;
    window.speechSynthesis.cancel();
    setCurrent(-1);
    setState('done');
    onFinished?.();
  }, [onFinished]);

  if (audioUrl) {
    return (
      <audio controls src={audioUrl} style={{ width: '100%' }}>
        Your browser does not support audio playback.
      </audio>
    );
  }

  if (!supported) {
    return (
      <div className="inset stack stack-3">
        <p className="small">
          This browser cannot synthesise the audio, so the transcript is shown instead. Answering from a transcript
          practises reading, not listening — use a browser with speech synthesis for a realistic attempt.
        </p>
        <details>
          <summary className="small" style={{ cursor: 'pointer' }}>
            Show transcript
          </summary>
          <div className="stack stack-2" style={{ marginTop: 'var(--s3)' }}>
            {turns.map((turn, i) => (
              <p key={i} className="small">
                <strong>{turn.speaker}:</strong> {turn.text}
              </p>
            ))}
          </div>
        </details>
      </div>
    );
  }

  const canPlay = state === 'idle' || (allowReplay && state === 'done');

  return (
    <div className="stack stack-3">
      <div className="row wrap">
        <button type="button" className="btn btn-primary" onClick={play} disabled={!canPlay}>
          {state === 'idle' ? 'Play audio' : state === 'playing' ? 'Playing…' : 'Play again'}
        </button>
        {state === 'playing' ? (
          <button type="button" className="btn btn-ghost" onClick={stop}>
            Stop
          </button>
        ) : null}
        <p className="tiny faint">
          {allowReplay
            ? plays > 0
              ? `Played ${plays} time${plays === 1 ? '' : 's'} · replay is on because this set is untimed`
              : 'Replay is available in untimed practice'
            : 'You hear this once, as in the test'}
        </p>
      </div>

      {state === 'playing' && current >= 0 ? (
        <p className="small muted" aria-live="polite">
          Now speaking: {turns[current].speaker}
        </p>
      ) : null}

      {state === 'idle' ? (
        <p className="small muted">
          {turns.length} turn{turns.length === 1 ? '' : 's'}. Take notes while you listen — you will not get the
          transcript until you submit.
        </p>
      ) : null}
    </div>
  );
}
