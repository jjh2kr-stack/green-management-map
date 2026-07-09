# GreenTBM v0.5

변경사항

- 작업구역 검색 로직 재작성
  - 네이버 Maps JavaScript API를 `&submodules=geocoder`와 함께 로드
  - `naver.maps.Service.geocode({ query })` 순차 검색 적용
  - `검색어`, `서울 검색어`, `검색어 서울`, 내장 공원 주소 순서로 검색
  - 네이버 지오코딩 실패 시 서울 주요 공원/녹지 내장 좌표로 이동
- 기존 코드의 `const addresses` 중복 선언 오류 제거
- 검색 결과 기준 지도 이동, 작업구역 마커 이동, 반경 500m 원 갱신
- 검색 결과 기준 주변 CCTV 거리 재계산 및 마커/목록 갱신
- CCTV 연결 주소를 Smartway로 유지
  - https://smartway.seoul.go.kr/web/main.view
- 현재 위치 버튼 추가
- 날씨/기상특보는 기상청 날씨누리와 특보현황으로 연결
  - https://www.weather.go.kr/w/index.do
  - https://www.weather.go.kr/w/weather/warning/status.do
- 공통사항 + 공종별 체크리스트 원본 문구 유지

주의

- 네이버 Geocoding은 기본적으로 주소 검색용입니다. 공원명/시설명 같은 장소명은 검색이 실패할 수 있어, 주요 공원명은 내장 좌표로 보완했습니다.
- 브라우저에서 네이버 지역검색 REST API를 직접 호출하려면 Client Secret 노출 문제가 있어 권장하지 않습니다. 나중에 서버/API Route를 붙이면 네이버 장소검색까지 확장할 수 있습니다.
- Smartway CCTV는 외부 사이트 정책상 iframe 내 직접 재생이 제한될 수 있어 새 창으로 여는 방식입니다.
- 기상특보 원문을 앱 안에 자동 표시하려면 기상청 또는 공공데이터포털 API 키 연동이 필요합니다. 현재는 기상청 특보현황 페이지 연결 방식입니다.
