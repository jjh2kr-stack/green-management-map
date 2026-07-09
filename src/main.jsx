import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import checklistData from './data/checklists.json';
import './styles/style.css';

const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_KEY || 'bfyno0gxjg';
const SMARTWAY_URL = 'https://smartway.seoul.go.kr/web/main.view';
const WEATHER_URL = 'https://www.weather.go.kr/w/index.do';
const WEATHER_WARNING_URL = 'https://www.weather.go.kr/w/weather/warning/status.do';
const NAVER_MAP_SEARCH_URL = 'https://map.naver.com/p/search/';

function loadNaverMapScript() {
  if (window.naver?.maps?.Service?.geocode) return Promise.resolve();

  const existing = document.querySelector('script[data-naver-map="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.naver?.maps?.Service?.geocode) resolve();
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_KEY}&submodules=geocoder`;
    script.async = true;
    script.dataset.naverMap = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function splitOriginalLines(text) {
  if (!text) return [];
  return String(text).split('\n').filter((line) => line.trim() !== '');
}

function getDistanceMeters(a, b) {
  const earth = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * earth * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

const sampleCctvs = [
  { name: '시청 앞 CCTV', lat: 37.5659, lng: 126.9774, source: '서울도시고속도로 Smartway' },
  { name: '덕수궁길 CCTV', lat: 37.5671, lng: 126.9758, source: '서울도시고속도로 Smartway' },
  { name: '무교로 CCTV', lat: 37.5670, lng: 126.9799, source: '서울도시고속도로 Smartway' },
  { name: '서울역 주변 CCTV', lat: 37.5559, lng: 126.9723, source: '서울도시고속도로 Smartway' },
  { name: '광화문광장 CCTV', lat: 37.5759, lng: 126.9768, source: '서울도시고속도로 Smartway' },
  { name: '청계광장 CCTV', lat: 37.5690, lng: 126.9787, source: '서울도시고속도로 Smartway' },
  { name: '남산공원 북측 CCTV', lat: 37.5532, lng: 126.9810, source: '서울도시고속도로 Smartway' },
  { name: '여의도공원 CCTV', lat: 37.5267, lng: 126.9228, source: '서울도시고속도로 Smartway' },
  { name: '서울숲 CCTV', lat: 37.5446, lng: 127.0374, source: '서울도시고속도로 Smartway' },
  { name: '월드컵공원 CCTV', lat: 37.5682, lng: 126.8932, source: '서울도시고속도로 Smartway' },
  { name: '보라매공원 CCTV', lat: 37.4930, lng: 126.9180, source: '서울도시고속도로 Smartway' },
  { name: '올림픽공원 CCTV', lat: 37.5206, lng: 127.1216, source: '서울도시고속도로 Smartway' },
  { name: '어린이대공원 CCTV', lat: 37.5493, lng: 127.0819, source: '서울도시고속도로 Smartway' },
  { name: '양재시민의숲 CCTV', lat: 37.4705, lng: 127.0354, source: '서울도시고속도로 Smartway' },
  { name: '북서울꿈의숲 CCTV', lat: 37.6217, lng: 127.0413, source: '서울도시고속도로 Smartway' },
  { name: '서대문독립공원 CCTV', lat: 37.5745, lng: 126.9564, source: '서울도시고속도로 Smartway' },
  { name: '선유도공원 CCTV', lat: 37.5431, lng: 126.9002, source: '서울도시고속도로 Smartway' },
  { name: '반포한강공원 CCTV', lat: 37.5106, lng: 126.9959, source: '서울도시고속도로 Smartway' },
  { name: '잠실한강공원 CCTV', lat: 37.5177, lng: 127.0861, source: '서울도시고속도로 Smartway' },
  { name: '망원한강공원 CCTV', lat: 37.5567, lng: 126.8994, source: '서울도시고속도로 Smartway' },
  { name: '강남역 주변 CCTV', lat: 37.4979, lng: 127.0276, source: '서울도시고속도로 Smartway' }
];

const seoulPlaceFallbacks = [
  { name: '서울광장', lat: 37.5665, lng: 126.9780, address: '서울 중구 세종대로' },
  { name: '광화문광장', lat: 37.5759, lng: 126.9768, address: '서울 종로구 세종대로' },
  { name: '청계광장', lat: 37.5690, lng: 126.9787, address: '서울 중구 청계천로' },
  { name: '서울숲', lat: 37.5446, lng: 127.0374, address: '서울 성동구 뚝섬로 273' },
  { name: '남산공원', lat: 37.5532, lng: 126.9810, address: '서울 중구 삼일대로 231' },
  { name: '여의도공원', lat: 37.5267, lng: 126.9228, address: '서울 영등포구 여의공원로 68' },
  { name: '월드컵공원', lat: 37.5682, lng: 126.8932, address: '서울 마포구 하늘공원로 95' },
  { name: '보라매공원', lat: 37.4930, lng: 126.9180, address: '서울 동작구 여의대방로20길 33' },
  { name: '올림픽공원', lat: 37.5206, lng: 127.1216, address: '서울 송파구 올림픽로 424' },
  { name: '어린이대공원', lat: 37.5493, lng: 127.0819, address: '서울 광진구 능동로 216' },
  { name: '양재시민의숲', lat: 37.4705, lng: 127.0354, address: '서울 서초구 매헌로 99' },
  { name: '북서울꿈의숲', lat: 37.6217, lng: 127.0413, address: '서울 강북구 월계로 173' },
  { name: '서대문독립공원', lat: 37.5745, lng: 126.9564, address: '서울 서대문구 통일로 251' },
  { name: '선유도공원', lat: 37.5431, lng: 126.9002, address: '서울 영등포구 선유로 343' },
  { name: '반포한강공원', lat: 37.5106, lng: 126.9959, address: '서울 서초구 신반포로11길 40' },
  { name: '잠실한강공원', lat: 37.5177, lng: 127.0861, address: '서울 송파구 한가람로 65' },
  { name: '망원한강공원', lat: 37.5567, lng: 126.8994, address: '서울 마포구 마포나루길 467' },
  { name: '중랑천', lat: 37.5847, lng: 127.0730, address: '서울 중랑천 일대' },
  { name: '불광천', lat: 37.5887, lng: 126.9156, address: '서울 은평구 불광천 일대' },
  { name: '안양천', lat: 37.5170, lng: 126.8815, address: '서울 양천구 안양천 일대' },
  { name: '강남역', lat: 37.4979, lng: 127.0276, address: '서울 강남구 강남대로' }
];

function normalizeKeyword(value) {
  return String(value || '').replace(/\s/g, '').toLowerCase();
}

function findFallbackPlace(keyword) {
  const q = normalizeKeyword(keyword);
  if (!q) return null;
  return seoulPlaceFallbacks.find((place) => {
    const name = normalizeKeyword(place.name);
    const address = normalizeKeyword(place.address);
    return name.includes(q) || q.includes(name) || address.includes(q) || q.includes(address);
  }) || null;
}

function buildGeocodeQueries(keyword) {
  const q = keyword.trim();
  const list = [q];
  if (!q.includes('서울')) list.push(`서울 ${q}`);
  list.push(`${q} 서울`);
  const fallback = findFallbackPlace(q);
  if (fallback?.address) list.push(fallback.address);
  return [...new Set(list.filter(Boolean))];
}

function geocodeOnce(query) {
  return new Promise((resolve) => {
    window.naver.maps.Service.geocode({ query }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        resolve(null);
        return;
      }
      const addresses = response?.v2?.addresses || [];
      if (!addresses.length) {
        resolve(null);
        return;
      }
      const result = addresses[0];
      resolve({
        name: query,
        lat: Number(result.y),
        lng: Number(result.x),
        address: result.roadAddress || result.jibunAddress || result.englishAddress || query,
        source: 'naver-geocoding'
      });
    });
  });
}

async function searchNaverGeocode(keyword) {
  const queries = buildGeocodeQueries(keyword);
  for (const query of queries) {
    const found = await geocodeOnce(query);
    if (found && Number.isFinite(found.lat) && Number.isFinite(found.lng)) {
      return { ...found, name: keyword };
    }
  }
  return null;
}

function makeSmartwayLink(placeName) {
  return `${SMARTWAY_URL}?q=${encodeURIComponent(placeName || '')}`;
}

function makeNaverMapSearchLink(placeName) {
  return `${NAVER_MAP_SEARCH_URL}${encodeURIComponent(placeName || '')}`;
}

function ChecklistBlock({ title, text, tone = 'green' }) {
  const lines = splitOriginalLines(text);
  return (
    <section className={`card checklist-card ${tone}`}>
      <h3>{title}</h3>
      {lines.length === 0 ? (
        <p className="empty">등록된 체크리스트 없음</p>
      ) : (
        <div className="checklist-list">
          {lines.map((line, index) => (
            <label key={`${title}-${index}`} className="check-row">
              <input type="checkbox" />
              <span>{line}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

function PlainInfo({ title, text }) {
  const lines = splitOriginalLines(text);
  if (!lines.length) return null;
  return (
    <section className="card small-card">
      <h3>{title}</h3>
      {lines.map((line, index) => <p key={index} className="raw-line">{line}</p>)}
    </section>
  );
}

function ActionLink({ href, children }) {
  return (
    <a className="action-link" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function MapPanel() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const workMarkerRef = useRef(null);
  const circleRef = useRef(null);
  const cctvMarkerRefs = useRef([]);
  const infoWindowRef = useRef(null);

  const [mapStatus, setMapStatus] = useState('지도 불러오는 중');
  const [placeQuery, setPlaceQuery] = useState('서울광장');
  const [selectedPlace, setSelectedPlace] = useState({ name: '서울광장', lat: 37.5665, lng: 126.9780, address: '서울 중구 세종대로', source: 'initial' });
  const [nearbyCctvs, setNearbyCctvs] = useState([]);
  const [searchMessage, setSearchMessage] = useState('작업구역을 검색하면 네이버 지오코딩 결과 기준으로 주변 CCTV가 갱신됩니다.');
  const [isSearching, setIsSearching] = useState(false);

  function clearCctvMarkers() {
    cctvMarkerRefs.current.forEach((marker) => marker.setMap(null));
    cctvMarkerRefs.current = [];
  }

  function updateCctvMarkers(map, place) {
    clearCctvMarkers();
    const ranked = sampleCctvs
      .map((cctv) => ({ ...cctv, distance: getDistanceMeters(place, cctv) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    ranked.forEach((cctv) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(cctv.lat, cctv.lng),
        map,
        title: cctv.name,
        icon: {
          content: '<div class="map-badge cctv">CCTV</div>',
          anchor: new window.naver.maps.Point(30, 18)
        }
      });

      const info = new window.naver.maps.InfoWindow({
        content: `<div class="info-window"><strong>${cctv.name}</strong><br/>거리 약 ${cctv.distance.toLocaleString()}m<br/><span>출처: ${cctv.source}</span><br/><button onclick="window.open('${makeSmartwayLink(place.name)}','_blank')">Smartway CCTV 확인</button></div>`
      });
      window.naver.maps.Event.addListener(marker, 'click', () => info.open(map, marker));
      cctvMarkerRefs.current.push(marker);
    });
    setNearbyCctvs(ranked);
  }

  function updateWorkPlace(place) {
    const map = mapInstance.current;
    if (!map || !window.naver?.maps) return;
    const pos = new window.naver.maps.LatLng(place.lat, place.lng);
    map.setCenter(pos);
    map.setZoom(16);

    if (!workMarkerRef.current) {
      workMarkerRef.current = new window.naver.maps.Marker({
        position: pos,
        map,
        title: '작업구역',
        icon: {
          content: '<div class="map-badge work">작업구역</div>',
          anchor: new window.naver.maps.Point(42, 18)
        }
      });
    } else {
      workMarkerRef.current.setPosition(pos);
    }

    if (!circleRef.current) {
      circleRef.current = new window.naver.maps.Circle({
        map,
        center: pos,
        radius: 500,
        fillColor: '#22c55e',
        fillOpacity: 0.13,
        strokeColor: '#15803d',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
    } else {
      circleRef.current.setCenter(pos);
    }

    if (!infoWindowRef.current) infoWindowRef.current = new window.naver.maps.InfoWindow();
    infoWindowRef.current.setContent(`<div class="info-window"><strong>${place.name}</strong><br/>${place.address || ''}<br/>반경 500m CCTV 확인</div>`);
    infoWindowRef.current.open(map, workMarkerRef.current);
    updateCctvMarkers(map, place);
  }

  async function searchWorkPlace(event) {
    event?.preventDefault();
    const keyword = placeQuery.trim();
    if (!keyword) {
      setSearchMessage('검색할 작업구역명을 입력하세요.');
      return;
    }
    if (!window.naver?.maps?.Service?.geocode) {
      setSearchMessage('지오코딩 모듈을 불러오지 못했습니다. maps.js 주소에 &submodules=geocoder가 포함되어야 합니다.');
      return;
    }

    setIsSearching(true);
    setSearchMessage('네이버 지오코딩으로 작업구역 검색 중...');

    try {
      const geocoded = await searchNaverGeocode(keyword);
      const fallback = findFallbackPlace(keyword);
      const place = geocoded || (fallback ? { ...fallback, source: 'built-in-place' } : null);

      if (!place) {
        setSearchMessage('검색 결과가 없습니다. 주소는 도로명/지번으로 입력하고, 공원명은 예: 서울숲, 보라매공원, 양재시민의숲처럼 입력하세요.');
        return;
      }

      const sourceMessage = place.source === 'naver-geocoding'
        ? '네이버 지오코딩 결과 기준으로 이동했습니다.'
        : '네이버 지오코딩 결과가 없어 내장된 서울 공원/녹지 좌표로 이동했습니다.';

      const nextPlace = { ...place, name: keyword };
      setSelectedPlace(nextPlace);
      updateWorkPlace(nextPlace);
      setSearchMessage(`${sourceMessage} 반경 500m 주변 CCTV 목록을 갱신했습니다.`);
    } catch (error) {
      setSearchMessage(`검색 처리 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
    } finally {
      setIsSearching(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setSearchMessage('이 브라우저에서는 현재 위치를 사용할 수 없습니다.');
      return;
    }
    setSearchMessage('현재 위치 확인 중...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const place = {
          name: '현재 위치',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: '브라우저 GPS 기준',
          source: 'gps'
        };
        setSelectedPlace(place);
        updateWorkPlace(place);
        setSearchMessage('현재 위치 기준으로 주변 CCTV 목록을 갱신했습니다.');
      },
      () => setSearchMessage('현재 위치 권한이 거부되었거나 위치를 가져오지 못했습니다.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    let cancelled = false;
    loadNaverMapScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const center = new window.naver.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          zoom: 16,
          mapTypeControl: true,
          zoomControl: true,
          zoomControlOptions: { position: window.naver.maps.Position.TOP_RIGHT }
        });
        mapInstance.current = map;
        updateWorkPlace(selectedPlace);
        setMapStatus(window.naver?.maps?.Service?.geocode ? '지도/지오코딩 연동 완료' : '지도 연동 완료 · 지오코딩 모듈 미확인');
      })
      .catch(() => setMapStatus('네이버 지도 인증 또는 호출 실패'));
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="map-section">
      <div ref={mapRef} className="map" />

      <form className="map-search" onSubmit={searchWorkPlace}>
        <label>작업구역 검색</label>
        <div className="search-line">
          <input
            value={placeQuery}
            onChange={(event) => setPlaceQuery(event.target.value)}
            placeholder="예: 서울숲, 보라매공원, 서울 중구 세종대로"
          />
          <button type="submit" disabled={isSearching}>{isSearching ? '검색 중' : '검색'}</button>
        </div>
        <div className="search-actions">
          <button type="button" onClick={useCurrentLocation}>현재 위치</button>
          <a href={makeNaverMapSearchLink(placeQuery)} target="_blank" rel="noreferrer">네이버지도에서 확인</a>
        </div>
        <p>{searchMessage}</p>
      </form>

      <div className="map-status">{mapStatus}</div>
      <div className="legend">
        <span><b className="dot green" />작업구역</span>
        <span><b className="dot blue" />CCTV</span>
        <span><b className="dot yellow" />반경 500m</span>
      </div>

      <div className="floating-card cctv-panel">
        <div className="card-title-row">
          <h3>주변 CCTV</h3>
          <strong>{nearbyCctvs.length}개</strong>
        </div>
        <p className="place-label">{selectedPlace.name}</p>
        <div className="cctv-list">
          {nearbyCctvs.map((cctv) => (
            <button
              key={cctv.name}
              type="button"
              onClick={() => window.open(makeSmartwayLink(selectedPlace.name), '_blank')}
            >
              <span>{cctv.name}</span>
              <b>약 {cctv.distance.toLocaleString()}m</b>
            </button>
          ))}
        </div>
        <ActionLink href={makeSmartwayLink(selectedPlace.name)}>Smartway CCTV 열기</ActionLink>
      </div>

      <div className="floating-card weather-panel">
        <div className="card-title-row">
          <h3>날씨</h3>
          <span>기상청</span>
        </div>
        <p className="place-label">작업구역: {selectedPlace.name}</p>
        <p className="weather-note">작업 전 강수·폭염·한파·강풍 확인</p>
        <div className="warning-box">
          <b>기상특보</b>
          <span>특보 발효 시 기상청 특보현황에서 현재 내용 확인</span>
        </div>
        <div className="weather-actions">
          <ActionLink href={WEATHER_URL}>기상청 날씨 확인</ActionLink>
          <ActionLink href={WEATHER_WARNING_URL}>기상특보 확인</ActionLink>
        </div>
      </div>
    </section>
  );
}

