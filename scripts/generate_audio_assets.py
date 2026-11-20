"""Generate seamless 42s Korean night BGM and Seohwa neural voice MP3 assets."""

import asyncio
import json
import subprocess
import wave
from pathlib import Path

import edge_tts
import imageio_ffmpeg
import numpy as np

SAMPLE_RATE = 44100
LOOP_SECONDS = 42.0
CROSSFADE_SECONDS = 2.0
RENDER_SECONDS = LOOP_SECONDS + CROSSFADE_SECONDS

ROOT_DIR = Path(__file__).resolve().parent.parent
VOICE_LINES_PATH = ROOT_DIR / "src" / "story" / "voiceLines.json"
BGM_OUT_PATH = ROOT_DIR / "public" / "audio" / "cheongmyeong-bgm.mp3"
VOICE_OUT_DIR = ROOT_DIR / "public" / "audio" / "voice"

TTS_VOICE = "ko-KR-SunHiNeural"
TTS_RATE = "-7%"
TTS_PITCH = "-2Hz"

# D minor Korean pentatonic pitch dictionary (Hz)
NOTES = {
    "D2": 73.416,
    "F2": 87.307,
    "G2": 97.999,
    "A2": 110.000,
    "C3": 130.813,
    "D3": 146.832,
    "F3": 174.614,
    "G3": 195.998,
    "A3": 220.000,
    "C4": 261.626,
    "D4": 293.665,
    "F4": 349.228,
    "G4": 391.995,
    "A4": 440.000,
    "C5": 523.251,
    "D5": 587.330,
    "F5": 698.456,
    "G5": 783.991,
    "A5": 880.000,
}


def synthesize_gayageum_pluck(
    freq: float,
    duration: float,
    velocity: float,
    rng: np.random.Generator,
) -> np.ndarray:
    """Physical-modeled Gayageum plucked string via Karplus-Strong + nonghyeon vibrato."""
    n_samples = int(duration * SAMPLE_RATE)
    period = max(20, int(round(SAMPLE_RATE / freq)))

    # Warm finger-plucked silk excitation (low-passed noise + soft impulse)
    exc = rng.uniform(-1.0, 1.0, size=period).astype(np.float64)
    # 3-pass smoothing to remove harsh metallic high-frequency fizz
    for _ in range(3):
        exc = 0.25 * np.roll(exc, 1) + 0.5 * exc + 0.25 * np.roll(exc, -1)
    exc -= np.mean(exc)
    peak = np.max(np.abs(exc)) or 1.0
    exc = exc / peak

    # Calibrate decay per period for natural acoustic ring (~2.8-4.5s)
    target_rt60_periods = max(120.0, freq * (3.6 - min(1.5, freq / 700.0)))
    decay = float(0.001 ** (1.0 / target_rt60_periods))
    decay = min(0.9965, max(0.965, decay))

    # Extra buffer length for pitch resampling
    n_blocks = int(np.ceil((n_samples * 1.05) / period)) + 2
    blocks = np.zeros((n_blocks, period), dtype=np.float64)
    blocks[0] = exc

    # Brightness filter coefficient: slightly warmer on lower strings
    alpha = 0.54 if freq < 260 else 0.50
    carry = exc[-1]
    for b in range(1, n_blocks):
        prev = blocks[b - 1]
        shifted = np.empty_like(prev)
        shifted[0] = carry
        shifted[1:] = prev[:-1]
        filtered = alpha * prev + (1.0 - alpha) * shifted
        blocks[b] = decay * filtered
        carry = prev[-1]

    raw = blocks.reshape(-1)

    # Exact tuning + gentle Korean nonghyeon (delayed string vibrato)
    t = np.arange(n_samples, dtype=np.float64) / SAMPLE_RATE
    base_rate = (period * freq) / SAMPLE_RATE
    vib_env = np.clip((t - 0.22) / 0.45, 0.0, 1.0)
    vib_depth = 0.0024 if freq < 450 else 0.0016
    vib_hz = 4.2
    inst_rate = base_rate * (1.0 + vib_depth * vib_env * np.sin(2.0 * np.pi * vib_hz * t))
    read_pos = np.cumsum(inst_rate)
    read_pos = np.clip(read_pos, 0.0, len(raw) - 2.0)

    idx = np.arange(len(raw), dtype=np.float64)
    plucked = np.interp(read_pos, idx, raw)

    # Gentle 4ms attack ramp & smooth tail fade to zero
    attack_len = min(n_samples, int(0.004 * SAMPLE_RATE))
    if attack_len > 1:
        plucked[:attack_len] *= np.linspace(0.0, 1.0, attack_len)
    tail_len = min(n_samples, int(0.25 * SAMPLE_RATE))
    if tail_len > 1:
        plucked[-tail_len:] *= np.linspace(1.0, 0.0, tail_len)

    return plucked * velocity


