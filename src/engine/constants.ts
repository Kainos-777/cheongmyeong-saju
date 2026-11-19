import type {
  BirthCity,
  BranchInfo,
  ElementKey,
  StemInfo,
} from '../types/saju';

export interface ElementMeta {
  key: ElementKey;
  labelKo: string;
  labelHanja: string;
  colorToken: string;
  directionKo: string;
  seasonKo: string;
  organKo: string;
  luckyColors: { name: string; hex: string }[];
  luckyNumbers: number[];
}

export const ELEMENT_ORDER: ElementKey[] = [
  'wood',
  'fire',
  'earth',
  'metal',
  'water',
];

export const ELEMENT_META: Record<ElementKey, ElementMeta> = {
  wood: {
    key: 'wood',
    labelKo: '목',
    labelHanja: '木',
    colorToken: 'var(--color-wood)',
    directionKo: '동쪽 (東)',
    seasonKo: '봄',
    organKo: '간·담·신경계',
    luckyColors: [
      { name: '비취 에메랄드', hex: '#34D399' },
      { name: '청자 딥그린', hex: '#059669' },
    ],
    luckyNumbers: [3, 8],
  },
  fire: {
    key: 'fire',
    labelKo: '화',
    labelHanja: '火',
    colorToken: 'var(--color-fire)',
    directionKo: '남쪽 (南)',
    seasonKo: '여름',
    organKo: '심장·혈관·시각',
    luckyColors: [
      { name: '단청 주홍', hex: '#F97316' },
      { name: '코랄 로즈', hex: '#FB7185' },
    ],
    luckyNumbers: [2, 7],
  },
  earth: {
    key: 'earth',
    labelKo: '토',
    labelHanja: '土',
    colorToken: 'var(--color-earth)',
    directionKo: '중앙 (中央)',
    seasonKo: '환절기',
    organKo: '위장·비장·소화기',
    luckyColors: [
      { name: '천명 앰버 골드', hex: '#FBBF24' },
      { name: '테라코타 샌드', hex: '#D97706' },
    ],
    luckyNumbers: [5, 10],
  },
  metal: {
    key: 'metal',
    labelKo: '금',
    labelHanja: '金',
    colorToken: 'var(--color-metal)',
    directionKo: '서쪽 (西)',
    seasonKo: '가을',
    organKo: '폐·호흡기·피부',
    luckyColors: [
      { name: '백자 실버', hex: '#E2E8F0' },
      { name: '플래티넘 그레이', hex: '#94A3B8' },
    ],
    luckyNumbers: [4, 9],
  },
  water: {
    key: 'water',
    labelKo: '수',
    labelHanja: '水',
    colorToken: 'var(--color-water)',
    directionKo: '북쪽 (北)',
    seasonKo: '겨울',
    organKo: '신장·방광·순환계',
    luckyColors: [
      { name: '심해 코발트', hex: '#38BDF8' },
      { name: '먹빛 인디고', hex: '#1E3A8A' },
    ],
    luckyNumbers: [1, 6],
  },
};

export const ELEMENT_GENERATES: Record<ElementKey, ElementKey> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

export const ELEMENT_GENERATED_BY: Record<ElementKey, ElementKey> = {
  wood: 'water',
  fire: 'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal',
};

export const ELEMENT_CONTROLS: Record<ElementKey, ElementKey> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

export const ELEMENT_CONTROLLED_BY: Record<ElementKey, ElementKey> = {
  wood: 'metal',
  earth: 'wood',
  water: 'earth',
  fire: 'water',
  metal: 'fire',
};

export const STEMS: StemInfo[] = [
  { index: 0, hanja: '甲', hangul: '갑', element: 'wood', polarity: 'yang' },
  { index: 1, hanja: '乙', hangul: '을', element: 'wood', polarity: 'yin' },
  { index: 2, hanja: '丙', hangul: '병', element: 'fire', polarity: 'yang' },
  { index: 3, hanja: '丁', hangul: '정', element: 'fire', polarity: 'yin' },
  { index: 4, hanja: '戊', hangul: '무', element: 'earth', polarity: 'yang' },
  { index: 5, hanja: '己', hangul: '기', element: 'earth', polarity: 'yin' },
  { index: 6, hanja: '庚', hangul: '경', element: 'metal', polarity: 'yang' },
  { index: 7, hanja: '辛', hangul: '신', element: 'metal', polarity: 'yin' },
  { index: 8, hanja: '壬', hangul: '임', element: 'water', polarity: 'yang' },
  { index: 9, hanja: '癸', hangul: '계', element: 'water', polarity: 'yin' },
];

