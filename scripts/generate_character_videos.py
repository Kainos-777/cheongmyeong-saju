"""Generate seamless looping 6-second 24fps H.264 living portraits for Seohwa.

Reads the 4 PNG portraits in ``public/character/`` and composites:
1. Seamless periodic breathing & micro-zoom (zero-jump 144-frame loop)
2. Warm candlelight rim shimmer + subtle moonlight counter-glow
3. 18 drifting golden stardust & moonlight bokeh particles with periodic vertical wrap
4. Deep ``#07080d`` radial + bottom vignette fade so videos melt into the canvas

Streams RGB24 frames directly to ``imageio_ffmpeg`` over stdin without temp files.
"""

from __future__ import annotations

import math
import subprocess
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageOps

WIDTH = 640
HEIGHT = 800
FPS = 24
DURATION_SEC = 6
TOTAL_FRAMES = FPS * DURATION_SEC  # 144 frames

# Exact #07080d canvas tone for seamless perimeter blending
BG_UINT8 = (7, 8, 13)
BG_FLOAT = np.array(BG_UINT8, dtype=np.float32) / 255.0

EXPRESSIONS = ("mystic", "smirk", "focus", "warm")

EXPRESSION_WARMTH = {
    "mystic": 1.00,
    "smirk": 1.08,
    "focus": 0.94,
    "warm": 1.20,
}

EXPRESSION_SEEDS = {
    "mystic": 107,
    "smirk": 211,
    "focus": 307,
    "warm": 409,
}

BASE_OVERSCAN = 1.012


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def load_base_portrait(png_path: Path) -> Image.Image:
    """Load PNG portrait, flatten any alpha onto #07080d, and fit cleanly to 4:5."""
    with Image.open(png_path) as raw:
        if raw.mode in ("RGBA", "LA") or (
            raw.mode == "P" and "transparency" in raw.info
        ):
            rgba = raw.convert("RGBA")
            backdrop = Image.new("RGBA", rgba.size, (*BG_UINT8, 255))
            rgb = Image.alpha_composite(backdrop, rgba).convert("RGB")
        else:
            rgb = raw.convert("RGB")

    # Keep high resolution (>= 960x1200) so sub-pixel crop/zoom always downsamples smoothly.
    target_w = max(960, rgb.width)
    target_h = round(target_w * HEIGHT / WIDTH)
    return ImageOps.fit(
        rgb,
        (target_w, target_h),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.40),
    )


def build_lighting_maps() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Precompute spatial candlelight and moonlight glow masks on (HEIGHT, WIDTH)."""
    ys = (np.arange(HEIGHT, dtype=np.float32) + 0.5) / HEIGHT
    xs = (np.arange(WIDTH, dtype=np.float32) + 0.5) / WIDTH
    yy, xx = np.meshgrid(ys, xs, indexing="ij")

    # Right shoulder, sleeve & hair rim warm candlelight aura
    d2_candle_main = ((xx - 0.75) / 0.36) ** 2 + ((yy - 0.64) / 0.42) ** 2
    map_candle_main = np.exp(-1.70 * d2_candle_main).astype(np.float32)

    # Soft lower-center collar, fan/hands & cheek warmth
    d2_face_warm = ((xx - 0.50) / 0.34) ** 2 + ((yy - 0.64) / 0.36) ** 2
    map_face_warm = np.exp(-1.85 * d2_face_warm).astype(np.float32)

    # Left shoulder & hair rim flicker
    d2_left_rim = ((xx - 0.24) / 0.32) ** 2 + ((yy - 0.60) / 0.38) ** 2
    map_left_rim = np.exp(-2.00 * d2_left_rim).astype(np.float32)

    # Subtle upper-left moonlight counter-rim for depth
    d2_moon = ((xx - 0.20) / 0.34) ** 2 + ((yy - 0.28) / 0.34) ** 2
    map_moon = np.exp(-2.00 * d2_moon).astype(np.float32)

    return map_candle_main, map_face_warm, map_left_rim, map_moon


def build_vignette_mask() -> np.ndarray:
    """Precompute radial + bottom vignette fading smoothly to exact #07080d edges."""
    ys = (np.arange(HEIGHT, dtype=np.float32) + 0.5) / HEIGHT
    xs = (np.arange(WIDTH, dtype=np.float32) + 0.5) / WIDTH
    yy, xx = np.meshgrid(ys, xs, indexing="ij")

    u = (xx - 0.50) / 0.50
    v = (yy - 0.42) / 0.56
    r = np.sqrt(u * u + v * v)
    radial_keep = 1.0 - smoothstep(0.66, 1.04, r)

    # Smooth bottom melt into #07080d while keeping hands/collar crisp
    bottom_keep = 1.0 - smoothstep(0.75, 0.99, yy)

    # Crisp edge feathering around outer borders so no rectangular seam ever shows
    left_keep = smoothstep(0.0, 0.08, xx)
    right_keep = smoothstep(0.0, 0.08, 1.0 - xx)
    top_keep = smoothstep(0.0, 0.055, yy)

    mask = radial_keep * bottom_keep * left_keep * right_keep * top_keep
    return mask[:, :, None].astype(np.float32)