def synthesize_daegeum_swell(
    freq: float,
    duration: float,
    velocity: float,
    rng: np.random.Generator,
) -> np.ndarray:
    """Soft breathy Korean Daegeum bamboo flute swell with harmonics & breath noise."""
    n_samples = int(duration * SAMPLE_RATE)
    t = np.arange(n_samples, dtype=np.float64) / SAMPLE_RATE

    # Asymmetric meditative breath envelope
    attack_s = min(1.05, duration * 0.28)
    release_s = min(1.25, duration * 0.32)
    env = np.ones(n_samples, dtype=np.float64)
    a_n = max(1, int(attack_s * SAMPLE_RATE))
    r_n = max(1, int(release_s * SAMPLE_RATE))
    env[:a_n] = 0.5 * (1.0 - np.cos(np.pi * np.linspace(0.0, 1.0, a_n)))
    env[-r_n:] *= 0.5 * (1.0 + np.cos(np.pi * np.linspace(0.0, 1.0, r_n)))

    # Expressive pitch scoop at start + delayed warm vibrato
    scoop = -0.016 * np.exp(-t / 0.14)
    vib_env = np.clip((t - 0.45) / 0.65, 0.0, 1.0)
    vib = 0.0055 * vib_env * np.sin(2.0 * np.pi * 4.35 * t)
    inst_freq = freq * (1.0 + scoop + vib)
    phase = 2.0 * np.pi * np.cumsum(inst_freq) / SAMPLE_RATE

    # Bamboo timbre: warm fundamental + subtle cheong harmonic shimmer
    cheong_mod = 1.0 + 0.15 * np.sin(2.0 * np.pi * 1.1 * t)
    tone = (
        0.78 * np.sin(phase)
        + 0.22 * cheong_mod * np.sin(2.0 * phase + 0.15)
        + 0.075 * np.sin(3.0 * phase + 0.3)
        + 0.022 * np.sin(4.0 * phase)
    )

    # Shaped breath noise centered near 2.1 * freq
    noise = rng.normal(0.0, 1.0, size=n_samples)
    freqs = np.fft.rfftfreq(n_samples, d=1.0 / SAMPLE_RATE)
    center_hz = min(3600.0, freq * 2.15)
    bw_hz = max(240.0, center_hz * 0.48)
    band = np.exp(-0.5 * ((freqs - center_hz) / bw_hz) ** 2)
    shaped_noise = np.fft.irfft(np.fft.rfft(noise) * band, n=n_samples)
    noise_peak = np.max(np.abs(shaped_noise)) or 1.0
    shaped_noise /= noise_peak

    breath_env = env * (0.045 + 0.03 * np.exp(-t / 0.45))
    return (tone * env * 0.72 + shaped_noise * breath_env) * velocity


