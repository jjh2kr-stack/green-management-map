# GreenTBM v2 최종 재구성본

## 먼저 Vercel 환경변수 2개
- `NAVER_SEARCH_CLIENT_ID` = 네이버 개발자센터 GreenTBM의 Client ID
- `NAVER_SEARCH_CLIENT_SECRET` = 네이버 개발자센터 GreenTBM의 Client Secret
- 적용 환경: Production and Preview
- 저장 후 반드시 Redeploy

## 네이버 클라우드 Maps
`src/config.js`의 `NAVER_MAPS_CLIENT_ID`는 네이버 클라우드 Maps Client ID입니다.
현재 값은 기존에 사용하던 키로 입력되어 있습니다.
Web 서비스 URL에는 실제 배포 도메인을 등록하세요.

## 검색 순서
1. 교량·IC·관할구간 내장 검색
2. 네이버 지역 검색 API: 역명, 공원명, 시설명
3. 네이버 Maps Geocoding: 도로명·지번 주소

## 확인 주소
- 앱 상태: `/api/health`
- 정상 예시: `{ "ok": true, "searchClientId": true, "searchClientSecret": true }`

## GitHub 업로드
ZIP을 풀고 폴더 안의 `api`, `src`, `index.html`, `package.json`, `README.md`를 저장소 최상단에 올리세요.
