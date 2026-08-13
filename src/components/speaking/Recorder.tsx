'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The speaking recorder.
 *
 * It runs the real sequence — read the prompt, prepare against a clock, then
 * speak against a clock that does not stop — because rehearsing under the
 * actual constraint is most of what this task requires.
 *
 * While recording it captures two things beyond the audio:
 *  - a loudness envelope sampled from the Web Audio analyser, which yields
 *    genuine pause and articulation measurements rather than guesses;
 *  - a transcript from the browser's own speech recognition where available,
 *    at no cost to the learner, with a manual fallback that is clearly labelled
 *    as such so the analysis never pretends to have heard something it did not.
 */

type Phase = 'ready' | 'preparing' | 'recording' | 'review' | 'submitting';

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

export function Recorder({
  taskSlug,
  prepSeconds,
  speakSeconds,
  successCriteria,
}: {
  taskSlug: string;
  prepSeconds: number;
  speakSeconds: number;
  successCriteria: string[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('ready');
  const [countdown, setCountdown] = useState(prepSeconds);
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [transcriptSource, setTranscriptSource] = useState<'browser_asr' | 'manual' | 'none'>('none');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [asrAvailable, setAsrAvailable] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const envelope = useRef<{ tMs: number; rms: number }[]>([]);
  const startedAt = useRef(0);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscript = useRef('');
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    setAsrAvailable(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
    try {
      recognition.current?.stop();
    } catch {
      /* recognition may already be stopped */
    }
    recognition.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.state === 'recording' && mediaRecorder.current.stop();
    setPhase('review');
  }, []);

  const beginRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const context = new AudioContext();
      audioContext.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      envelope.current = [];
      startedAt.current = performance.now();

      const sample = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        const tMs = performance.now() - startedAt.current;
        // ~25 samples per second is enough to resolve a 200 ms pause and keeps
        // the payload small.
        if (!envelope.current.length || tMs - envelope.current[envelope.current.length - 1].tMs >= 40) {
          envelope.current.push({ tMs: Math.round(tMs), rms: Math.round(rms * 10000) / 10000 });
        }
        setLevel(rms);
        rafRef.current = requestAnimationFrame(sample);
      };
      rafRef.current = requestAnimationFrame(sample);

      const mimeType = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType ?? 'audio/webm' });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        cleanup();
      };
      mediaRecorder.current = recorder;
      recorder.start(250);

      const w = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
      const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (Recognition) {
        const engine = new Recognition();
        engine.continuous = true;
        engine.interimResults = true;
        engine.lang = 'en-CA';
        finalTranscript.current = '';
        engine.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) finalTranscript.current += `${result[0].transcript} `;
            else interim += result[0].transcript;
          }
          setTranscript(`${finalTranscript.current}${interim}`.trim());
          setTranscriptSource('browser_asr');
        };
        engine.onerror = () => {
          /* recognition failures degrade to the manual transcript path */
        };
        recognition.current = engine;
        try {
          engine.start();
        } catch {
          /* some browsers throw when start is called twice */
        }
      }

      setPhase('recording');
      setCountdown(speakSeconds);
    } catch {
      setError(
        'Microphone access was refused or is unavailable. Recording needs permission; you can still type a transcript below to get content feedback.',
      );
      setPhase('review');
    }
  }, [cleanup, speakSeconds]);

  /* ---- clocks ---- */
  useEffect(() => {
    if (phase !== 'preparing' && phase !== 'recording') return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          if (phase === 'preparing') void beginRecording();
          else stopRecording();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, beginRecording, stopRecording]);

  const submit = useCallback(async () => {
    setPhase('submitting');
    setError(null);

    const durationMs = envelope.current.length
      ? envelope.current[envelope.current.length - 1].tMs
      : 0;

    const form = new FormData();
    form.set(
      'meta',
      JSON.stringify({
        taskSlug,
        transcript: transcript.trim(),
        transcriptSource: transcript.trim() ? transcriptSource : 'none',
        durationMs: durationMs || speakSeconds * 1000,
        envelope: envelope.current,
      }),
    );
    if (blobRef.current) form.set('audio', blobRef.current, 'response.webm');

    try {
      const response = await fetch('/api/speaking/submit', { method: 'POST', body: form });
      const data = (await response.json()) as { ok?: boolean; redirect?: string; error?: string };
      if (!response.ok || !data.redirect) {
        setError(data.error ?? 'Submission failed. Your recording is still here — try again.');
        setPhase('review');
        return;
      }
      router.push(data.redirect);
    } catch {
      setError('Submission failed. Your recording is still here — try again.');
      setPhase('review');
    }
  }, [router, speakSeconds, taskSlug, transcript, transcriptSource]);

  const reset = useCallback(() => {
    blobRef.current = null;
    envelope.current = [];
    setAudioUrl(null);
    setTranscript('');
    setTranscriptSource('none');
    setPhase('ready');
    setCountdown(prepSeconds);
    setError(null);
  }, [prepSeconds]);

  return (
    <div className="stack stack-5">
      {phase === 'ready' ? (
        <div className="panel stack stack-4">
          <div className="stack stack-2">
            <p className="eyebrow">Before you start</p>
            <p className="small measure-wide">
              You get {prepSeconds} seconds to prepare and {speakSeconds} seconds to speak. The clock does not stop
              and there is no pause — that is the point of practising it this way.
            </p>
          </div>
          <details>
            <summary className="small" style={{ cursor: 'pointer' }}>
              What a strong response does
            </summary>
            <ul className="stack stack-2" style={{ marginTop: 'var(--s3)', paddingLeft: '1.1rem' }}>
              {successCriteria.map((criterion, i) => (
                <li key={i} className="small muted">
                  {criterion}
                </li>
              ))}
            </ul>
          </details>
          <p className="tiny faint">
            {asrAvailable
              ? 'Your browser can transcribe as you speak, on your device. Without a transcript only delivery can be analysed.'
              : 'This browser has no speech recognition, so you will be asked to type what you said. Delivery is measured from the recording either way.'}
          </p>
          <button
            className="btn btn-primary btn-lg"
            type="button"
            onClick={() => {
              setPhase('preparing');
              setCountdown(prepSeconds);
            }}
          >
            Start preparation
          </button>
        </div>
      ) : null}

      {phase === 'preparing' ? (
        <div className="panel stack stack-4">
          <div className="row-between">
            <p className="eyebrow">Preparation</p>
            <span className="badge badge-caution numeric" style={{ fontSize: '1rem' }}>
              {countdown}s
            </span>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (not scored, not submitted)</label>
            <textarea
              id="notes"
              className="textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="The shape, not the words: your position, two reasons, one example."
            />
          </div>
          <button className="btn" type="button" onClick={() => void beginRecording()}>
            Start speaking now
          </button>
        </div>
      ) : null}

      {phase === 'recording' ? (
        <div className="panel stack stack-4">
          <div className="row-between">
            <p className="eyebrow" style={{ color: 'var(--critical)' }}>
              Recording
            </p>
            <span className={`badge numeric ${countdown <= 10 ? 'badge-critical' : ''}`} style={{ fontSize: '1rem' }}>
              {countdown}s left
            </span>
          </div>

          <div
            className="meter"
            role="img"
            aria-label={`Input level ${Math.round(Math.min(1, level * 8) * 100)} per cent`}
            style={{ height: 8 }}
          >
            <span style={{ width: `${Math.min(100, level * 800)}%`, transition: 'width 80ms linear' }} />
          </div>

          {notes ? (
            <div className="inset">
              <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
                Your notes
              </p>
              <p className="small" style={{ whiteSpace: 'pre-wrap' }}>
                {notes}
              </p>
            </div>
          ) : null}

          {transcript ? (
            <p className="small muted" aria-live="polite" style={{ minHeight: '3rem' }}>
              {transcript}
            </p>
          ) : null}

          <button className="btn" type="button" onClick={stopRecording}>
            Stop early
          </button>
        </div>
      ) : null}

      {phase === 'review' || phase === 'submitting' ? (
        <div className="panel stack stack-4">
          <p className="eyebrow">Your response</p>

          {error ? <p className="error-text">{error}</p> : null}

          {audioUrl ? (
            <audio controls src={audioUrl} style={{ width: '100%' }}>
              Your browser does not support audio playback.
            </audio>
          ) : null}

          <div className="field">
            <label htmlFor="transcript">
              Transcript {transcriptSource === 'browser_asr' ? '(from speech recognition — correct it if needed)' : '(type what you said)'}
            </label>
            <textarea
              id="transcript"
              className="textarea"
              rows={6}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (transcriptSource !== 'browser_asr') setTranscriptSource('manual');
              }}
              placeholder="Without a transcript, only your delivery can be analysed — pacing, pauses and time use, but not structure, development or vocabulary."
            />
            <p className="hint">
              {transcriptSource === 'browser_asr'
                ? 'Speech recognition adds its own errors and no punctuation. Fixing obvious mistakes makes the grammar findings more reliable.'
                : 'A typed transcript is treated as accurate; the analysis will say so.'}
            </p>
          </div>

          <div className="row wrap">
            <button className="btn btn-primary" type="button" onClick={() => void submit()} disabled={phase === 'submitting'}>
              {phase === 'submitting' ? 'Analysing…' : 'Submit for analysis'}
            </button>
            <button className="btn" type="button" onClick={reset} disabled={phase === 'submitting'}>
              Record again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