def build_particles(seed: int) -> list[dict[str, object]]:
    """Create 18 deterministic golden stardust & moonlight bokeh particles."""
    rng = np.random.default_rng(seed)
    particles: list[dict[str, object]] = []

    for idx in range(18):
        is_bokeh = idx < 6

        # Bias most particles to frame the silhouette rather than crossing eyes
        if idx % 3 == 0:
            x0 = float(rng.uniform(0.08, 0.34) * WIDTH)
        elif idx % 3 == 1:
            x0 = float(rng.uniform(0.66, 0.92) * WIDTH)
        else:
            x0 = float(rng.uniform(0.32, 0.68) * WIDTH)

        y0 = float(rng.uniform(0.0, HEIGHT))

        # Exact integer cycle counts ensure (y0 - speed * 144) % H == y0 % H
        cycles = 2 if (not is_bokeh and idx in (7, 11, 15)) else 1
        speed = (cycles * HEIGHT) / TOTAL_FRAMES

        if is_bokeh:
            radius = int(rng.integers(14, 24))
            sigma = float(rng.uniform(5.8, 10.5))
            base_alpha = float(rng.uniform(0.18, 0.32))
            if idx % 2 == 0:
                color = np.array([0.98, 0.80, 0.42], dtype=np.float32)  # warm gold
            else:
                color = np.array([0.74, 0.85, 1.00], dtype=np.float32)  # moonlight
            sway_amp = float(rng.uniform(4.0, 10.0))
        else:
            radius = int(rng.integers(5, 9))
            sigma = float(rng.uniform(1.6, 2.8))
            base_alpha = float(rng.uniform(0.45, 0.82))
            if idx % 3 == 0:
                color = np.array([1.00, 0.90, 0.62], dtype=np.float32)  # bright stardust
            else:
                color = np.array([0.94, 0.73, 0.34], dtype=np.float32)  # amber dust
            sway_amp = float(rng.uniform(2.5, 6.5))

        sway_phase = float(rng.uniform(0.0, 2.0 * math.pi))
        twinkle_mult = int(rng.choice([1, 2]))
        twinkle_phase = float(rng.uniform(0.0, 2.0 * math.pi))

        # Precompute static 2D radial sprite kernel
        grid = np.arange(-radius, radius + 1, dtype=np.float32)
        dy_g, dx_g = np.meshgrid(grid, grid, indexing="ij")
        r2 = dx_g * dx_g + dy_g * dy_g
        if is_bokeh:
            kernel = 0.82 * np.exp(-0.5 * r2 / (sigma * sigma)) + 0.18 * np.exp(
                -0.5 * r2 / ((0.38 * sigma) ** 2)
            )
        else:
            core_s = max(0.85, sigma * 0.45)
            kernel = 0.58 * np.exp(-0.5 * r2 / (core_s * core_s)) + 0.42 * np.exp(
                -0.5 * r2 / (sigma * sigma)
            )
        # Taper softly to 0 at patch border so bounding boxes have no hard edge
        edge_fade = np.clip(1.0 - np.sqrt(r2) / (radius + 0.5), 0.0, 1.0)
        kernel = (kernel * edge_fade).astype(np.float32)

        particles.append(
            {
                "x0": x0,
                "y0": y0,
                "speed": speed,
                "radius": radius,
                "base_alpha": base_alpha,
                "color": color,
                "sway_amp": sway_amp,
                "sway_phase": sway_phase,
                "twinkle_mult": twinkle_mult,
                "twinkle_phase": twinkle_phase,
                "kernel": kernel,
            }
        )

    return particles