export const BRANCHES: BranchInfo[] = [
  {
    index: 0,
    hanja: '子',
    hangul: '자',
    animal: '쥐',
    element: 'water',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 8, hanja: '壬', hangul: '임', element: 'water', role: '여기', weight: 0.333 },
      { stemIndex: 9, hanja: '癸', hangul: '계', element: 'water', role: '정기', weight: 0.667 },
    ],
  },
  {
    index: 1,
    hanja: '丑',
    hangul: '축',
    animal: '소',
    element: 'earth',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 9, hanja: '癸', hangul: '계', element: 'water', role: '여기', weight: 0.3 },
      { stemIndex: 7, hanja: '辛', hangul: '신', element: 'metal', role: '중기', weight: 0.1 },
      { stemIndex: 5, hanja: '己', hangul: '기', element: 'earth', role: '정기', weight: 0.6 },
    ],
  },
  {
    index: 2,
    hanja: '寅',
    hangul: '인',
    animal: '호랑이',
    element: 'wood',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '여기', weight: 0.233 },
      { stemIndex: 2, hanja: '丙', hangul: '병', element: 'fire', role: '중기', weight: 0.233 },
      { stemIndex: 0, hanja: '甲', hangul: '갑', element: 'wood', role: '정기', weight: 0.534 },
    ],
  },
  {
    index: 3,
    hanja: '卯',
    hangul: '묘',
    animal: '토끼',
    element: 'wood',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 0, hanja: '甲', hangul: '갑', element: 'wood', role: '여기', weight: 0.333 },
      { stemIndex: 1, hanja: '乙', hangul: '을', element: 'wood', role: '정기', weight: 0.667 },
    ],
  },
  {
    index: 4,
    hanja: '辰',
    hangul: '진',
    animal: '용',
    element: 'earth',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 1, hanja: '乙', hangul: '을', element: 'wood', role: '여기', weight: 0.3 },
      { stemIndex: 9, hanja: '癸', hangul: '계', element: 'water', role: '중기', weight: 0.1 },
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '정기', weight: 0.6 },
    ],
  },
  {
    index: 5,
    hanja: '巳',
    hangul: '사',
    animal: '뱀',
    element: 'fire',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '여기', weight: 0.233 },
      { stemIndex: 6, hanja: '庚', hangul: '경', element: 'metal', role: '중기', weight: 0.233 },
      { stemIndex: 2, hanja: '丙', hangul: '병', element: 'fire', role: '정기', weight: 0.534 },
    ],
  },
  {
    index: 6,
    hanja: '午',
    hangul: '오',
    animal: '말',
    element: 'fire',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 2, hanja: '丙', hangul: '병', element: 'fire', role: '여기', weight: 0.333 },
      { stemIndex: 5, hanja: '己', hangul: '기', element: 'earth', role: '중기', weight: 0.3 },
      { stemIndex: 3, hanja: '丁', hangul: '정', element: 'fire', role: '정기', weight: 0.367 },
    ],
  },
  {
    index: 7,
    hanja: '未',
    hangul: '미',
    animal: '양',
    element: 'earth',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 3, hanja: '丁', hangul: '정', element: 'fire', role: '여기', weight: 0.3 },
      { stemIndex: 1, hanja: '乙', hangul: '을', element: 'wood', role: '중기', weight: 0.1 },
      { stemIndex: 5, hanja: '己', hangul: '기', element: 'earth', role: '정기', weight: 0.6 },
    ],
  },
  {
    index: 8,
    hanja: '申',
    hangul: '신',
    animal: '원숭이',
    element: 'metal',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '여기', weight: 0.233 },
      { stemIndex: 8, hanja: '壬', hangul: '임', element: 'water', role: '중기', weight: 0.233 },
      { stemIndex: 6, hanja: '庚', hangul: '경', element: 'metal', role: '정기', weight: 0.534 },
    ],
  },
  {
    index: 9,
    hanja: '酉',
    hangul: '유',
    animal: '닭',
    element: 'metal',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 6, hanja: '庚', hangul: '경', element: 'metal', role: '여기', weight: 0.333 },
      { stemIndex: 7, hanja: '辛', hangul: '신', element: 'metal', role: '정기', weight: 0.667 },
    ],
  },
  {
    index: 10,
    hanja: '戌',
    hangul: '술',
    animal: '개',
    element: 'earth',
    polarity: 'yang',
    hiddenStems: [
      { stemIndex: 7, hanja: '辛', hangul: '신', element: 'metal', role: '여기', weight: 0.3 },
      { stemIndex: 3, hanja: '丁', hangul: '정', element: 'fire', role: '중기', weight: 0.1 },
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '정기', weight: 0.6 },
    ],
  },
  {
    index: 11,
    hanja: '亥',
    hangul: '해',
    animal: '돼지',
    element: 'water',
    polarity: 'yin',
    hiddenStems: [
      { stemIndex: 4, hanja: '戊', hangul: '무', element: 'earth', role: '여기', weight: 0.233 },
      { stemIndex: 0, hanja: '甲', hangul: '갑', element: 'wood', role: '중기', weight: 0.233 },
      { stemIndex: 8, hanja: '壬', hangul: '임', element: 'water', role: '정기', weight: 0.534 },
    ],
  },
];

