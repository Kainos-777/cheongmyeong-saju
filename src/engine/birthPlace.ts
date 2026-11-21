import type { BirthInput, ElementKey, ResolvedBirthPlace } from '../types/saju';
import { BIRTH_CITIES } from './constants';

export interface BirthPlaceCatalogEntry {
  id: string;
  nameKo: string;
  regionLabel: string;
  country: string;
  longitude: number;
  latitude: number;
  utcOffsetMinutes: number;
  kind: 'city' | 'province' | 'global';
  aliases: string[];
}

export const BIRTH_PLACE_CATALOG: BirthPlaceCatalogEntry[] = [
  // Metro & Major Korean Cities
  { id: 'seoul', nameKo: '서울', regionLabel: '서울특별시', country: '대한민국', longitude: 126.978, latitude: 37.5665, utcOffsetMinutes: 540, kind: 'city', aliases: ['강남', '서초', '송파', '강동', '강북', '강서', '관악', '광진', '구로', '금천', '노원', '도봉', '동대문', '동작', '마포', '서대문', '성동', '성북', '양천', '영등포', '용산', '은평', '종로', '중구', '중랑', '여의도', '잠실', '홍대', '명동', 'seoul'] },
  { id: 'busan', nameKo: '부산', regionLabel: '부산광역시', country: '대한민국', longitude: 129.075, latitude: 35.1796, utcOffsetMinutes: 540, kind: 'city', aliases: ['해운대', '광안리', '서면', '사하', '사상', '동래', '연제', '수영', '남구', '부산진', '영도', '금정', '기장', '강서구', 'busan'] },
  { id: 'incheon', nameKo: '인천', regionLabel: '인천광역시', country: '대한민국', longitude: 126.705, latitude: 37.4563, utcOffsetMinutes: 540, kind: 'city', aliases: ['송도', '청라', '부평', '계양', '남동', '미추홀', '연수', '영종', '강화', '옹진', 'incheon'] },
  { id: 'daegu', nameKo: '대구', regionLabel: '대구광역시', country: '대한민국', longitude: 128.601, latitude: 35.8714, utcOffsetMinutes: 540, kind: 'city', aliases: ['수성', '달서', '달성', '동성로', '칠성', '북구', 'daegu'] },
  { id: 'daejeon', nameKo: '대전', regionLabel: '대전광역시', country: '대한민국', longitude: 127.385, latitude: 36.3504, utcOffsetMinutes: 540, kind: 'city', aliases: ['유성', '대덕', '둔산', '대전서구', '대전동구', '대전중구', 'daejeon'] },
  { id: 'gwangju', nameKo: '광주', regionLabel: '광주광역시', country: '대한민국', longitude: 126.853, latitude: 35.1595, utcOffsetMinutes: 540, kind: 'city', aliases: ['광산', '상무', '첨단', '광주광역', 'gwangju'] },
  { id: 'ulsan', nameKo: '울산', regionLabel: '울산광역시', country: '대한민국', longitude: 129.311, latitude: 35.5384, utcOffsetMinutes: 540, kind: 'city', aliases: ['울주', '삼산', 'ulsan'] },
  { id: 'sejong', nameKo: '세종', regionLabel: '세종특별자치시', country: '대한민국', longitude: 127.289, latitude: 36.4801, utcOffsetMinutes: 540, kind: 'city', aliases: ['조치원', '세종시', 'sejong'] },

  // Gyeonggi
  { id: 'suwon', nameKo: '수원', regionLabel: '경기도 수원시', country: '대한민국', longitude: 127.029, latitude: 37.2636, utcOffsetMinutes: 540, kind: 'city', aliases: ['영통', '팔달', '권선', '장안', '광교', 'suwon'] },
  { id: 'seongnam', nameKo: '성남', regionLabel: '경기도 성남시', country: '대한민국', longitude: 127.138, latitude: 37.4200, utcOffsetMinutes: 540, kind: 'city', aliases: ['분당', '판교', '수정', '중원', 'seongnam'] },
  { id: 'yongin', nameKo: '용인', regionLabel: '경기도 용인시', country: '대한민국', longitude: 127.177, latitude: 37.2411, utcOffsetMinutes: 540, kind: 'city', aliases: ['수지', '기흥', '처인', 'yongin'] },
  { id: 'goyang', nameKo: '고양', regionLabel: '경기도 고양시', country: '대한민국', longitude: 126.832, latitude: 37.6584, utcOffsetMinutes: 540, kind: 'city', aliases: ['일산', '덕양', '화정', 'goyang'] },
  { id: 'hwaseong', nameKo: '화성', regionLabel: '경기도 화성시', country: '대한민국', longitude: 126.831, latitude: 37.1995, utcOffsetMinutes: 540, kind: 'city', aliases: ['동탄', '병점', '봉담', 'hwaseong'] },
  { id: 'ansan', nameKo: '안산', regionLabel: '경기도 안산시', country: '대한민국', longitude: 126.831, latitude: 37.3219, utcOffsetMinutes: 540, kind: 'city', aliases: ['단원', '상록', 'ansan'] },
  { id: 'anyang', nameKo: '안양', regionLabel: '경기도 안양시', country: '대한민국', longitude: 126.957, latitude: 37.3943, utcOffsetMinutes: 540, kind: 'city', aliases: ['평촌', '동안', '만안', 'anyang'] },
  { id: 'bucheon', nameKo: '부천', regionLabel: '경기도 부천시', country: '대한민국', longitude: 126.766, latitude: 37.5034, utcOffsetMinutes: 540, kind: 'city', aliases: ['소사', '오정', '원미', '중동', '상동', 'bucheon'] },
  { id: 'namyangju', nameKo: '남양주', regionLabel: '경기도 남양주시', country: '대한민국', longitude: 127.216, latitude: 37.6360, utcOffsetMinutes: 540, kind: 'city', aliases: ['다산', '별내', '호평', '평내', 'namyangju'] },
  { id: 'pyeongtaek', nameKo: '평택', regionLabel: '경기도 평택시', country: '대한민국', longitude: 127.112, latitude: 36.9921, utcOffsetMinutes: 540, kind: 'city', aliases: ['송탄', '안중', '고덕', 'pyeongtaek'] },
  { id: 'uijeongbu', nameKo: '의정부', regionLabel: '경기도 의정부시', country: '대한민국', longitude: 127.034, latitude: 37.7381, utcOffsetMinutes: 540, kind: 'city', aliases: ['uijeongbu'] },
  { id: 'siheung', nameKo: '시흥', regionLabel: '경기도 시흥시', country: '대한민국', longitude: 126.803, latitude: 37.3800, utcOffsetMinutes: 540, kind: 'city', aliases: ['배곧', '정왕', 'siheung'] },
  { id: 'paju', nameKo: '파주', regionLabel: '경기도 파주시', country: '대한민국', longitude: 126.780, latitude: 37.7599, utcOffsetMinutes: 540, kind: 'city', aliases: ['운정', '문산', '금촌', 'paju'] },
  { id: 'gimpo', nameKo: '김포', regionLabel: '경기도 김포시', country: '대한민국', longitude: 126.716, latitude: 37.6152, utcOffsetMinutes: 540, kind: 'city', aliases: ['한강신도시', '구래', '사우', 'gimpo'] },
  { id: 'gwangmyeong', nameKo: '광명', regionLabel: '경기도 광명시', country: '대한민국', longitude: 126.864, latitude: 37.4786, utcOffsetMinutes: 540, kind: 'city', aliases: ['철산', '하안', 'gwangmyeong'] },
  { id: 'gyeonggi_gwangju', nameKo: '경기 광주', regionLabel: '경기도 광주시', country: '대한민국', longitude: 127.255, latitude: 37.4292, utcOffsetMinutes: 540, kind: 'city', aliases: ['경기도광주', '경기광주', '초월', '곤지암'] },
  { id: 'gunpo', nameKo: '군포', regionLabel: '경기도 군포시', country: '대한민국', longitude: 126.935, latitude: 37.3617, utcOffsetMinutes: 540, kind: 'city', aliases: ['산본'] },
  { id: 'osan', nameKo: '오산', regionLabel: '경기도 오산시', country: '대한민국', longitude: 127.077, latitude: 37.1499, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'icheon', nameKo: '이천', regionLabel: '경기도 이천시', country: '대한민국', longitude: 127.435, latitude: 37.2720, utcOffsetMinutes: 540, kind: 'city', aliases: ['장호원'] },
  { id: 'anseong', nameKo: '안성', regionLabel: '경기도 안성시', country: '대한민국', longitude: 127.280, latitude: 37.0078, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'guri', nameKo: '구리', regionLabel: '경기도 구리시', country: '대한민국', longitude: 127.130, latitude: 37.5943, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hanam', nameKo: '하남', regionLabel: '경기도 하남시', country: '대한민국', longitude: 127.215, latitude: 37.5393, utcOffsetMinutes: 540, kind: 'city', aliases: ['미사', '위례'] },
  { id: 'uiwang', nameKo: '의왕', regionLabel: '경기도 의왕시', country: '대한민국', longitude: 126.968, latitude: 37.3449, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gwacheon', nameKo: '과천', regionLabel: '경기도 과천시', country: '대한민국', longitude: 126.988, latitude: 37.4292, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'pocheon', nameKo: '포천', regionLabel: '경기도 포천시', country: '대한민국', longitude: 127.200, latitude: 37.8949, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yangju', nameKo: '양주', regionLabel: '경기도 양주시', country: '대한민국', longitude: 127.046, latitude: 37.7853, utcOffsetMinutes: 540, kind: 'city', aliases: ['옥정'] },
  { id: 'dongducheon', nameKo: '동두천', regionLabel: '경기도 동두천시', country: '대한민국', longitude: 127.061, latitude: 37.9034, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeoju', nameKo: '여주', regionLabel: '경기도 여주시', country: '대한민국', longitude: 127.637, latitude: 37.2983, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yangpyeong', nameKo: '양평', regionLabel: '경기도 양평군', country: '대한민국', longitude: 127.487, latitude: 37.4917, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gapyeong', nameKo: '가평', regionLabel: '경기도 가평군', country: '대한민국', longitude: 127.510, latitude: 37.8315, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeoncheon', nameKo: '연천', regionLabel: '경기도 연천군', country: '대한민국', longitude: 127.075, latitude: 38.0965, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Gangwon
  { id: 'chuncheon', nameKo: '춘천', regionLabel: '강원특별자치도 춘천시', country: '대한민국', longitude: 127.730, latitude: 37.8813, utcOffsetMinutes: 540, kind: 'city', aliases: ['chuncheon'] },
  { id: 'wonju', nameKo: '원주', regionLabel: '강원특별자치도 원주시', country: '대한민국', longitude: 127.920, latitude: 37.3422, utcOffsetMinutes: 540, kind: 'city', aliases: ['wonju'] },
  { id: 'gangneung', nameKo: '강릉', regionLabel: '강원특별자치도 강릉시', country: '대한민국', longitude: 128.876, latitude: 37.7519, utcOffsetMinutes: 540, kind: 'city', aliases: ['경포', '주문진', 'gangneung'] },
  { id: 'donghae', nameKo: '동해', regionLabel: '강원특별자치도 동해시', country: '대한민국', longitude: 129.114, latitude: 37.5247, utcOffsetMinutes: 540, kind: 'city', aliases: ['묵호'] },
  { id: 'taebaek', nameKo: '태백', regionLabel: '강원특별자치도 태백시', country: '대한민국', longitude: 128.985, latitude: 37.1641, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'sokcho', nameKo: '속초', regionLabel: '강원특별자치도 속초시', country: '대한민국', longitude: 128.592, latitude: 38.2070, utcOffsetMinutes: 540, kind: 'city', aliases: ['sokcho'] },
  { id: 'samcheok', nameKo: '삼척', regionLabel: '강원특별자치도 삼척시', country: '대한민국', longitude: 129.165, latitude: 37.4499, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hongcheon', nameKo: '홍천', regionLabel: '강원 홍천군', country: '대한민국', longitude: 127.888, latitude: 37.6970, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hoengseong', nameKo: '횡성', regionLabel: '강원 횡성군', country: '대한민국', longitude: 127.985, latitude: 37.4917, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeongwol', nameKo: '영월', regionLabel: '강원 영월군', country: '대한민국', longitude: 128.462, latitude: 37.1836, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'pyeongchang', nameKo: '평창', regionLabel: '강원 평창군', country: '대한민국', longitude: 128.390, latitude: 37.3705, utcOffsetMinutes: 540, kind: 'city', aliases: ['대관령'] },
  { id: 'jeongseon', nameKo: '정선', regionLabel: '강원 정선군', country: '대한민국', longitude: 128.661, latitude: 37.3806, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'cheorwon', nameKo: '철원', regionLabel: '강원 철원군', country: '대한민국', longitude: 127.313, latitude: 38.1467, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hwacheon', nameKo: '화천', regionLabel: '강원 화천군', country: '대한민국', longitude: 127.708, latitude: 38.1062, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yanggu', nameKo: '양구', regionLabel: '강원 양구군', country: '대한민국', longitude: 127.990, latitude: 38.1101, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'inje', nameKo: '인제', regionLabel: '강원 인제군', country: '대한민국', longitude: 128.170, latitude: 38.0697, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'goseong_gw', nameKo: '강원 고성', regionLabel: '강원 고성군', country: '대한민국', longitude: 128.468, latitude: 38.3806, utcOffsetMinutes: 540, kind: 'city', aliases: ['강원고성', '고성'] },
  { id: 'yangyang', nameKo: '양양', regionLabel: '강원 양양군', country: '대한민국', longitude: 128.619, latitude: 38.0754, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Chungbuk
  { id: 'cheongju', nameKo: '청주', regionLabel: '충청북도 청주시', country: '대한민국', longitude: 127.489, latitude: 36.6424, utcOffsetMinutes: 540, kind: 'city', aliases: ['오창', '오송', '상당', '흥덕', '청원', 'cheongju'] },
  { id: 'chungju', nameKo: '충주', regionLabel: '충청북도 충주시', country: '대한민국', longitude: 127.926, latitude: 36.9910, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jecheon', nameKo: '제천', regionLabel: '충청북도 제천시', country: '대한민국', longitude: 128.191, latitude: 37.1326, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'boeun', nameKo: '보은', regionLabel: '충북 보은군', country: '대한민국', longitude: 127.730, latitude: 36.4894, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'okcheon', nameKo: '옥천', regionLabel: '충북 옥천군', country: '대한민국', longitude: 127.571, latitude: 36.3065, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeongdong', nameKo: '영동', regionLabel: '충북 영동군', country: '대한민국', longitude: 127.783, latitude: 36.1750, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jeungpyeong', nameKo: '증평', regionLabel: '충북 증평군', country: '대한민국', longitude: 127.581, latitude: 36.7854, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jincheon', nameKo: '진천', regionLabel: '충북 진천군', country: '대한민국', longitude: 127.435, latitude: 36.8554, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'goesan', nameKo: '괴산', regionLabel: '충북 괴산군', country: '대한민국', longitude: 127.787, latitude: 36.8154, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'eumseong', nameKo: '음성', regionLabel: '충북 음성군', country: '대한민국', longitude: 127.690, latitude: 36.9403, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'danyang', nameKo: '단양', regionLabel: '충북 단양군', country: '대한민국', longitude: 128.366, latitude: 36.9845, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Chungnam
  { id: 'cheonan', nameKo: '천안', regionLabel: '충청남도 천안시', country: '대한민국', longitude: 127.114, latitude: 36.8151, utcOffsetMinutes: 540, kind: 'city', aliases: ['불당', '두정', '신부', '성환', 'cheonan'] },
  { id: 'gongju', nameKo: '공주', regionLabel: '충청남도 공주시', country: '대한민국', longitude: 127.119, latitude: 36.4465, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'boryeong', nameKo: '보령', regionLabel: '충청남도 보령시', country: '대한민국', longitude: 126.613, latitude: 36.3335, utcOffsetMinutes: 540, kind: 'city', aliases: ['대천'] },
  { id: 'asan', nameKo: '아산', regionLabel: '충청남도 아산시', country: '대한민국', longitude: 127.002, latitude: 36.7898, utcOffsetMinutes: 540, kind: 'city', aliases: ['온양', '배방'] },
  { id: 'seosan', nameKo: '서산', regionLabel: '충청남도 서산시', country: '대한민국', longitude: 126.450, latitude: 36.7845, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'nonsan', nameKo: '논산', regionLabel: '충청남도 논산시', country: '대한민국', longitude: 127.099, latitude: 36.1872, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gyeryong', nameKo: '계룡', regionLabel: '충청남도 계룡시', country: '대한민국', longitude: 127.249, latitude: 36.2746, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'dangjin', nameKo: '당진', regionLabel: '충청남도 당진시', country: '대한민국', longitude: 126.630, latitude: 36.8899, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'geumsan', nameKo: '금산', regionLabel: '충남 금산군', country: '대한민국', longitude: 127.489, latitude: 36.1089, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'buyeo', nameKo: '부여', regionLabel: '충남 부여군', country: '대한민국', longitude: 126.910, latitude: 36.2757, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'seocheon', nameKo: '서천', regionLabel: '충남 서천군', country: '대한민국', longitude: 126.691, latitude: 36.0803, utcOffsetMinutes: 540, kind: 'city', aliases: ['장항'] },
  { id: 'cheongyang', nameKo: '청양', regionLabel: '충남 청양군', country: '대한민국', longitude: 126.802, latitude: 36.4591, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hongseong', nameKo: '홍성', regionLabel: '충남 홍성군', country: '대한민국', longitude: 126.661, latitude: 36.6013, utcOffsetMinutes: 540, kind: 'city', aliases: ['내포'] },
  { id: 'yesan', nameKo: '예산', regionLabel: '충남 예산군', country: '대한민국', longitude: 126.849, latitude: 36.6825, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'taean', nameKo: '태안', regionLabel: '충남 태안군', country: '대한민국', longitude: 126.298, latitude: 36.7456, utcOffsetMinutes: 540, kind: 'city', aliases: ['안면도'] },

  // Jeonbuk
  { id: 'jeonju', nameKo: '전주', regionLabel: '전북특별자치도 전주시', country: '대한민국', longitude: 127.148, latitude: 35.8242, utcOffsetMinutes: 540, kind: 'city', aliases: ['완산', '덕진', 'jeonju'] },
  { id: 'gunsan', nameKo: '군산', regionLabel: '전북특별자치도 군산시', country: '대한민국', longitude: 126.737, latitude: 35.9677, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'iksan', nameKo: '익산', regionLabel: '전북특별자치도 익산시', country: '대한민국', longitude: 126.958, latitude: 35.9483, utcOffsetMinutes: 540, kind: 'city', aliases: ['이리'] },
  { id: 'jeongeup', nameKo: '정읍', regionLabel: '전북특별자치도 정읍시', country: '대한민국', longitude: 126.856, latitude: 35.5699, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'namwon', nameKo: '남원', regionLabel: '전북특별자치도 남원시', country: '대한민국', longitude: 127.390, latitude: 35.4164, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gimje', nameKo: '김제', regionLabel: '전북특별자치도 김제시', country: '대한민국', longitude: 126.881, latitude: 35.8036, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'wanju', nameKo: '완주', regionLabel: '전북 완주군', country: '대한민국', longitude: 127.162, latitude: 35.9046, utcOffsetMinutes: 540, kind: 'city', aliases: ['삼례', '봉동'] },
  { id: 'jinan', nameKo: '진안', regionLabel: '전북 진안군', country: '대한민국', longitude: 127.425, latitude: 35.7917, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'muju', nameKo: '무주', regionLabel: '전북 무주군', country: '대한민국', longitude: 127.661, latitude: 36.0068, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jangsu', nameKo: '장수', regionLabel: '전북 장수군', country: '대한민국', longitude: 127.521, latitude: 35.6474, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'imsil', nameKo: '임실', regionLabel: '전북 임실군', country: '대한민국', longitude: 127.289, latitude: 35.6177, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'sunchang', nameKo: '순창', regionLabel: '전북 순창군', country: '대한민국', longitude: 127.137, latitude: 35.3745, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gochang', nameKo: '고창', regionLabel: '전북 고창군', country: '대한민국', longitude: 126.702, latitude: 35.4358, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'buan', nameKo: '부안', regionLabel: '전북 부안군', country: '대한민국', longitude: 126.733, latitude: 35.7318, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Jeonnam
  { id: 'mokpo', nameKo: '목포', regionLabel: '전라남도 목포시', country: '대한민국', longitude: 126.392, latitude: 34.8118, utcOffsetMinutes: 540, kind: 'city', aliases: ['mokpo'] },
  { id: 'yeosu', nameKo: '여수', regionLabel: '전라남도 여수시', country: '대한민국', longitude: 127.662, latitude: 34.7604, utcOffsetMinutes: 540, kind: 'city', aliases: ['여천', 'yeosu'] },
  { id: 'suncheon', nameKo: '순천', regionLabel: '전라남도 순천시', country: '대한민국', longitude: 127.487, latitude: 34.9506, utcOffsetMinutes: 540, kind: 'city', aliases: ['suncheon'] },
  { id: 'naju', nameKo: '나주', regionLabel: '전라남도 나주시', country: '대한민국', longitude: 126.711, latitude: 35.0159, utcOffsetMinutes: 540, kind: 'city', aliases: ['빛가람'] },
  { id: 'gwangyang', nameKo: '광양', regionLabel: '전라남도 광양시', country: '대한민국', longitude: 127.696, latitude: 34.9407, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'damyang', nameKo: '담양', regionLabel: '전남 담양군', country: '대한민국', longitude: 126.988, latitude: 35.3212, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gokseong', nameKo: '곡성', regionLabel: '전남 곡성군', country: '대한민국', longitude: 127.292, latitude: 35.2821, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gurye', nameKo: '구례', regionLabel: '전남 구례군', country: '대한민국', longitude: 127.463, latitude: 35.2025, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'goheung', nameKo: '고흥', regionLabel: '전남 고흥군', country: '대한민국', longitude: 127.285, latitude: 34.6047, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'boseong', nameKo: '보성', regionLabel: '전남 보성군', country: '대한민국', longitude: 127.080, latitude: 34.7715, utcOffsetMinutes: 540, kind: 'city', aliases: ['벌교'] },
  { id: 'hwasun', nameKo: '화순', regionLabel: '전남 화순군', country: '대한민국', longitude: 126.987, latitude: 35.0645, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jangheung', nameKo: '장흥', regionLabel: '전남 장흥군', country: '대한민국', longitude: 126.907, latitude: 34.6817, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'gangjin', nameKo: '강진', regionLabel: '전남 강진군', country: '대한민국', longitude: 126.767, latitude: 34.6421, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'haenam', nameKo: '해남', regionLabel: '전남 해남군', country: '대한민국', longitude: 126.599, latitude: 34.5735, utcOffsetMinutes: 540, kind: 'city', aliases: ['땅끝'] },
  { id: 'yeongam', nameKo: '영암', regionLabel: '전남 영암군', country: '대한민국', longitude: 126.697, latitude: 34.8002, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'muan', nameKo: '무안', regionLabel: '전남 무안군', country: '대한민국', longitude: 126.482, latitude: 34.9904, utcOffsetMinutes: 540, kind: 'city', aliases: ['남악'] },
  { id: 'hampyeong', nameKo: '함평', regionLabel: '전남 함평군', country: '대한민국', longitude: 126.516, latitude: 35.0659, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeonggwang', nameKo: '영광', regionLabel: '전남 영광군', country: '대한민국', longitude: 126.512, latitude: 35.2772, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jangseong', nameKo: '장성', regionLabel: '전남 장성군', country: '대한민국', longitude: 126.785, latitude: 35.3019, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'wando', nameKo: '완도', regionLabel: '전남 완도군', country: '대한민국', longitude: 126.755, latitude: 34.3110, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'jindo', nameKo: '진도', regionLabel: '전남 진도군', country: '대한민국', longitude: 126.263, latitude: 34.4868, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'shinan', nameKo: '신안', regionLabel: '전남 신안군', country: '대한민국', longitude: 126.108, latitude: 34.8336, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Gyeongbuk
  { id: 'pohang', nameKo: '포항', regionLabel: '경상북도 포항시', country: '대한민국', longitude: 129.343, latitude: 36.0190, utcOffsetMinutes: 540, kind: 'city', aliases: ['구룡포', '영일', 'pohang'] },
  { id: 'gyeongju', nameKo: '경주', regionLabel: '경상북도 경주시', country: '대한민국', longitude: 129.225, latitude: 35.8562, utcOffsetMinutes: 540, kind: 'city', aliases: ['gyeongju'] },
  { id: 'gimcheon', nameKo: '김천', regionLabel: '경상북도 김천시', country: '대한민국', longitude: 128.114, latitude: 36.1398, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'andong', nameKo: '안동', regionLabel: '경상북도 안동시', country: '대한민국', longitude: 128.729, latitude: 36.5684, utcOffsetMinutes: 540, kind: 'city', aliases: ['andong'] },
  { id: 'gumi', nameKo: '구미', regionLabel: '경상북도 구미시', country: '대한민국', longitude: 128.344, latitude: 36.1195, utcOffsetMinutes: 540, kind: 'city', aliases: ['인동', '선산', 'gumi'] },
  { id: 'yeongju', nameKo: '영주', regionLabel: '경상북도 영주시', country: '대한민국', longitude: 128.624, latitude: 36.8057, utcOffsetMinutes: 540, kind: 'city', aliases: ['풍기'] },
  { id: 'yeongcheon', nameKo: '영천', regionLabel: '경상북도 영천시', country: '대한민국', longitude: 128.938, latitude: 35.9733, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'sangju', nameKo: '상주', regionLabel: '경상북도 상주시', country: '대한민국', longitude: 128.159, latitude: 36.4109, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'mungyeong', nameKo: '문경', regionLabel: '경상북도 문경시', country: '대한민국', longitude: 128.187, latitude: 36.5865, utcOffsetMinutes: 540, kind: 'city', aliases: ['점촌'] },
  { id: 'gyeongsan', nameKo: '경산', regionLabel: '경상북도 경산시', country: '대한민국', longitude: 128.741, latitude: 35.8251, utcOffsetMinutes: 540, kind: 'city', aliases: ['하양'] },
  { id: 'uiseong', nameKo: '의성', regionLabel: '경북 의성군', country: '대한민국', longitude: 128.697, latitude: 36.3526, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'cheongsong', nameKo: '청송', regionLabel: '경북 청송군', country: '대한민국', longitude: 129.057, latitude: 36.4363, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeongyang', nameKo: '영양', regionLabel: '경북 영양군', country: '대한민국', longitude: 129.112, latitude: 36.6667, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'yeongdeok', nameKo: '영덕', regionLabel: '경북 영덕군', country: '대한민국', longitude: 129.365, latitude: 36.4151, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'cheongdo', nameKo: '청도', regionLabel: '경북 청도군', country: '대한민국', longitude: 128.734, latitude: 35.6473, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'goryeong', nameKo: '고령', regionLabel: '경북 고령군', country: '대한민국', longitude: 128.263, latitude: 35.7261, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'seongju', nameKo: '성주', regionLabel: '경북 성주군', country: '대한민국', longitude: 128.283, latitude: 35.9192, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'chilgok', nameKo: '칠곡', regionLabel: '경북 칠곡군', country: '대한민국', longitude: 128.402, latitude: 35.9955, utcOffsetMinutes: 540, kind: 'city', aliases: ['왜관'] },
  { id: 'yecheon', nameKo: '예천', regionLabel: '경북 예천군', country: '대한민국', longitude: 128.453, latitude: 36.6577, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'bonghwa', nameKo: '봉화', regionLabel: '경북 봉화군', country: '대한민국', longitude: 128.732, latitude: 36.8931, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'uljin', nameKo: '울진', regionLabel: '경북 울진군', country: '대한민국', longitude: 129.400, latitude: 36.9931, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'ulleung', nameKo: '울릉', regionLabel: '경북 울릉군', country: '대한민국', longitude: 130.906, latitude: 37.4844, utcOffsetMinutes: 540, kind: 'city', aliases: ['울릉도', '독도'] },

  // Gyeongnam
  { id: 'changwon', nameKo: '창원', regionLabel: '경상남도 창원시', country: '대한민국', longitude: 128.681, latitude: 35.2280, utcOffsetMinutes: 540, kind: 'city', aliases: ['마산', '진해', '의창', '성산', 'changwon'] },
  { id: 'jinju', nameKo: '진주', regionLabel: '경상남도 진주시', country: '대한민국', longitude: 128.108, latitude: 35.1800, utcOffsetMinutes: 540, kind: 'city', aliases: ['jinju'] },
  { id: 'tongyeong', nameKo: '통영', regionLabel: '경상남도 통영시', country: '대한민국', longitude: 128.433, latitude: 34.8544, utcOffsetMinutes: 540, kind: 'city', aliases: ['충무'] },
  { id: 'sacheon', nameKo: '사천', regionLabel: '경상남도 사천시', country: '대한민국', longitude: 128.064, latitude: 35.0038, utcOffsetMinutes: 540, kind: 'city', aliases: ['삼천포'] },
  { id: 'gimhae', nameKo: '김해', regionLabel: '경상남도 김해시', country: '대한민국', longitude: 128.889, latitude: 35.2285, utcOffsetMinutes: 540, kind: 'city', aliases: ['장유', '진영', 'gimhae'] },
  { id: 'miryang', nameKo: '밀양', regionLabel: '경상남도 밀양시', country: '대한민국', longitude: 128.746, latitude: 35.5038, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'geoje', nameKo: '거제', regionLabel: '경상남도 거제시', country: '대한민국', longitude: 128.621, latitude: 34.8806, utcOffsetMinutes: 540, kind: 'city', aliases: ['고현', '옥포', '거제도'] },
  { id: 'yangsan', nameKo: '양산', regionLabel: '경상남도 양산시', country: '대한민국', longitude: 129.037, latitude: 35.3350, utcOffsetMinutes: 540, kind: 'city', aliases: ['물금', '웅상'] },
  { id: 'uiryeong', nameKo: '의령', regionLabel: '경남 의령군', country: '대한민국', longitude: 128.262, latitude: 35.3222, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'haman', nameKo: '함안', regionLabel: '경남 함안군', country: '대한민국', longitude: 128.406, latitude: 35.2725, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'changnyeong', nameKo: '창녕', regionLabel: '경남 창녕군', country: '대한민국', longitude: 128.492, latitude: 35.5446, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'goseong_gn', nameKo: '경남 고성', regionLabel: '경남 고성군', country: '대한민국', longitude: 128.323, latitude: 34.9731, utcOffsetMinutes: 540, kind: 'city', aliases: ['경남고성'] },
  { id: 'namhae', nameKo: '남해', regionLabel: '경남 남해군', country: '대한민국', longitude: 127.892, latitude: 34.8377, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hadong', nameKo: '하동', regionLabel: '경남 하동군', country: '대한민국', longitude: 127.751, latitude: 35.0672, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'sancheong', nameKo: '산청', regionLabel: '경남 산청군', country: '대한민국', longitude: 127.874, latitude: 35.4156, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hamyang', nameKo: '함양', regionLabel: '경남 함양군', country: '대한민국', longitude: 127.725, latitude: 35.5205, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'geochang', nameKo: '거창', regionLabel: '경남 거창군', country: '대한민국', longitude: 127.909, latitude: 35.6867, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hapcheon', nameKo: '합천', regionLabel: '경남 합천군', country: '대한민국', longitude: 128.166, latitude: 35.5667, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Jeju & Northern Peninsula
  { id: 'jeju', nameKo: '제주', regionLabel: '제주특별자치도 제주시', country: '대한민국', longitude: 126.531, latitude: 33.4996, utcOffsetMinutes: 540, kind: 'city', aliases: ['제주도', '애월', '조천', '한림', '구좌', 'jeju'] },
  { id: 'seogwipo', nameKo: '서귀포', regionLabel: '제주특별자치도 서귀포시', country: '대한민국', longitude: 126.560, latitude: 33.2541, utcOffsetMinutes: 540, kind: 'city', aliases: ['중문', '성산포', '표선', '남원읍', 'seogwipo'] },
  { id: 'pyongyang', nameKo: '평양', regionLabel: '평양', country: '한반도 북부', longitude: 125.763, latitude: 39.0392, utcOffsetMinutes: 540, kind: 'city', aliases: ['평안남도', '평안도', 'pyongyang'] },
  { id: 'gaeseong', nameKo: '개성', regionLabel: '개성', country: '한반도 북부', longitude: 126.558, latitude: 37.9708, utcOffsetMinutes: 540, kind: 'city', aliases: [] },
  { id: 'hamheung', nameKo: '함흥', regionLabel: '함흥', country: '한반도 북부', longitude: 127.536, latitude: 39.9183, utcOffsetMinutes: 540, kind: 'city', aliases: ['함경남도'] },
  { id: 'cheongjin', nameKo: '청진', regionLabel: '청진', country: '한반도 북부', longitude: 129.776, latitude: 41.7956, utcOffsetMinutes: 540, kind: 'city', aliases: ['함경북도'] },
  { id: 'sinuiju', nameKo: '신의주', regionLabel: '신의주', country: '한반도 북부', longitude: 124.397, latitude: 40.1006, utcOffsetMinutes: 540, kind: 'city', aliases: ['평안북도'] },
  { id: 'wonsan', nameKo: '원산', regionLabel: '원산', country: '한반도 북부', longitude: 127.444, latitude: 39.1528, utcOffsetMinutes: 540, kind: 'city', aliases: [] },

  // Korean Province Fallbacks (matched only if no specific city/county matched)
  { id: 'gyeonggi_prov', nameKo: '경기도', regionLabel: '경기도 중심권', country: '대한민국', longitude: 127.01, latitude: 37.275, utcOffsetMinutes: 540, kind: 'province', aliases: ['경기'] },
  { id: 'gangwon_prov', nameKo: '강원도', regionLabel: '강원특별자치도 중심권', country: '대한민국', longitude: 127.95, latitude: 37.75, utcOffsetMinutes: 540, kind: 'province', aliases: ['강원', '강원특별자치도', '영동지방', '영서'] },
  { id: 'chungbuk_prov', nameKo: '충청북도', regionLabel: '충청북도 중심권', country: '대한민국', longitude: 127.70, latitude: 36.73, utcOffsetMinutes: 540, kind: 'province', aliases: ['충북'] },
  { id: 'chungnam_prov', nameKo: '충청남도', regionLabel: '충청남도 중심권', country: '대한민국', longitude: 126.85, latitude: 36.55, utcOffsetMinutes: 540, kind: 'province', aliases: ['충남', '충청도', '충청'] },
  { id: 'jeonbuk_prov', nameKo: '전북특별자치도', regionLabel: '전북 중심권', country: '대한민국', longitude: 127.14, latitude: 35.82, utcOffsetMinutes: 540, kind: 'province', aliases: ['전북', '전라북도'] },
  { id: 'jeonnam_prov', nameKo: '전라남도', regionLabel: '전라남도 중심권', country: '대한민국', longitude: 126.89, latitude: 34.86, utcOffsetMinutes: 540, kind: 'province', aliases: ['전남', '전라도', '호남'] },
  { id: 'gyeongbuk_prov', nameKo: '경상북도', regionLabel: '경상북도 중심권', country: '대한민국', longitude: 128.66, latitude: 36.24, utcOffsetMinutes: 540, kind: 'province', aliases: ['경북'] },
  { id: 'gyeongnam_prov', nameKo: '경상남도', regionLabel: '경상남도 중심권', country: '대한민국', longitude: 128.45, latitude: 35.25, utcOffsetMinutes: 540, kind: 'province', aliases: ['경남', '경상도', '영남'] },

  // Global Cities (Asia, Oceania, Europe, Americas)
  { id: 'tokyo', nameKo: '도쿄', regionLabel: '일본 도쿄', country: '일본', longitude: 139.692, latitude: 35.6895, utcOffsetMinutes: 540, kind: 'global', aliases: ['동경', '요코하마', '지바', '사이타마', 'tokyo', 'japan'] },
  { id: 'osaka', nameKo: '오사카', regionLabel: '일본 오사카', country: '일본', longitude: 135.502, latitude: 34.6937, utcOffsetMinutes: 540, kind: 'global', aliases: ['고베', '간사이', 'osaka'] },
  { id: 'kyoto', nameKo: '교토', regionLabel: '일본 교토', country: '일본', longitude: 135.768, latitude: 35.0116, utcOffsetMinutes: 540, kind: 'global', aliases: ['kyoto'] },
  { id: 'fukuoka', nameKo: '후쿠오카', regionLabel: '일본 후쿠오카', country: '일본', longitude: 130.402, latitude: 33.5902, utcOffsetMinutes: 540, kind: 'global', aliases: ['규슈', '기타큐슈', 'fukuoka'] },
  { id: 'sapporo', nameKo: '삿포로', regionLabel: '일본 삿포로', country: '일본', longitude: 141.354, latitude: 43.0618, utcOffsetMinutes: 540, kind: 'global', aliases: ['홋카이도', '북해도', 'sapporo'] },
  { id: 'nagoya', nameKo: '나고야', regionLabel: '일본 나고야', country: '일본', longitude: 136.906, latitude: 35.1815, utcOffsetMinutes: 540, kind: 'global', aliases: ['nagoya'] },
  { id: 'okinawa', nameKo: '오키나와', regionLabel: '일본 오키나와', country: '일본', longitude: 127.679, latitude: 26.2124, utcOffsetMinutes: 540, kind: 'global', aliases: ['나하', 'okinawa'] },
  { id: 'beijing', nameKo: '베이징', regionLabel: '중국 베이징', country: '중국', longitude: 116.407, latitude: 39.9042, utcOffsetMinutes: 480, kind: 'global', aliases: ['북경', '톈진', 'beijing'] },
  { id: 'shanghai', nameKo: '상하이', regionLabel: '중국 상하이', country: '중국', longitude: 121.474, latitude: 31.2304, utcOffsetMinutes: 480, kind: 'global', aliases: ['상해', '항저우', '쑤저우', '난징', 'shanghai'] },
  { id: 'guangzhou', nameKo: '광저우', regionLabel: '중국 광저우', country: '중국', longitude: 113.264, latitude: 23.1291, utcOffsetMinutes: 480, kind: 'global', aliases: ['guangzhou'] },
  { id: 'shenzhen', nameKo: '선전', regionLabel: '중국 선전', country: '중국', longitude: 114.058, latitude: 22.5431, utcOffsetMinutes: 480, kind: 'global', aliases: ['심천', 'shenzhen'] },
  { id: 'qingdao', nameKo: '칭다오', regionLabel: '중국 칭다오', country: '중국', longitude: 120.383, latitude: 36.0671, utcOffsetMinutes: 480, kind: 'global', aliases: ['청도', '다롄', '선양', '하얼빈', 'qingdao'] },
  { id: 'yanji', nameKo: '연변', regionLabel: '중국 연변(연길)', country: '중국', longitude: 129.509, latitude: 42.8913, utcOffsetMinutes: 480, kind: 'global', aliases: ['연길', '옌지', '지린', 'yanji'] },
  { id: 'hong_kong', nameKo: '홍콩', regionLabel: '홍콩', country: '중국', longitude: 114.169, latitude: 22.3193, utcOffsetMinutes: 480, kind: 'global', aliases: ['마카오', 'hong kong', 'hongkong'] },
  { id: 'taipei', nameKo: '타이베이', regionLabel: '대만 타이베이', country: '대만', longitude: 121.565, latitude: 25.0330, utcOffsetMinutes: 480, kind: 'global', aliases: ['대만', '타이완', '가오슝', 'taipei', 'taiwan'] },
  { id: 'singapore', nameKo: '싱가포르', regionLabel: '싱가포르', country: '싱가포르', longitude: 103.820, latitude: 1.3521, utcOffsetMinutes: 480, kind: 'global', aliases: ['singapore'] },
  { id: 'bangkok', nameKo: '방콕', regionLabel: '태국 방콕', country: '태국', longitude: 100.502, latitude: 13.7563, utcOffsetMinutes: 420, kind: 'global', aliases: ['태국', '치앙마이', '푸켓', 'bangkok', 'thailand'] },
  { id: 'hanoi', nameKo: '하노이', regionLabel: '베트남 하노이', country: '베트남', longitude: 105.834, latitude: 21.0285, utcOffsetMinutes: 420, kind: 'global', aliases: ['다낭', 'hanoi'] },
  { id: 'ho_chi_minh', nameKo: '호치민', regionLabel: '베트남 호치민', country: '베트남', longitude: 106.630, latitude: 10.8231, utcOffsetMinutes: 420, kind: 'global', aliases: ['사이공', '베트남', '나트랑', 'hochiminh', 'vietnam'] },
  { id: 'manila', nameKo: '마닐라', regionLabel: '필리핀 마닐라', country: '필리핀', longitude: 120.984, latitude: 14.5995, utcOffsetMinutes: 480, kind: 'global', aliases: ['필리핀', '세부', 'manila'] },
  { id: 'jakarta', nameKo: '자카르타', regionLabel: '인도네시아 자카르타', country: '인도네시아', longitude: 106.846, latitude: -6.2088, utcOffsetMinutes: 420, kind: 'global', aliases: ['발리', '인도네시아', 'jakarta'] },
  { id: 'kuala_lumpur', nameKo: '쿠알라룸푸르', regionLabel: '말레이시아 쿠알라룸푸르', country: '말레이시아', longitude: 101.687, latitude: 3.1390, utcOffsetMinutes: 480, kind: 'global', aliases: ['말레이시아', 'kuala lumpur'] },
  { id: 'new_delhi', nameKo: '뉴델리', regionLabel: '인도 뉴델리', country: '인도', longitude: 77.209, latitude: 28.6139, utcOffsetMinutes: 330, kind: 'global', aliases: ['델리', '인도', 'delhi'] },
  { id: 'mumbai', nameKo: '뭄바이', regionLabel: '인도 뭄바이', country: '인도', longitude: 72.878, latitude: 19.0760, utcOffsetMinutes: 330, kind: 'global', aliases: ['mumbai'] },
  { id: 'dubai', nameKo: '두바이', regionLabel: 'UAE 두바이', country: '아랍에미리트', longitude: 55.271, latitude: 25.2048, utcOffsetMinutes: 240, kind: 'global', aliases: ['아부다비', 'dubai'] },

  // Europe
  { id: 'london', nameKo: '런던', regionLabel: '영국 런던', country: '영국', longitude: -0.128, latitude: 51.5074, utcOffsetMinutes: 0, kind: 'global', aliases: ['영국', '맨체스터', '에든버러', 'london', 'uk'] },
  { id: 'paris', nameKo: '파리', regionLabel: '프랑스 파리', country: '프랑스', longitude: 2.352, latitude: 48.8566, utcOffsetMinutes: 60, kind: 'global', aliases: ['프랑스', '리옹', '니스', 'paris', 'france'] },
  { id: 'berlin', nameKo: '베를린', regionLabel: '독일 베를린', country: '독일', longitude: 13.405, latitude: 52.5200, utcOffsetMinutes: 60, kind: 'global', aliases: ['독일', '함부르크', 'berlin', 'germany'] },
  { id: 'frankfurt', nameKo: '프랑크푸르트', regionLabel: '독일 프랑크푸르트', country: '독일', longitude: 8.682, latitude: 50.1109, utcOffsetMinutes: 60, kind: 'global', aliases: ['하이델베르크', 'frankfurt'] },
  { id: 'munich', nameKo: '뮌헨', regionLabel: '독일 뮌헨', country: '독일', longitude: 11.582, latitude: 48.1351, utcOffsetMinutes: 60, kind: 'global', aliases: ['munich'] },
  { id: 'rome', nameKo: '로마', regionLabel: '이탈리아 로마', country: '이탈리아', longitude: 12.496, latitude: 41.9028, utcOffsetMinutes: 60, kind: 'global', aliases: ['이탈리아', '피렌체', 'rome', 'italy'] },
  { id: 'milan', nameKo: '밀라노', regionLabel: '이탈리아 밀라노', country: '이탈리아', longitude: 9.190, latitude: 45.4642, utcOffsetMinutes: 60, kind: 'global', aliases: ['milan'] },
  { id: 'madrid', nameKo: '마드리드', regionLabel: '스페인 마드리드', country: '스페인', longitude: -3.704, latitude: 40.4168, utcOffsetMinutes: 60, kind: 'global', aliases: ['스페인', 'madrid', 'spain'] },
  { id: 'barcelona', nameKo: '바르셀로나', regionLabel: '스페인 바르셀로나', country: '스페인', longitude: 2.173, latitude: 41.3851, utcOffsetMinutes: 60, kind: 'global', aliases: ['barcelona'] },
  { id: 'amsterdam', nameKo: '암스테르담', regionLabel: '네덜란드 암스테르담', country: '네덜란드', longitude: 4.904, latitude: 52.3676, utcOffsetMinutes: 60, kind: 'global', aliases: ['네덜란드', 'amsterdam'] },
  { id: 'zurich', nameKo: '취리히', regionLabel: '스위스 취리히', country: '스위스', longitude: 8.542, latitude: 47.3769, utcOffsetMinutes: 60, kind: 'global', aliases: ['스위스', '제네바', 'zurich'] },
  { id: 'vienna', nameKo: '빈', regionLabel: '오스트리아 빈', country: '오스트리아', longitude: 16.374, latitude: 48.2082, utcOffsetMinutes: 60, kind: 'global', aliases: ['비엔나', '오스트리아', 'vienna'] },
  { id: 'prague', nameKo: '프라하', regionLabel: '체코 프라하', country: '체코', longitude: 14.438, latitude: 50.0755, utcOffsetMinutes: 60, kind: 'global', aliases: ['체코', 'prague'] },
  { id: 'moscow', nameKo: '모스크바', regionLabel: '러시아 모스크바', country: '러시아', longitude: 37.617, latitude: 55.7558, utcOffsetMinutes: 180, kind: 'global', aliases: ['러시아', 'moscow'] },
  { id: 'istanbul', nameKo: '이스탄불', regionLabel: '튀르키예 이스탄불', country: '튀르키예', longitude: 28.978, latitude: 41.0082, utcOffsetMinutes: 180, kind: 'global', aliases: ['터키', '튀르키예', 'istanbul'] },

  // Americas
  { id: 'new_york', nameKo: '뉴욕', regionLabel: '미국 뉴욕', country: '미국', longitude: -74.006, latitude: 40.7128, utcOffsetMinutes: -300, kind: 'global', aliases: ['뉴저지', '맨해튼', 'new york', 'nyc'] },
  { id: 'los_angeles', nameKo: 'LA', regionLabel: '미국 로스앤젤레스', country: '미국', longitude: -118.244, latitude: 34.0522, utcOffsetMinutes: -480, kind: 'global', aliases: ['로스앤젤레스', '엘에이', '어바인', '캘리포니아', 'los angeles'] },
  { id: 'san_francisco', nameKo: '샌프란시스코', regionLabel: '미국 샌프란시스코', country: '미국', longitude: -122.419, latitude: 37.7749, utcOffsetMinutes: -480, kind: 'global', aliases: ['산호세', '실리콘밸리', 'san francisco'] },
  { id: 'seattle', nameKo: '시애틀', regionLabel: '미국 시애틀', country: '미국', longitude: -122.332, latitude: 47.6062, utcOffsetMinutes: -480, kind: 'global', aliases: ['포틀랜드', 'seattle'] },
  { id: 'chicago', nameKo: '시카고', regionLabel: '미국 시카고', country: '미국', longitude: -87.630, latitude: 41.8781, utcOffsetMinutes: -360, kind: 'global', aliases: ['일리노이', 'chicago'] },
  { id: 'atlanta', nameKo: '애틀랜타', regionLabel: '미국 애틀랜타', country: '미국', longitude: -84.388, latitude: 33.7490, utcOffsetMinutes: -300, kind: 'global', aliases: ['조지아', 'atlanta'] },
  { id: 'boston', nameKo: '보스턴', regionLabel: '미국 보스턴', country: '미국', longitude: -71.059, latitude: 42.3601, utcOffsetMinutes: -300, kind: 'global', aliases: ['boston'] },
  { id: 'washington_dc', nameKo: '워싱턴', regionLabel: '미국 워싱턴 D.C.', country: '미국', longitude: -77.037, latitude: 38.9072, utcOffsetMinutes: -300, kind: 'global', aliases: ['버지니아', '메릴랜드', 'washington'] },
  { id: 'dallas', nameKo: '댈러스', regionLabel: '미국 댈러스', country: '미국', longitude: -96.797, latitude: 32.7767, utcOffsetMinutes: -360, kind: 'global', aliases: ['오스틴', '텍사스', 'dallas'] },
  { id: 'houston', nameKo: '휴스턴', regionLabel: '미국 휴스턴', country: '미국', longitude: -95.370, latitude: 29.7604, utcOffsetMinutes: -360, kind: 'global', aliases: ['houston'] },
  { id: 'honolulu', nameKo: '하와이', regionLabel: '미국 호놀룰루', country: '미국', longitude: -157.858, latitude: 21.3069, utcOffsetMinutes: -600, kind: 'global', aliases: ['호놀룰루', 'honolulu', 'hawaii'] },
  { id: 'toronto', nameKo: '토론토', regionLabel: '캐나다 토론토', country: '캐나다', longitude: -79.383, latitude: 43.6532, utcOffsetMinutes: -300, kind: 'global', aliases: ['오타와', '캐나다', 'toronto', 'canada'] },
  { id: 'vancouver', nameKo: '밴쿠버', regionLabel: '캐나다 밴쿠버', country: '캐나다', longitude: -123.121, latitude: 49.2827, utcOffsetMinutes: -480, kind: 'global', aliases: ['vancouver'] },
  { id: 'montreal', nameKo: '몬트리올', regionLabel: '캐나다 몬트리올', country: '캐나다', longitude: -73.567, latitude: 45.5017, utcOffsetMinutes: -300, kind: 'global', aliases: ['montreal'] },
  { id: 'sao_paulo', nameKo: '상파울루', regionLabel: '브라질 상파울루', country: '브라질', longitude: -46.633, latitude: -23.5505, utcOffsetMinutes: -180, kind: 'global', aliases: ['브라질', '리우', 'sao paulo'] },
  { id: 'buenos_aires', nameKo: '부에노스아이레스', regionLabel: '아르헨티나 부에노스아이레스', country: '아르헨티나', longitude: -58.382, latitude: -34.6037, utcOffsetMinutes: -180, kind: 'global', aliases: ['아르헨티나'] },
  { id: 'mexico_city', nameKo: '멕시코시티', regionLabel: '멕시코 멕시코시티', country: '멕시코', longitude: -99.133, latitude: 19.4326, utcOffsetMinutes: -360, kind: 'global', aliases: ['멕시코'] },

  // Oceania
  { id: 'sydney', nameKo: '시드니', regionLabel: '호주 시드니', country: '호주', longitude: 151.209, latitude: -33.8688, utcOffsetMinutes: 600, kind: 'global', aliases: ['호주', '캔버라', 'sydney', 'australia'] },
  { id: 'melbourne', nameKo: '멜버른', regionLabel: '호주 멜버른', country: '호주', longitude: 144.963, latitude: -37.8136, utcOffsetMinutes: 600, kind: 'global', aliases: ['melbourne'] },
  { id: 'brisbane', nameKo: '브리즈번', regionLabel: '호주 브리즈번', country: '호주', longitude: 153.025, latitude: -27.4698, utcOffsetMinutes: 600, kind: 'global', aliases: ['골드코스트', 'brisbane'] },
  { id: 'auckland', nameKo: '오클랜드', regionLabel: '뉴질랜드 오클랜드', country: '뉴질랜드', longitude: 174.763, latitude: -36.8485, utcOffsetMinutes: 720, kind: 'global', aliases: ['뉴질랜드', '웰링턴', 'auckland'] },
];

export const POPULAR_BIRTH_PLACES = [
  '서울',
  '부산',
  '인천',
  '대구',
  '대전',
  '광주',
  '강릉',
  '전주',
  '제주',
  '도쿄',
  '뉴욕',
];

export function computeTrueSolarOffsetMinutes(
  longitude: number,
  utcOffsetMinutes: number,
): number {
  const stdMeridian = (utcOffsetMinutes / 60) * 15;
  return Math.round((longitude - stdMeridian) * 4);
}

export function formatLongitudeKo(longitude: number): string {
  const abs = Math.abs(longitude).toFixed(2);
  return longitude >= 0 ? `동경 ${abs}°` : `서경 ${abs}°`;
}

export function formatUtcOffsetKo(utcOffsetMinutes: number): string {
  const sign = utcOffsetMinutes >= 0 ? '+' : '-';
  const absMin = Math.abs(utcOffsetMinutes);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return m === 0
    ? `UTC${sign}${h}`
    : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

export function computeRegionalAura(
  country: string,
  longitude: number,
  latitude?: number,
): {
  regionElement: ElementKey;
  regionDirectionKo: string;
  regionNote: string;
} {
  const lat = latitude ?? 36.5;

  if (country === '대한민국' || country === '한반도 북부') {
    if (longitude >= 128.35) {
      return {
        regionElement: 'wood',
        regionDirectionKo: '동방 · 목(木)',
        regionNote:
          '해가 먼저 뜨는 동방 목(木) 기운의 터전이라, 진취적인 시작 에너지와 개척 성향이 자연스럽게 실려.',
      };
    }
    if (lat < 35.3 && longitude < 128.35) {
      return {
        regionElement: 'fire',
        regionDirectionKo: '남방 · 화(火)',
        regionNote:
          '따스한 남해의 양기가 감도는 남방 화(火) 기운의 터전이라, 사람 마음을 끄는 온기와 표현력이 살아나.',
      };
    }
    if (longitude <= 126.8 && lat >= 35.3) {
      return {
        regionElement: 'metal',
        regionDirectionKo: '서방 · 금(金)',
        regionNote:
          '맑은 서해 바람이 불어오는 서방 금(金) 기운의 터전이라, 선을 긋는 결단력과 단단한 실속이 깃들어.',
      };
    }
    if (lat >= 37.78) {
      return {
        regionElement: 'water',
        regionDirectionKo: '북방 · 수(水)',
        regionNote:
          '깊고 고요한 북방 수(水) 기운의 터전이라, 상황을 꿰뚫어 보는 직감과 깊은 사색의 결이 더해져.',
      };
    }
    return {
      regionElement: 'earth',
      regionDirectionKo: '중앙 · 토(土)',
      regionNote:
        '사방의 기운을 고르게 모으는 중앙 토(土)의 중심축이라, 균형 감각과 중심 잡는 힘이 바탕에 깔려.',
    };
  }

  // Overseas regional directional aura relative to Korea
  if (longitude > 132) {
    return {
      regionElement: 'wood',
      regionDirectionKo: '동방 · 목(木)',
      regionNote:
        '한반도보다 동쪽 해돋이 방향의 목(木) 기운이 닿는 곳이라, 새로운 판을 여는 추진력과 실행력이 도드라져.',
    };
  }
  if (longitude < -30) {
    return {
      regionElement: 'metal',
      regionDirectionKo: '대서양·미주 · 금(金)',
      regionNote:
        '머나먼 서쪽 지평선 너머 금(金) 기운이 강하게 서리는 터전이라, 독립심과 냉철한 판단력이 배어나와.',
    };
  }
  if (lat < 24) {
    return {
      regionElement: 'fire',
      regionDirectionKo: '남방 · 화(火)',
      regionNote:
        '적도와 남방의 뜨거운 태양 열기가 스민 화(火) 기운의 터전이라, 열정적이고 화끈한 존재감이 살아나.',
    };
  }
  if (longitude < 124) {
    return {
      regionElement: 'metal',
      regionDirectionKo: '서방 · 금(金)',
      regionNote:
        '서쪽 대륙·바다 방위의 금(金) 기운이 흐르는 곳이라, 차분한 분별력과 자기만의 원칙이 뚜렷하게 잡혀.',
    };
  }
  return {
    regionElement: 'earth',
    regionDirectionKo: '중앙 · 토(土)',
    regionNote:
      '안정된 경도 위에 자리한 토(土) 기운의 터전이라, 차분하게 뿌리를 내리고 중심을 지켜 가는 결을 품고 있어.',
  };
}

function stripKoreanAdminSuffix(token: string): string {
  let s = token.trim();
  const longSuffixes = ['특별자치도', '특별자치시', '특별시', '광역시'];
  for (const suffix of longSuffixes) {
    if (s.endsWith(suffix) && s.length > suffix.length + 1) {
      s = s.slice(0, -suffix.length);
      break;
    }
  }

  // Preserve well-known 2-char Korean cities like 전주, 진주, 청주, 충주, 원주, 공주, 나주, 여주, 광주, 구리, 사천, 인천 etc.
  if (s.length >= 3) {
    for (const shortSuffix of ['도', '시', '군', '구', '읍', '면', '동', '리']) {
      if (s.endsWith(shortSuffix)) {
        const candidate = s.slice(0, -1);
        if (candidate.length >= 2) {
          return candidate;
        }
      }
    }
  }
  return s;
}

function normalizePlaceKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[,·•\-_/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function entryToResolved(
  entry: BirthPlaceCatalogEntry,
  displayLabel: string,
  source: ResolvedBirthPlace['source'],
  matched: boolean,
): ResolvedBirthPlace {
  const aura = computeRegionalAura(entry.country, entry.longitude, entry.latitude);
  return {
    cityId: entry.id,
    label: displayLabel,
    matchedName: entry.nameKo,
    country: entry.country,
    longitude: entry.longitude,
    latitude: entry.latitude,
    utcOffsetMinutes: entry.utcOffsetMinutes,
    matched,
    source,
    ...aura,
  };
}

function scoreCatalogMatch(
  entry: BirthPlaceCatalogEntry,
  compactFull: string,
  tokenPairs: { raw: string; stripped: string }[],
): number {
  const candidates = [entry.nameKo, ...entry.aliases];
  const baseWeight =
    entry.kind === 'city' ? 120 : entry.kind === 'global' ? 110 : 30;

  let best = 0;

  for (const cand of candidates) {
    const cNorm = cand.toLowerCase().replace(/\s+/g, '');
    if (!cNorm) continue;

    if (compactFull === cNorm) {
      best = Math.max(best, baseWeight + 80 + cNorm.length);
    }

    for (const tok of tokenPairs) {
      if (tok.raw === cNorm || tok.stripped === cNorm) {
        best = Math.max(best, baseWeight + 55 + cNorm.length);
      } else if (
        cNorm.length >= 2 &&
        (tok.stripped.startsWith(cNorm) || (tok.stripped.length >= 2 && cNorm.startsWith(tok.stripped)))
      ) {
        best = Math.max(best, baseWeight + 25 + Math.min(tok.stripped.length, cNorm.length));
      }
    }

    if (cNorm.length >= 2 && compactFull.includes(cNorm)) {
      best = Math.max(best, baseWeight + 15 + cNorm.length);
    }
  }

  return best;
}

export function resolveBirthPlaceText(rawText: string): ResolvedBirthPlace {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return entryToResolved(BIRTH_PLACE_CATALOG[0], '서울', 'preset', true);
  }

  const normalized = normalizePlaceKey(trimmed);
  const compactFull = normalized.replace(/\s+/g, '');

  // Explicit Korean disambiguation rules (e.g. 경기 광주 vs 광주광역시, 경남 고성 vs 강원 고성)
  if (compactFull.includes('경기') && compactFull.includes('광주')) {
    const gg = BIRTH_PLACE_CATALOG.find((e) => e.id === 'gyeonggi_gwangju');
    if (gg) return entryToResolved(gg, trimmed, 'gazetteer', true);
  }
  if ((compactFull.includes('경남') || compactFull.includes('경상남')) && compactFull.includes('고성')) {
    const gn = BIRTH_PLACE_CATALOG.find((e) => e.id === 'goseong_gn');
    if (gn) return entryToResolved(gn, trimmed, 'gazetteer', true);
  }
  if ((compactFull.includes('강원')) && compactFull.includes('고성')) {
    const gw = BIRTH_PLACE_CATALOG.find((e) => e.id === 'goseong_gw');
    if (gw) return entryToResolved(gw, trimmed, 'gazetteer', true);
  }

  const rawTokens = normalized.split(' ').filter(Boolean);
  const tokenPairs = rawTokens.map((t) => ({
    raw: t,
    stripped: stripKoreanAdminSuffix(t),
  }));

  let bestEntry: BirthPlaceCatalogEntry | null = null;
  let bestScore = 0;

  for (const entry of BIRTH_PLACE_CATALOG) {
    const score = scoreCatalogMatch(entry, compactFull, tokenPairs);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 0) {
    return entryToResolved(bestEntry, trimmed, 'gazetteer', true);
  }

  // Fallback to Seoul meridian if unrecognized offline text, while preserving user's typed label
  const seoul = BIRTH_PLACE_CATALOG[0];
  const aura = computeRegionalAura('대한민국', seoul.longitude, seoul.latitude);
  return {
    cityId: 'custom',
    label: trimmed,
    matchedName: trimmed,
    country: '사용자 입력',
    longitude: seoul.longitude,
    latitude: seoul.latitude,
    utcOffsetMinutes: seoul.utcOffsetMinutes,
    matched: false,
    source: 'fallback',
    ...aura,
    regionNote:
      '직접 입력한 지역명이 오프라인 사전에 없어 표준 경도(126.98°E)로 임시 계산했어요. 아래 "전 세계 주소 검색"을 누르거나 경도를 직접 맞추면 더 정밀하게 계산돼요.',
  };
}

export function resolveBirthLocation(input: BirthInput): ResolvedBirthPlace {
  const rawPlace = input.birthPlace?.trim() || '';

  if (
    typeof input.birthLongitude === 'number' &&
    Number.isFinite(input.birthLongitude) &&
    typeof input.birthUtcOffsetMinutes === 'number' &&
    Number.isFinite(input.birthUtcOffsetMinutes)
  ) {
    const fromText = rawPlace ? resolveBirthPlaceText(rawPlace) : null;
    const country =
      fromText && fromText.matched ? fromText.country : '사용자 지정 좌표';
    const label = rawPlace || fromText?.label || formatLongitudeKo(input.birthLongitude);
    const aura = computeRegionalAura(country, input.birthLongitude, fromText?.latitude);
    return {
      cityId: fromText?.cityId || input.cityId || 'custom',
      label,
      matchedName: fromText?.matched ? fromText.matchedName : label,
      country,
      longitude: input.birthLongitude,
      latitude: fromText?.latitude,
      utcOffsetMinutes: input.birthUtcOffsetMinutes,
      matched: true,
      source: fromText?.matched ? fromText.source : 'custom',
      ...aura,
    };
  }

  if (rawPlace) {
    return resolveBirthPlaceText(rawPlace);
  }

  const preset = BIRTH_CITIES.find((c) => c.id === input.cityId) ?? BIRTH_CITIES[0];
  const catalogMatch = BIRTH_PLACE_CATALOG.find((e) => e.id === preset.id);
  if (catalogMatch) {
    return entryToResolved(catalogMatch, catalogMatch.nameKo, 'preset', true);
  }
  const aura = computeRegionalAura(preset.country, preset.longitude);
  return {
    cityId: preset.id,
    label: preset.nameKo,
    matchedName: preset.nameKo,
    country: preset.country,
    longitude: preset.longitude,
    utcOffsetMinutes: preset.utcOffsetMinutes,
    matched: true,
    source: 'preset',
    ...aura,
  };
}

export function suggestBirthPlaces(query: string, limit = 8): BirthPlaceCatalogEntry[] {
  const q = normalizePlaceKey(query);
  if (!q) {
    return BIRTH_PLACE_CATALOG.filter((e) =>
      ['seoul', 'busan', 'incheon', 'daegu', 'daejeon', 'gwangju', 'gangneung', 'jeonju', 'jeju', 'tokyo', 'new_york'].includes(e.id),
    ).slice(0, limit);
  }

  const qStripped = stripKoreanAdminSuffix(q.split(' ').pop() || q);
  const scored: { entry: BirthPlaceCatalogEntry; score: number }[] = [];

  for (const entry of BIRTH_PLACE_CATALOG) {
    const terms = [entry.nameKo, entry.regionLabel, entry.country, ...entry.aliases];
    let best = 0;
    for (const term of terms) {
      const tLow = term.toLowerCase();
      if (tLow === q || tLow === qStripped) best = Math.max(best, 100);
      else if (tLow.startsWith(q) || (qStripped && tLow.startsWith(qStripped)))
        best = Math.max(best, 80);
      else if (tLow.includes(q) || (qStripped && tLow.includes(qStripped)))
        best = Math.max(best, 50);
    }
    if (best > 0) {
      const kindBonus = entry.kind === 'city' ? 20 : entry.kind === 'global' ? 10 : 0;
      scored.push({ entry, score: best + kindBonus });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

interface NominatimItem {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function estimateUtcOffsetMinutes(lat: number, lon: number, countryCode?: string): number {
  const cc = (countryCode || '').toLowerCase();
  if (cc === 'kr' || cc === 'jp' || cc === 'kp') return 540;
  if (cc === 'cn' || cc === 'tw' || cc === 'hk' || cc === 'sg' || cc === 'ph' || cc === 'my') return 480;
  if (cc === 'th' || cc === 'vn' || cc === 'id') return 420;
  if (cc === 'in') return 330;
  if (cc === 'gb') return 0;
  if (cc === 'fr' || cc === 'de' || cc === 'it' || cc === 'es' || cc === 'nl' || cc === 'ch' || cc === 'at' || cc === 'cz') return 60;

  if (lat >= 33 && lat <= 43 && lon >= 124 && lon <= 132) {
    return 540;
  }
  const approxHours = Math.round(lon / 15);
  return Math.max(-720, Math.min(840, approxHours * 60));
}

export async function searchBirthPlaceOnline(
  query: string,
  limit = 5,
): Promise<ResolvedBirthPlace[]> {
  const trimmed = query.trim();
  if (!trimmed || typeof fetch !== 'function') return [];

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('accept-language', 'ko,en');

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as NominatimItem[];
    if (!Array.isArray(rows)) return [];

    return rows
      .map((item) => {
        const lat = Number(item.lat);
        const lon = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        const addr = item.address ?? {};
        const shortName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state ||
          (item.display_name ? item.display_name.split(',')[0]?.trim() : trimmed) ||
          trimmed;
        const country = addr.country || '해외/직접 검색';
        const utcOffsetMinutes = estimateUtcOffsetMinutes(lat, lon, addr.country_code);
        const aura = computeRegionalAura(country, lon, lat);
        const label =
          item.display_name
            ?.split(',')
            .slice(0, 2)
            .map((s) => s.trim())
            .filter(Boolean)
            .join(' · ') || shortName;

        const resolved: ResolvedBirthPlace = {
          cityId: `osm-${lon.toFixed(2)}`,
          label,
          matchedName: shortName,
          country,
          longitude: Number(lon.toFixed(3)),
          latitude: Number(lat.toFixed(3)),
          utcOffsetMinutes,
          matched: true,
          source: 'online',
          ...aura,
        };
        return resolved;
      })
      .filter((x): x is ResolvedBirthPlace => Boolean(x));
  } catch {
    return [];
  }
}