def render_portrait_video(
    expression: str,
    png_path: Path,
    mp4_path: Path,
    ffmpeg_exe: str,
    lighting_maps: tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray],
    vignette_mask: np.ndarray,
) -> None:
    """Render one seamless 6-second 24fps H.264 MP4 from a source PNG portrait."""
    base_img = load_base_portrait(png_path)
    base_w, base_h = base_img.size

    map_candle_main, map_face_warm, map_left_rim, map_moon = lighting_maps
    warmth_gain = EXPRESSION_WARMTH.get(expression, 1.0)
    particles = build_particles(EXPRESSION_SEEDS.get(expression, 101))

    candle_rgb = np.array([1.00, 0.75, 0.38], dtype=np.float32)
    moon_rgb = np.array([0.52, 0.68, 1.00], dtype=np.float32)

    mp4_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        ffmpeg_exe,
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-pix_fmt",
        "rgb24",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "24",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        "-an",
        str(mp4_path),
    ]

    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert proc.stdin is not None
    assert proc.stderr is not None

    try:
        for frame_idx in range(TOTAL_FRAMES):
            theta = 2.0 * math.pi * frame_idx / TOTAL_FRAMES

            # 1. Seamless periodic breathing & micro-zoom
            scale = 1.016 + 0.016 * math.sin(theta)
            dy_out = 3.5 * math.sin(theta - 0.5)
            dx_out = 1.1 * math.cos(theta - 0.3)

            eff_scale = BASE_OVERSCAN * scale
            crop_w = base_w / eff_scale
            crop_h = base_h / eff_scale

            cx = base_w * 0.5 + dx_out * (base_w / WIDTH)
            cy = base_h * 0.5 + dy_out * (base_h / HEIGHT)

            x0 = max(0.0, min(base_w - crop_w, cx - crop_w * 0.5))
            y0 = max(0.0, min(base_h - crop_h, cy - crop_h * 0.5))
            box = (x0, y0, x0 + crop_w, y0 + crop_h)

            warped = base_img.resize(
                (WIDTH, HEIGHT),
                resample=Image.Resampling.BICUBIC,
                box=box,
            )
            frame = np.asarray(warped, dtype=np.float32) * (1.0 / 255.0)

            # 2. Warm candlelight rim shimmer + subtle moonlight counter-rim
            luma = (
                frame[:, :, 0] * 0.299
                + frame[:, :, 1] * 0.587
                + frame[:, :, 2] * 0.114
            )
            surface_catch = np.clip((luma - 0.04) / 0.32, 0.0, 1.0)
            surface_factor = 0.18 + 0.82 * surface_catch

            pulse_a = 0.52 + 0.30 * math.sin(theta) + 0.18 * math.sin(2.0 * theta + 0.85)
            pulse_b = 0.52 + 0.28 * math.sin(theta - 1.15) + 0.16 * math.sin(2.0 * theta - 0.35)
            pulse_moon = 0.50 + 0.35 * math.cos(theta + 0.6) + 0.15 * math.sin(2.0 * theta)

            candle_field = (
                warmth_gain
                * surface_factor
                * (
                    0.145 * pulse_a * (0.75 * map_candle_main + 0.55 * map_face_warm)
                    + 0.085 * pulse_b * map_left_rim
                )
            )
            moon_field = surface_factor * (0.045 * pulse_moon * map_moon)

            glow_rgb = (
                candle_field[:, :, None] * candle_rgb[None, None, :]
                + moon_field[:, :, None] * moon_rgb[None, None, :]
            )
            frame = frame + glow_rgb * (1.0 - 0.55 * frame)

            # 3. Drifting golden stardust & moonlight bokeh (exact periodic vertical wrap)
            for p in particles:
                py = (float(p["y0"]) - float(p["speed"]) * frame_idx) % HEIGHT
                px = float(p["x0"]) + float(p["sway_amp"]) * math.sin(
                    theta + float(p["sway_phase"])
                )

                edge_alpha = math.sin(math.pi * py / HEIGHT)
                twinkle = 0.65 + 0.35 * math.sin(
                    int(p["twinkle_mult"]) * theta + float(p["twinkle_phase"])
                )
                alpha = float(p["base_alpha"]) * edge_alpha * twinkle
                if alpha <= 0.004:
                    continue

                r = int(p["radius"])
                cx_i = int(round(px))
                cy_i = int(round(py))

                px0 = max(0, cx_i - r)
                px1 = min(WIDTH, cx_i + r + 1)
                py0 = max(0, cy_i - r)
                py1 = min(HEIGHT, cy_i + r + 1)
                if px0 >= px1 or py0 >= py1:
                    continue

                kx0 = px0 - (cx_i - r)
                kx1 = kx0 + (px1 - px0)
                ky0 = py0 - (cy_i - r)
                ky1 = ky0 + (py1 - py0)

                kernel_slice: np.ndarray = p["kernel"][ky0:ky1, kx0:kx1]  # type: ignore[index]
                color: np.ndarray = p["color"]  # type: ignore[assignment]
                patch_add = alpha * kernel_slice[:, :, None] * color[None, None, :]

                roi = frame[py0:py1, px0:px1]
                frame[py0:py1, px0:px1] = roi + patch_add * (1.0 - 0.35 * roi)

            # 4. Deep #07080d radial + bottom vignette fade
            np.clip(frame, 0.0, 1.0, out=frame)
            frame = BG_FLOAT + (frame - BG_FLOAT) * vignette_mask

            rgb_bytes = np.clip(frame * 255.0 + 0.5, 0.0, 255.0).astype(np.uint8).tobytes()
            proc.stdin.write(rgb_bytes)

        proc.stdin.close()
        stderr_output = proc.stderr.read().decode("utf-8", errors="replace")
        returncode = proc.wait()
        if returncode != 0:
            raise RuntimeError(
                f"ffmpeg failed for {png_path.name} (exit {returncode}):\n{stderr_output}"
            )
    except Exception:
        proc.kill()
        proc.wait()
        raise


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    char_dir = project_root / "public" / "character"
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    lighting_maps = build_lighting_maps()
    vignette_mask = build_vignette_mask()

    generated = 0
    for expr in EXPRESSIONS:
        png_path = char_dir / f"seohwa-{expr}.png"
        mp4_path = char_dir / f"seohwa-{expr}.mp4"
        if not png_path.exists():
            print(f"[skip] Missing portrait: {png_path}")
            continue

        print(f"[render] {png_path.name} -> {mp4_path.name} ({WIDTH}x{HEIGHT}, {TOTAL_FRAMES}f @ {FPS}fps)")
        render_portrait_video(
            expression=expr,
            png_path=png_path,
            mp4_path=mp4_path,
            ffmpeg_exe=ffmpeg_exe,
            lighting_maps=lighting_maps,
            vignette_mask=vignette_mask,
        )
        size_kb = mp4_path.stat().st_size / 1024.0
        print(f"[done] {mp4_path.name}: {size_kb:.1f} KB")
        generated += 1

    print(f"Finished: {generated}/{len(EXPRESSIONS)} portrait video(s) generated.")


if __name__ == "__main__":
    main()