export interface GapjaEntry {
  index: number;
  stemIndex: number;
  branchIndex: number;
  hangul: string;
  hanja: string;
  stem: StemInfo;
  branch: BranchInfo;
}

export const SIXTY_GAPJA: GapjaEntry[] = Array.from({ length: 60 }, (_, index) => {
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return {
    index,
    stemIndex,
    branchIndex,
    hangul: `${stem.hangul}${branch.hangul}`,
    hanja: `${stem.hanja}${branch.hanja}`,
    stem,
    branch,
  };
});

export const TEN_GOD_NAMES = [
  '비견',
  '겁재',
  '식신',
  '상관',
  '편재',
  '정재',
  '편관',
  '정관',
  '편인',
  '정인',
] as const;

export type TenGodName = (typeof TEN_GOD_NAMES)[number];

export interface TenGodMeta {
  name: TenGodName;
  hanja: string;
  group: '비겁' | '식상' | '재성' | '관성' | '인성';
  shortDesc: string;
}

export const TEN_GOD_META: Record<TenGodName, TenGodMeta> = {
  비견: { name: '비견', hanja: '比肩', group: '비겁', shortDesc: '주체성, 동료, 독립적 추진력' },
  겁재: { name: '겁재', hanja: '劫財', group: '비겁', shortDesc: '경쟁심, 돌파력, 승부사 기질' },
  식신: { name: '식신', hanja: '食神', group: '식상', shortDesc: '창작 몰입, 장인정신, 풍요로움' },
  상관: { name: '상관', hanja: '傷官', group: '식상', shortDesc: '예리한 표현력, 혁신, 기존 틀 타파' },
  편재: { name: '편재', hanja: '偏財', group: '재성', shortDesc: '유연한 확장성, 사업 감각, 공간 장악' },
  정재: { name: '정재', hanja: '正財', group: '재성', shortDesc: '체계적 실용성, 안정적 자산 축적' },
  편관: { name: '편관', hanja: '偏官', group: '관성', shortDesc: '카리스마, 책임감, 위기 돌파' },
  정관: { name: '정관', hanja: '正官', group: '관성', shortDesc: '질서와 품격, 명예, 시스템 조율' },
  편인: { name: '편인', hanja: '偏印', group: '인성', shortDesc: '직관적 통찰, 독창적 발상, 철학적 사유' },
  정인: { name: '정인', hanja: '正印', group: '인성', shortDesc: '따뜻한 수용력, 학문, 정통적 지혜' },
};

/**
 * Compute Ten God (십성) of a target stem relative to the Day Master (일간).
 */
export function getTenGodForStem(dayMaster: StemInfo, target: StemInfo): TenGodName {
  const dmElIdx = ELEMENT_ORDER.indexOf(dayMaster.element);
  const tgElIdx = ELEMENT_ORDER.indexOf(target.element);
  const diff = (tgElIdx - dmElIdx + 5) % 5;
  const samePolarity = dayMaster.polarity === target.polarity;

  switch (diff) {
    case 0:
      return samePolarity ? '비견' : '겁재';
    case 1:
      return samePolarity ? '식신' : '상관';
    case 2:
      return samePolarity ? '편재' : '정재';
    case 3:
      return samePolarity ? '편관' : '정관';
    case 4:
      return samePolarity ? '편인' : '정인';
    default:
      return '비견';
  }
}

/**
 * Compute Ten God (십성) of a branch using its primary hidden stem (정기).
 */
