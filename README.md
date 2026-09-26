# DayFrame

지난 한 시간을 짧게 남기고, 밤에 오늘을 한 장의 카드로 다시 만나는 한국어 중심 라이프로그 앱입니다.

## 기술 구성

- Expo SDK 57
- React Native + TypeScript
- Expo Router
- Expo SQLite

## 실행

```bash
npm install
npm run android
```

## 현재 가능한 흐름

1. 홈에서 감성적인 오늘 카드를 확인한다.
2. `지난 한 시간 기록하기`에서 활동을 빠르게 고르거나 직접 입력한다.
3. 기록은 기기 내부 SQLite에 저장된다.
4. 하단 `일정표`에서 기록, 건너뛰기, 미기록 구간을 구분해 확인한다.

제품 결정과 임시 기본값은 [`docs/product-decisions.md`](docs/product-decisions.md)에 기록합니다.
