# 청명 (CHEONGMYEONG · 淸明)

> **정밀 천문 만세력 사주 명리 & 60fps 모션 UX/UI 디자인 스튜디오 (Web + Mobile PWA)**

청명(淸明)은 Jean Meeus 천문 알고리즘 기반의 정밀 만세력 엔진 위에, Framer Motion 물리 기반 모션그래픽과 UX/UI 디자이너를 위한 실시간 토큰·스프링·뷰포트 인스펙터(`Studio ⌘K`)를 결합한 웹·모바일 사주 애플리케이션입니다.

---

## ✨ 주요 기능

### 1. 정통 천문·만세력 엔진 (`src/engine/`)
- **천문 절입 시각 & 음양력 변환**: 1900–2100년 음·양력 및 윤달 변환, 입춘(315°) 및 12절입 시각 정밀 계산
- **진태양시 · 균시차 · 야자시/조자시 보정**: 출생지 경도 기반 진태양시(서울 `-32분` 등), 균시차(EoT), 야자시/조자시 및 출생시간 미상(삼주) 지원
- **심층 명리 분석**: 천간·지지 십성, 지장간(여기·중기·정기), 십이운성, 가중 오행·음양 비율, 신강/신약, 격국, 용신·희신·기신, 형충회합, 12종 이상 신살
- **60갑자 일주 해설 · 대운/세운/월운/일진 · 2인 궁합**: 모든 60갑자 일주 현대 해설과 5개 지표 기반 궁합 분석

### 2. 물리 기반 모션그래픽 시스템 (`src/motion/`)
- **AmbientCosmosCanvas**: 사용자의 주력 오행과 현재 테마에 반응하는 HTML5 Canvas 천체·수묵 파티클 배경
- **PillarRevealCard**: 마우스 포인터 3D 틸트 & 클릭/탭 시 **3D 스프링 플립**으로 지장간·12운성·신살을 펼치는 사주 기둥 카드
- **OhaengOrbitalViz**: 오행 상생(外)·상극(內) 에너지 흐름을 실시간으로 시각화한 인터랙티브 SVG 오비탈 그래프
- **DaewoonTimelineMotion**: 10년 대운 흐름을 베지어 파형과 스프링 스냅 스크러버로 탐색하는 운세 타임라인

### 3. UX/UI 디자이너 스튜디오 (`Studio ⌘K` & `src/studio/`)
- **실시간 테마 & 오행 토큰 에디터**: 4종 테마(현무 흑요석, 한지 수묵 라이트, 청자 비취, 네오 단청), 오행 컬러 피커, 라운드·블러·폰트 스케일·밀도 실시간 제어
- **멀티 디바이스 스테이지 & 그리드 레드라인**: `Full`, `Desktop(1440px)`, `Tablet(768px)`, `iPhone 16 Pro(393×852)`, `Split(Web+Mobile)` 뷰포트 전환 및 12/4컬럼·8px 베이스라인·Safe Area 오버레이
- **모션 물리 랩**: `Stiffness / Damping / Mass` 실시간 조정, 감쇠 조화 곡선 SVG 플롯, `0.1x–2.0x` 속도 제어, 모션 다시 재생(Replay) 및 화면 위 **Motion Spec 배지**
- **원클릭 핸드오프 익스포트**: W3C/Figma Design Tokens JSON, CSS Custom Properties, Framer Motion Config, 그리고 **Figma에 바로 드롭 가능한 벡터 SVG 사주 포스터** 및 2x PNG 내보내기

---

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript 5.9, Vite 6
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), CSS Custom Properties Design Tokens
- **Motion & Graphics**: Framer Motion 12, HTML5 Canvas 2D, Dynamic SVG
- **Testing**: Vitest 3 (`jsdom`)
- **PWA**: Web App Manifest + Service Worker (`public/manifest.json`, `public/sw.js`)

---

## 🚀 로컬 실행 및 테스트

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 단위 테스트 실행 (만세력·천문·궁합 엔진)
npm test

# 타입 체크 및 프로덕션 빌드
npm run build
```

*(Windows PowerShell 실행 정책 환경에서는 `npm` 대신 `npm.cmd`, `npx` 대신 `npx.cmd`를 사용하세요.)*