export function getTenGodForBranch(dayMaster: StemInfo, branch: BranchInfo): TenGodName {
  const mainHidden = branch.hiddenStems[branch.hiddenStems.length - 1];
  const mainStem = STEMS[mainHidden.stemIndex];
  return getTenGodForStem(dayMaster, mainStem);
}

export const TWELVE_STAGES = [
  '장생',
  '목욕',
  '관대',
  '건록',
  '제왕',
  '쇠',
  '병',
  '사',
  '묘',
  '절',
  '태',
  '양',
] as const;

export type TwelveStageName = (typeof TWELVE_STAGES)[number];

/**
 * Starting branch index (장생지) for each of the 10 stems (0..9).
 * Yang stems proceed forward (+1); Yin stems proceed backward (-1) (양순음역).
 */
export const TWELVE_STAGE_START_BRANCH: readonly number[] = [
  11, // 갑(0, 양): 해(11)
  6,  // 을(1, 음): 오(6)
  2,  // 병(2, 양): 인(2)
  9,  // 정(3, 음): 유(9)
  2,  // 무(4, 양): 인(2) - 화토동법
  9,  // 기(5, 음): 유(9) - 화토동법
  5,  // 경(6, 양): 사(5)
  0,  // 신(7, 음): 자(0)
  8,  // 임(8, 양): 신(8)
  3,  // 계(9, 음): 묘(3)
];

/**
 * Precomputed 10x12 table: TWELVE_STAGE_TABLE[stemIndex][branchIndex] -> stage name.
 */
export const TWELVE_STAGE_TABLE: Record<number, Record<number, TwelveStageName>> = (() => {
  const table: Record<number, Record<number, TwelveStageName>> = {};
  for (let s = 0; s < 10; s++) {
    table[s] = {};
    const startBranch = TWELVE_STAGE_START_BRANCH[s];
    const isYang = s % 2 === 0;
    for (let b = 0; b < 12; b++) {
      const offset = isYang
        ? (b - startBranch + 12) % 12
        : (startBranch - b + 12) % 12;
      table[s][b] = TWELVE_STAGES[offset];
    }
  }
  return table;
})();

export function getTwelveStage(stemIndex: number, branchIndex: number): TwelveStageName {
  return TWELVE_STAGE_TABLE[((stemIndex % 10) + 10) % 10][((branchIndex % 12) + 12) % 12];
}

export interface SolarTermMeta {
  index: number;
  name: string;
  hanja: string;
  longitudeDeg: number;
  isJie: boolean;
  monthBranchIndex?: number;
}

/**
 * 24 Solar Terms ordered by ecliptic longitude 0..345 deg (step 15 deg).
 * isJie = true marks the 12 month-boundary 절입 instants (절기).
 * isJie = false marks the 12 principal terms 중기.
 */
export const SOLAR_TERMS: SolarTermMeta[] = [
  { index: 0, name: '춘분', hanja: '春分', longitudeDeg: 0, isJie: false },
  { index: 1, name: '청명', hanja: '淸明', longitudeDeg: 15, isJie: true, monthBranchIndex: 4 },
  { index: 2, name: '곡우', hanja: '穀雨', longitudeDeg: 30, isJie: false },
  { index: 3, name: '입하', hanja: '立夏', longitudeDeg: 45, isJie: true, monthBranchIndex: 5 },
  { index: 4, name: '소만', hanja: '小滿', longitudeDeg: 60, isJie: false },
  { index: 5, name: '망종', hanja: '芒種', longitudeDeg: 75, isJie: true, monthBranchIndex: 6 },
  { index: 6, name: '하지', hanja: '夏至', longitudeDeg: 90, isJie: false },
  { index: 7, name: '소서', hanja: '小暑', longitudeDeg: 105, isJie: true, monthBranchIndex: 7 },
  { index: 8, name: '대서', hanja: '大暑', longitudeDeg: 120, isJie: false },
  { index: 9, name: '입추', hanja: '立秋', longitudeDeg: 135, isJie: true, monthBranchIndex: 8 },
  { index: 10, name: '처서', hanja: '處暑', longitudeDeg: 150, isJie: false },
  { index: 11, name: '백로', hanja: '白露', longitudeDeg: 165, isJie: true, monthBranchIndex: 9 },
  { index: 12, name: '추분', hanja: '秋分', longitudeDeg: 180, isJie: false },
  { index: 13, name: '한로', hanja: '寒露', longitudeDeg: 195, isJie: true, monthBranchIndex: 10 },
  { index: 14, name: '상강', hanja: '霜降', longitudeDeg: 210, isJie: false },
  { index: 15, name: '입동', hanja: '立冬', longitudeDeg: 225, isJie: true, monthBranchIndex: 11 },
  { index: 16, name: '소설', hanja: '小雪', longitudeDeg: 240, isJie: false },
  { index: 17, name: '대설', hanja: '大雪', longitudeDeg: 255, isJie: true, monthBranchIndex: 0 },
  { index: 18, name: '동지', hanja: '冬至', longitudeDeg: 270, isJie: false },
  { index: 19, name: '소한', hanja: '小寒', longitudeDeg: 285, isJie: true, monthBranchIndex: 1 },
  { index: 20, name: '대한', hanja: '大寒', longitudeDeg: 300, isJie: false },
  { index: 21, name: '입춘', hanja: '立春', longitudeDeg: 315, isJie: true, monthBranchIndex: 2 },
  { index: 22, name: '우수', hanja: '雨水', longitudeDeg: 330, isJie: false },
  { index: 23, name: '경칩', hanja: '驚蟄', longitudeDeg: 345, isJie: true, monthBranchIndex: 3 },
];