def synthesize_drone_pad(n_loop: int) -> np.ndarray:
    """Seamless periodic low cello/drone fifth pad (D2 + A2) over exact loop length."""
    t = np.arange(n_loop, dtype=np.float64) / SAMPLE_RATE

    def periodic_hz(target_hz: float) -> float:
        cycles = max(1, round(target_hz * LOOP_SECONDS))
        return cycles / LOOP_SECONDS

    f_d2 = periodic_hz(NOTES["D2"])
    f_a2 = periodic_hz(NOTES["A2"])
    f_d3 = periodic_hz(NOTES["D3"])
    lfo_hz = 3.0 / LOOP_SECONDS

    breath = 0.78 + 0.22 * np.sin(2.0 * np.pi * lfo_hz * t - 0.6)

    def warm_voice(f_hz: float, phase_offset: float) -> np.ndarray:
        p = 2.0 * np.pi * f_hz * t + phase_offset
        return 0.76 * np.sin(p) + 0.19 * np.sin(2.0 * p) + 0.05 * np.sin(3.0 * p)

    left = (
        0.54 * warm_voice(f_d2, 0.0)
        + 0.34 * warm_voice(f_a2, 0.35)
        + 0.14 * warm_voice(f_d3, 0.8)
    ) * breath

    right = (
        0.54 * warm_voice(f_d2, 0.22)
        + 0.34 * warm_voice(f_a2, 0.62)
        + 0.14 * warm_voice(f_d3, 1.15)
    ) * (0.78 + 0.22 * np.sin(2.0 * np.pi * lfo_hz * t + 0.3))

    return np.stack([left, right], axis=1) * 0.145


def schroeder_comb(
    x: np.ndarray,
    delay: int,
    feedback: float,
    damp: float,
) -> np.ndarray:
    """Exact block-vectorized Schroeder low-pass feedback comb filter."""
    n = len(x)
    n_blocks = int(np.ceil(n / delay))
    padded = np.zeros(n_blocks * delay, dtype=np.float64)
    padded[:n] = x

    x_blocks = padded.reshape(n_blocks, delay)
    y_blocks = np.zeros_like(x_blocks)
    y_blocks[0] = x_blocks[0]

    carry = 0.0
    for b in range(1, n_blocks):
        prev = y_blocks[b - 1]
        shifted = np.empty_like(prev)
        shifted[0] = carry
        shifted[1:] = prev[:-1]
        damped = (1.0 - damp) * prev + damp * shifted
        y_blocks[b] = x_blocks[b] + feedback * damped
        carry = prev[-1]

    return y_blocks.reshape(-1)[:n]


def schroeder_allpass(x: np.ndarray, delay: int, gain: float = 0.5) -> np.ndarray:
    """Exact block-vectorized Schroeder allpass diffuser."""
    n = len(x)
    n_blocks = int(np.ceil(n / delay))
    padded = np.zeros(n_blocks * delay, dtype=np.float64)
    padded[:n] = x

    x_blocks = padded.reshape(n_blocks, delay)
    w_blocks = np.zeros_like(x_blocks)
    y_blocks = np.zeros_like(x_blocks)

    for b in range(n_blocks):
        delayed = w_blocks[b - 1] if b > 0 else np.zeros(delay, dtype=np.float64)
        w = x_blocks[b] + gain * delayed
        w_blocks[b] = w
        y_blocks[b] = -gain * w + delayed

    return y_blocks.reshape(-1)[:n]


def apply_stereo_reverb(dry: np.ndarray) -> np.ndarray:
    """Apply stereo Schroeder comb + allpass hall reverb."""
    comb_delays_l = [1557, 1617, 1491, 1422]
    allpass_delays_l = [225, 556]
    stereo_spread = 23

    out = np.zeros_like(dry)
    for ch in range(2):
        offset = ch * stereo_spread
        sig = dry[:, ch]
        comb_sum = np.zeros_like(sig)
        for d in comb_delays_l:
            comb_sum += schroeder_comb(sig, delay=d + offset, feedback=0.76, damp=0.38)
        wet = comb_sum * 0.25
        for d in allpass_delays_l:
            wet = schroeder_allpass(wet, delay=d + offset, gain=0.5)
        out[:, ch] = dry[:, ch] * 0.68 + wet * 0.36
    return out


def mix_note_stereo(
    buf: np.ndarray,
    mono_note: np.ndarray,
    start_sec: float,
    pan: float,
) -> None:
    """Place a mono note into stereo buffer at start_sec with equal-power pan (-1..1)."""
    idx0 = int(round(start_sec * SAMPLE_RATE))
    if idx0 >= len(buf):
        return
    avail = min(len(mono_note), len(buf) - idx0)
    if avail <= 0:
        return
    angle = (np.clip(pan, -1.0, 1.0) + 1.0) * (np.pi / 4.0)
    gain_l = float(np.cos(angle))
    gain_r = float(np.sin(angle))
    seg = mono_note[:avail]
    buf[idx0 : idx0 + avail, 0] += seg * gain_l
    buf[idx0 : idx0 + avail, 1] += seg * gain_r


