import { describe, expect, it } from 'vitest';
import { PRESET_PROFILES, calculateSaju } from '../../engine';
import {
  buildChapterScripts,
  buildSeohwaRoasts,
  buildShareUrl,
  decodeSharePayload,
  encodeSharePayload,
  generateViralStoryCardSvg,
} from '../storyCore';
import type { BirthInput } from '../../types/saju';

describe('Story Renewal Core (Share Codec, Seohwa Script, 9:16 Card)', () => {
  it('encodes and decodes Korean BirthInput + focusTopic symmetrically', () => {
    const input: BirthInput = {
      name: '김서연',
      gender: 'female',
      calendarType: 'lunar',
      isLeapMonth: true,
      year: 1995,
      month: 8,
      day: 15,
      hour: 23,
      minute: 35,
      unknownTime: false,
      cityId: 'seoul',
      useTrueSolarTime: true,
      useEquationOfTime: true,
      jasiMode: 'jojasi',
    };

    const token = encodeSharePayload(input, 'love');
    const decoded = decodeSharePayload(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.focusTopic).toBe('love');
    expect(decoded?.input.name).toBe('김서연');
    expect(decoded?.input.gender).toBe('female');
    expect(decoded?.input.calendarType).toBe('lunar');
    expect(decoded?.input.isLeapMonth).toBe(true);
    expect(decoded?.input.year).toBe(1995);
    expect(decoded?.input.month).toBe(8);
    expect(decoded?.input.day).toBe(15);
    expect(decoded?.input.hour).toBe(23);
    expect(decoded?.input.minute).toBe(35);
    expect(decoded?.input.jasiMode).toBe('jojasi');

    const fullUrl = buildShareUrl(input, 'wealth', 'https://cheongmyeong-saju.vercel.app/');
    const paramToken = new URL(fullUrl).searchParams.get('r');
    expect(paramToken).toBeTruthy();
    expect(decodeSharePayload(paramToken!)?.focusTopic).toBe('wealth');
  });

  it('safely returns null on invalid or out-of-range share tokens', () => {
    expect(decodeSharePayload('')).toBeNull();
    expect(decodeSharePayload('not-valid-base64!!!')).toBeNull();
    const outOfRange = encodeSharePayload({
      ...PRESET_PROFILES[0],
      year: 1999,
    });
    expect(decodeSharePayload(outOfRange)?.input.year).toBe(1999);
    expect(decodeSharePayload('eyJ2IjoyfQ')).toBeNull();
  });

  it('generates 3 chart-specific Seohwa roasts and 5 chapters', () => {
    const saju = calculateSaju({
      name: '기준일',
      gender: 'female',
      calendarType: 'solar',
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      cityId: 'seoul',
      useTrueSolarTime: false,
      jasiMode: 'yajasi',
    });

    const roasts = buildSeohwaRoasts(saju);
    expect(roasts).toHaveLength(3);
    roasts.forEach((r) => {
      expect(r.title.length).toBeGreaterThan(4);
      expect(r.roast.length).toBeGreaterThan(20);
      expect(r.warmTip.length).toBeGreaterThan(10);
    });

    const { chapters, viralOneLiner } = buildChapterScripts(saju, 'roast');
    expect(chapters).toHaveLength(5);
    expect(chapters[0].dialogue).toContain('무오일주');
    expect(viralOneLiner).toContain('무오일주');
  });

  it('produces valid 1080x1920 9:16 viral story card SVG with four-pillar Hanja', () => {
    const saju = calculateSaju({
      name: '테스터',
      gender: 'male',
      calendarType: 'solar',
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      cityId: 'seoul',
      useTrueSolarTime: false,
      jasiMode: 'yajasi',
    });

    const { viralOneLiner } = buildChapterScripts(saju, 'luck');
    const roasts = buildSeohwaRoasts(saju).map((r) => r.roast);
    const svg = generateViralStoryCardSvg(saju, viralOneLiner, roasts);

    expect(svg).toContain('width="1080" height="1920"');
    expect(svg).toContain('테스터님의 여덟 글자 명식');
    expect(svg).toContain(saju.pillars.day.stem.hanja);
    expect(svg).toContain(saju.pillars.day.branch.hanja);
    expect(svg).toContain('청명각');
  });
});
