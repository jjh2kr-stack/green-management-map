# GreenTBM v1.1 검색 수정판

## 핵심 수정
- 오목교역 같은 장소명 검색을 위해 Vercel 서버리스 API 추가
- 네이버 지역검색 API 사용 가능
- 환경변수 미설정 시에도 주요 장소는 내장 좌표로 검색
- 네이버지도에서 직접 검색 열기 버튼 추가

## 반드시 알아야 할 점
네이버 Maps Geocoding은 주소 검색용이라 `오목교역` 같은 장소명은 잘 안 됩니다.
장소명 검색은 네이버 개발자센터의 `검색 API > 지역`을 써야 합니다.

## Vercel 환경변수
Vercel Project Settings > Environment Variables에 아래 2개를 넣으세요.

NAVER_SEARCH_CLIENT_ID
NAVER_SEARCH_CLIENT_SECRET

네이버 클라우드 Maps Client ID와 다릅니다.
네이버 개발자센터에서 애플리케이션을 만들고 `검색` API를 사용 설정해야 합니다.