function App() {
  const works = checklistData.works;
  const [selectedWorkName, setSelectedWorkName] = useState(works[0]?.workName || '');
  const [query, setQuery] = useState('');

  const selectedWork = useMemo(
    () => works.find((work) => work.workName === selectedWorkName) || works[0],
    [selectedWorkName, works]
  );

  const filteredWorks = useMemo(() => {
    const q = query.trim();
    if (!q) return works;
    return works.filter((work) => work.workName.includes(q) || work.category.includes(q));
  }, [query, works]);

  useEffect(() => {
    if (filteredWorks.length && !filteredWorks.some((work) => work.workName === selectedWorkName)) {
      setSelectedWorkName(filteredWorks[0].workName);
    }
  }, [filteredWorks, selectedWorkName]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">녹지관리 현장 통합 플랫폼</p>
          <h1>GreenTBM</h1>
        </div>
        <div className="source">체크리스트 원본: {checklistData.sourceFile}</div>
      </header>

      <main className="grid">
        <MapPanel />

        <aside className="side-panel">
          <section className="card select-card">
            <h2>공종 선택</h2>
            <input
              className="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="공종명 검색"
            />
            <select
              value={selectedWork?.workName || ''}
              onChange={(event) => setSelectedWorkName(event.target.value)}
            >
              {filteredWorks.map((work) => (
                <option key={work.workName} value={work.workName}>
                  {work.workName}
                </option>
              ))}
            </select>
            <div className="meta-row"><span>작업분류</span><strong>{selectedWork?.category || '-'}</strong></div>
            <div className="meta-row"><span>공종명</span><strong>{selectedWork?.workName || '-'}</strong></div>
          </section>

          <ChecklistBlock title="공통사항" text={checklistData.common.checklist} />
          <PlainInfo title="공통 개인안전장구류" text={checklistData.common.ppe} />

          <ChecklistBlock title="공종별 TBM 체크리스트" text={selectedWork?.checklist || ''} tone="blue" />
          <PlainInfo title="공종별 개인안전장구류" text={selectedWork?.ppe || ''} />
          <PlainInfo title="비고" text={selectedWork?.note || ''} />
        </aside>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