def generate_night_bgm(out_mp3_path: Path) -> None:
    """Synthesize 42s seamless Korean nocturnal Gayageum + Daegeum + Drone BGM."""
    rng = np.random.default_rng(20261121)
    n_render = int(round(RENDER_SECONDS * SAMPLE_RATE))
    n_loop = int(round(LOOP_SECONDS * SAMPLE_RATE))
    n_fade = int(round(CROSSFADE_SECONDS * SAMPLE_RATE))

    dry_melody = np.zeros((n_render, 2), dtype=np.float64)

    # Meditative nocturnal Gayageum arpeggios & poetic pauses (start_sec, note, dur, vel, pan)
    gayageum_score = [
        # Phrase 1 (0.8s - 10.5s): D minor opening mist
        (0.80, "D3", 4.2, 0.34, -0.22),
        (1.65, "A3", 3.8, 0.28, -0.10),
        (2.45, "D4", 3.6, 0.31, 0.08),
        (3.30, "F4", 3.4, 0.29, 0.20),
        (4.25, "A4", 3.8, 0.26, 0.26),
        (6.40, "G4", 3.2, 0.25, 0.14),
        (7.35, "F4", 3.2, 0.26, 0.04),
        (8.30, "D4", 3.8, 0.30, -0.08),
        # Phrase 2 (10.8s - 21.0s): F major nocturnal lift
        (10.80, "F3", 4.3, 0.33, -0.24),
        (11.70, "C4", 3.8, 0.28, -0.10),
        (12.55, "F4", 3.6, 0.31, 0.08),
        (13.45, "A4", 3.6, 0.29, 0.22),
        (14.35, "C5", 4.0, 0.24, 0.28),
        (16.65, "A4", 3.2, 0.24, 0.16),
        (17.65, "G4", 3.4, 0.25, 0.02),
        (18.75, "F4", 3.6, 0.28, -0.12),
        # Phrase 3 (21.2s - 31.5s): G suspended contemplation & quiet breath
        (21.20, "G3", 4.4, 0.32, -0.20),
        (22.15, "D4", 3.8, 0.28, -0.06),
        (23.05, "G4", 3.6, 0.29, 0.10),
        (23.95, "A4", 3.5, 0.27, 0.22),
        (24.90, "C5", 3.8, 0.23, 0.26),
        (25.85, "D5", 4.1, 0.20, 0.30),
        (28.30, "A4", 3.4, 0.24, 0.12),
        (29.40, "F4", 3.6, 0.26, -0.05),
        # Phrase 4 (31.8s - 38.2s): C -> D minor serene return
        (31.80, "C3", 4.0, 0.31, -0.25),
        (32.75, "G3", 3.6, 0.27, -0.12),
        (33.65, "C4", 3.5, 0.28, 0.04),
        (34.60, "F4", 3.4, 0.26, 0.16),
        (35.60, "D3", 4.4, 0.34, -0.18),
        (36.45, "A3", 4.0, 0.27, -0.04),
        (37.25, "D4", 4.2, 0.30, 0.10),
        (38.05, "A4", 3.8, 0.23, 0.22),
    ]

    for start_s, note_name, dur, vel, pan in gayageum_score:
        pluck = synthesize_gayageum_pluck(NOTES[note_name], dur, vel, rng)
        mix_note_stereo(dry_melody, pluck, start_s, pan)

    # Breathy Daegeum long-tone phrases floating gently above the strings
    daegeum_score = [
        (3.40, "A4", 3.8, 0.145, -0.16),
        (7.20, "G4", 3.2, 0.125, -0.10),
        (13.60, "D5", 4.0, 0.130, 0.15),
        (17.70, "C5", 3.6, 0.120, 0.08),
        (24.30, "F4", 3.8, 0.135, -0.14),
        (28.00, "G4", 3.4, 0.130, -0.05),
        (32.50, "A4", 4.6, 0.140, 0.12),
    ]

    for start_s, note_name, dur, vel, pan in daegeum_score:
        flute = synthesize_daegeum_swell(NOTES[note_name], dur, vel, rng)
        mix_note_stereo(dry_melody, flute, start_s, pan)

    # Hall reverb over plucked strings + bamboo flute
    wet_melody = apply_stereo_reverb(dry_melody)

    # 2-second seamless loop crossfade wrapping tail (42-44s) back into head (0-2s)
    w_in = 0.5 * (1.0 - np.cos(np.pi * np.linspace(0.0, 1.0, n_fade)))
    w_out = 1.0 - w_in
    w_in_col = w_in[:, np.newaxis]
    w_out_col = w_out[:, np.newaxis]

    loop_melody = wet_melody[:n_loop].copy()
    loop_melody[:n_fade] = (
        wet_melody[:n_fade] * w_in_col
        + wet_melody[n_loop : n_loop + n_fade] * w_out_col
    )

    # Combine with exact-period D2+A2 drone pad
    drone = synthesize_drone_pad(n_loop)
    master = loop_melody + drone

    # Gentle soft limiter & normalization to -1.5 dBFS
    peak = float(np.max(np.abs(master))) or 1.0
    if peak > 0.84:
        master = master * (0.84 / peak)
    else:
        master = master * (0.82 / max(peak, 0.4))
    master = np.tanh(master * 1.08) / np.tanh(1.08) * 0.84

    pcm = np.clip(np.round(master * 32767.0), -32768, 32767).astype(np.int16)

    out_mp3_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_wav_path = out_mp3_path.with_suffix(".tmp.wav")

    try:
        with wave.open(str(tmp_wav_path), "wb") as wf:
            wf.setnchannels(2)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(pcm.tobytes())

        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        subprocess.run(
            [
                ffmpeg_exe,
                "-y",
                "-i",
                str(tmp_wav_path),
                "-c:a",
                "libmp3lame",
                "-b:a",
                "128k",
                "-ar",
                str(SAMPLE_RATE),
                "-ac",
                "2",
                str(out_mp3_path),
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    finally:
        tmp_wav_path.unlink(missing_ok=True)


async def synthesize_single_voice(
    key: str,
    text: str,
    out_dir: Path,
    semaphore: asyncio.Semaphore,
) -> None:
    """Generate one Korean neural female voice MP3 via edge-tts with retry."""
    out_path = out_dir / f"{key}.mp3"
    async with semaphore:
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(
                    text,
                    voice=TTS_VOICE,
                    rate=TTS_RATE,
                    pitch=TTS_PITCH,
                )
                await comm.save(str(out_path))
                if out_path.exists() and out_path.stat().st_size > 1024:
                    return
            except Exception as exc:  # noqa: BLE001
                last_err = exc
                await asyncio.sleep(0.8 * (attempt + 1))
        raise RuntimeError(f"Failed TTS for '{key}': {last_err}")


async def generate_all_voices() -> None:
    """Read src/story/voiceLines.json and generate all 12 voice MP3 files."""
    if not VOICE_LINES_PATH.exists():
        raise FileNotFoundError(f"Missing voice script JSON: {VOICE_LINES_PATH}")

    voice_lines: dict[str, str] = json.loads(
        VOICE_LINES_PATH.read_text(encoding="utf-8")
    )
    VOICE_OUT_DIR.mkdir(parents=True, exist_ok=True)

    semaphore = asyncio.Semaphore(3)
    tasks = [
        synthesize_single_voice(key, text, VOICE_OUT_DIR, semaphore)
        for key, text in voice_lines.items()
    ]
    await asyncio.gather(*tasks)


def main() -> None:
    print("[audio] Synthesizing 42s seamless Korean night BGM...")
    generate_night_bgm(BGM_OUT_PATH)
    print(f"[audio] BGM ready: {BGM_OUT_PATH} ({BGM_OUT_PATH.stat().st_size} bytes)")

    print("[audio] Synthesizing 12 Seohwa Korean neural voice MP3s...")
    asyncio.run(generate_all_voices())
    mp3s = sorted(VOICE_OUT_DIR.glob("*.mp3"))
    print(f"[audio] Generated {len(mp3s)} voice MP3s in {VOICE_OUT_DIR}")


if __name__ == "__main__":
    main()
