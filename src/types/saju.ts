export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type Polarity = 'yang' | 'yin';
export type Gender = 'male' | 'female';
export type CalendarType = 'solar' | 'lunar';
export type JasiMode = 'yajasi' | 'jojasi';

export interface BirthCity {
  id: string;
  nameKo: string;
  nameEn: string;
  country: string;
  longitude: number;
  utcOffsetMinutes: number;
}

export interface ResolvedBirthPlace {
  cityId: string;
  label: string;
  matchedName: string;
  country: string;
  longitude: number;
  latitude?: number;
  utcOffsetMinutes: number;
  matched: boolean;
  source: 'preset' | 'gazetteer' | 'online' | 'custom' | 'fallback';
  regionElement: ElementKey;
  regionDirectionKo: string;
  regionNote: string;
}

export interface BirthInput {
  id?: string;
  name: string;
  gender: Gender;
  calendarType: CalendarType;
  isLeapMonth?: boolean;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  unknownTime?: boolean;
  cityId: string;
  birthPlace?: string;
  birthLongitude?: number;
  birthUtcOffsetMinutes?: number;
  useTrueSolarTime: boolean;
  useEquationOfTime?: boolean;
  jasiMode: JasiMode;
}

export interface StemInfo {
  index: number;
  hanja: string;
  hangul: string;
  element: ElementKey;
  polarity: Polarity;
}

export interface HiddenStemItem {
  stemIndex: number;
  hanja: string;
  hangul: string;
  element: ElementKey;
  role: '여기' | '중기' | '정기';
  weight: number;
}

export interface BranchInfo {
  index: number;
  hanja: string;
  hangul: string;
  animal: string;
  element: ElementKey;
  polarity: Polarity;
  hiddenStems: HiddenStemItem[];
}

export interface HiddenStemTenGod {
  hangul: string;
  hanja: string;
  element: ElementKey;
  tenGod: string;
  role: '여기' | '중기' | '정기';
  weight: number;
}

export type PillarKey = 'year' | 'month' | 'day' | 'hour';

export interface Pillar {
  key: PillarKey;
  labelKo: string;
  labelHanja: string;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: string;
  branchTenGod: string;
  twelveStage: string;
  hiddenStemTenGods: HiddenStemTenGod[];
  shensha: string[];
  isUnknown?: boolean;
}

export interface ElementScore {
  element: ElementKey;
  labelKo: string;
  labelHanja: string;
  rawScore: number;
  percentage: number;
  count: number;
  status: '과다' | '적정' | '부족' | '결핍';
}

export interface PillarInteraction {
  type:
    | '천간합'
    | '천간충'
    | '지지육합'
    | '삼합'
    | '방합'
    | '지지충'
    | '형'
    | '파'
    | '해'
    | '원진';
  label: string;
  pillars: PillarKey[];
  sentiment: 'positive' | 'neutral' | 'caution';
  description: string;
}

export interface ShenshaItem {
  name: string;
  hanja: string;
  category: '길신' | '흉살' | '중성';
  pillar: PillarKey | 'chart';
  description: string;
}

export interface DaewoonCycle {
  index: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: string;
  branchTenGod: string;
  twelveStage: string;
  favorabilityScore: number;
  summary: string;
}

export interface SewoonYear {
  year: number;
  age: number;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: string;
  branchTenGod: string;
  favorabilityScore: number;
  keyword: string;
  summary: string;
}

export interface MonthlyFortune {
  month: number;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: string;
  score: number;
  keyword: string;
}

export interface DailyFortune {
  dateStr: string;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: string;
  score: number;
  headline: string;
  advice: string;
  luckyColor: ElementKey;
  luckyDirection: string;
}

export interface SajuInterpretation {
  iljuTitle: string;
  iljuAnimal: string;
  archetype: string;
  coreSummary: string;
  personalityStrengths: string[];
  growthChallenges: string[];
  careerDesignStyle: string;
  loveStyle: string;
  wealthStyle: string;
  healthAdvice: string;
  luckyElements: ElementKey[];
  luckyColors: { name: string; hex: string; element: ElementKey }[];
  luckyDirection: string;
  luckyNumbers: number[];
}

export interface SajuResult {
  input: BirthInput;
  birthPlace: ResolvedBirthPlace;
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  trueSolarTimeOffsetMin: number;
  adjustedTimeStr: string;
  solarTermName: string;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  dayMaster: StemInfo;
  elements: ElementScore[];
  dominantElement: ElementKey;
  lackingElement: ElementKey;
  yinYangRatio: {
    yang: number;
    yin: number;
  };
  strength: {
    level: '극신강' | '신강' | '중화' | '신약' | '극신약';
    score: number;
    summary: string;
  };
  gyeokguk: {
    name: string;
    hanja: string;
    description: string;
  };
  yongshin: {
    primary: ElementKey;
    secondary: ElementKey;
    avoidElement: ElementKey;
    reason: string;
  };
  interactions: PillarInteraction[];
  shensha: ShenshaItem[];
  daewoonDirection: '순행' | '역행';
  daewoonStartAge: number;
  daewoon: DaewoonCycle[];
  sewoon: SewoonYear[];
  monthly: MonthlyFortune[];
  today: DailyFortune;
  interpretation: SajuInterpretation;
}

export interface CompatibilityResult {
  personA: SajuResult;
  personB: SajuResult;
  overallScore: number;
  grade: string;
  headline: string;
  dimensions: {
    label: string;
    score: number;
    summary: string;
  }[];
  highlights: {
    type: 'harmony' | 'tension' | 'complement';
    title: string;
    detail: string;
  }[];
  advice: string;
}