export const SOLAR_TERM_INDEX = {
  CHUNBUN: 0,
  CHEONGMYEONG: 1,
  GOGU: 2,
  IPHA: 3,
  SOMAN: 4,
  MANGJONG: 5,
  HAJI: 6,
  SOSEO: 7,
  DAESEO: 8,
  IPCHU: 9,
  CHEOSEO: 10,
  BAEKRO: 11,
  CHUBUN: 12,
  HALLO: 13,
  SANGGANG: 14,
  IPDONG: 15,
  SOSEOL: 16,
  DAESEOL: 17,
  DONGJI: 18,
  SOHAN: 19,
  DAEHAN: 20,
  IPCHUN: 21,
  USU: 22,
  GYEONGCHIP: 23,
} as const;

export const BIRTH_CITIES: BirthCity[] = [
  { id: 'seoul', nameKo: '서울', nameEn: 'Seoul', country: '대한민국', longitude: 126.978, utcOffsetMinutes: 540 },
  { id: 'busan', nameKo: '부산', nameEn: 'Busan', country: '대한민국', longitude: 129.075, utcOffsetMinutes: 540 },
  { id: 'incheon', nameKo: '인천', nameEn: 'Incheon', country: '대한민국', longitude: 126.705, utcOffsetMinutes: 540 },
  { id: 'daegu', nameKo: '대구', nameEn: 'Daegu', country: '대한민국', longitude: 128.601, utcOffsetMinutes: 540 },
  { id: 'daejeon', nameKo: '대전', nameEn: 'Daejeon', country: '대한민국', longitude: 127.385, utcOffsetMinutes: 540 },
  { id: 'gwangju', nameKo: '광주', nameEn: 'Gwangju', country: '대한민국', longitude: 126.853, utcOffsetMinutes: 540 },
  { id: 'ulsan', nameKo: '울산', nameEn: 'Ulsan', country: '대한민국', longitude: 129.311, utcOffsetMinutes: 540 },
  { id: 'jeju', nameKo: '제주', nameEn: 'Jeju', country: '대한민국', longitude: 126.531, utcOffsetMinutes: 540 },
  { id: 'suwon', nameKo: '수원', nameEn: 'Suwon', country: '대한민국', longitude: 127.029, utcOffsetMinutes: 540 },
  { id: 'tokyo', nameKo: '도쿄', nameEn: 'Tokyo', country: '일본', longitude: 139.692, utcOffsetMinutes: 540 },
  { id: 'new_york', nameKo: '뉴욕', nameEn: 'New York', country: '미국', longitude: -74.006, utcOffsetMinutes: -300 },
  { id: 'los_angeles', nameKo: 'LA', nameEn: 'Los Angeles', country: '미국', longitude: -118.244, utcOffsetMinutes: -480 },
  { id: 'london', nameKo: '런던', nameEn: 'London', country: '영국', longitude: -0.128, utcOffsetMinutes: 0 },
  { id: 'paris', nameKo: '파리', nameEn: 'Paris', country: '프랑스', longitude: 2.352, utcOffsetMinutes: 60 },
  { id: 'sydney', nameKo: '시드니', nameEn: 'Sydney', country: '호주', longitude: 151.209, utcOffsetMinutes: 600 },
];
