#!/usr/bin/env python3
"""Machine-transcribe the spoken appearances in a queue file (for the Transcribe workflow).

A queue is a TSV in inbox/spoken/queue/ with the columns

    shard  id  kind  url  lang  [clip]

kind is "audio" (a direct media URL, such as a podcast enclosure) or
"video" (a page yt-dlp can read). lang is "en" or "auto". The optional clip
column ("HH:MM:SS-HH:MM:SS") transcribes only that stretch, for a guest
segment inside a long show; timestamps stay on the episode's clock. Each job
transcribes the rows of one shard with faster-whisper and writes
<id>.txt: a short header, then one "[HH:MM:SS] text" line per segment.
A row that fails writes <id>.error instead, so a rerun can pick it up.

These are machine transcripts. They can mishear names and words, so a quote
taken from one is checked against the audio, an official transcript or
reporting before it goes into the record.
"""
import argparse
import csv
import os
import subprocess
import sys
import time

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
# Names the model would otherwise mishear; Whisper takes them as context.
PROMPT = ('Anthropic, OpenAI, Claude, ChatGPT, GPT-4, Codex, Sam Altman, Dario Amodei, Daniela Amodei, '
          'Jack Clark, Jared Kaplan, Mike Krieger, Greg Brockman, Jason Kwon, Fidji Simo, Nick Turley, '
          'AGI, RLHF, Microsoft, Nvidia.')


def fetch(kind, url, dest):
    if kind == 'video':
        cmd = ['yt-dlp', '-q', '--no-playlist', '-f', 'bestaudio/best', '-x', '--audio-format', 'm4a',
               '-o', dest + '.%(ext)s', url]
        subprocess.run(cmd, check=True, timeout=1800)
        for ext in ('m4a', 'webm', 'mp3', 'opus'):
            if os.path.exists(f'{dest}.{ext}'):
                return f'{dest}.{ext}'
        raise RuntimeError('yt-dlp produced no audio file')
    path = dest + '.audio'
    subprocess.run(['curl', '-sSfL', '--retry', '3', '-A', UA, '-o', path, url], check=True, timeout=1800)
    if os.path.getsize(path) < 10000:
        raise RuntimeError(f'download too small ({os.path.getsize(path)} bytes)')
    return path


def seconds(hms):
    total = 0
    for part in hms.strip().split(':'):
        total = total * 60 + int(part)
    return total


def stamp(sec):
    sec = int(sec)
    return f'{sec // 3600:02d}:{sec % 3600 // 60:02d}:{sec % 60:02d}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--queue', required=True)
    ap.add_argument('--shard', required=True)
    ap.add_argument('--out', default='out')
    ap.add_argument('--model', default='small')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    rows = [r for r in csv.DictReader(open(args.queue), delimiter='\t') if r['shard'] == args.shard]
    from faster_whisper import WhisperModel
    models = {}

    def model_name(lang):
        return f'{args.model}.en' if lang == 'en' else args.model

    def model_for(lang):
        name = model_name(lang)
        if name not in models:
            models[name] = WhisperModel(name, device='cpu', compute_type='int8', cpu_threads=os.cpu_count() or 4)
        return models[name]

    for r in rows:
        rid = r['id']
        start = time.time()
        try:
            audio = fetch(r['kind'], r['url'], os.path.join('/tmp', rid))
            lang = None if r['lang'] == 'auto' else r['lang']
            clip = (r.get('clip') or '').strip()
            opts = {'vad_filter': True}
            if clip:  # faster-whisper ignores the VAD filter when given clip timestamps
                opts = {'vad_filter': False, 'clip_timestamps': [seconds(t) for t in clip.split('-')]}
            segments, info = model_for(r['lang']).transcribe(audio, language=lang, beam_size=5,
                                                             initial_prompt=PROMPT, **opts)
            lines = [f'[{stamp(s.start)}] {s.text.strip()}' for s in segments]
            with open(os.path.join(args.out, rid + '.txt'), 'w') as f:
                f.write(f'# id: {rid}\n# source: {r["url"]}\n# transcript: machine (faster-whisper {model_name(r["lang"])}, language {info.language})\n')
                f.write(f'# audio duration: {stamp(info.duration)}\n')
                f.write(f'# clip: {clip}\n\n' if clip else '\n')
                f.write('\n'.join(lines) + '\n')
            os.remove(audio)
            print(f'{rid}: {len(lines)} segments, {stamp(info.duration)} audio in {int(time.time() - start)}s', flush=True)
        except Exception as e:  # keep going; the error file says what to retry
            with open(os.path.join(args.out, rid + '.error'), 'w') as f:
                f.write(f'{r["url"]}\n{type(e).__name__}: {e}\n')
            print(f'{rid}: FAILED {e}', file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
