import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import checklistData from './data/checklists.json';
import './styles/style.css';

const NAVER_MAP_KEY = import.meta.env.VITE_NAVER_MAP_KEY || 'bfyno0gxjg';

function loadNaverMapScript() {
  if (window.naver?.maps) return Promise.resolve();
  const existing = document.querySelector('script[data-naver-map="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_KEY}`;
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

function MapPanel() {
  const mapRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('지도 불러오는 중');

  useEffect(() => {
    let cancelled = false;
    loadNaverMapScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const center = new window.naver.maps.LatLng(37.5665, 126.9780);
        const map = new window.naver.maps.Map(mapRef.current, {
          center,
          zoom: 16,
          mapTypeControl: true,
          zoomControl: true,
          zoomControlOptions: { position: window.naver.maps.Position.TOP_RIGHT }
        });

        new window.naver.maps.Polygon({
          map,
          paths: [
            new window.naver.maps.LatLng(37.56715, 126.97670),
            new window.naver.maps.LatLng(37.56720, 126.97920),
            new window.naver.maps.LatLng(37.56570, 126.97935),
            new window.naver.maps.LatLng(37.56560, 126.97685)
          ],
          fillColor: '#22c55e',
          fillOpacity: 0.22,
          strokeColor: '#15803d',
          strokeWeight: 3
        });

        new window.naver.maps.Marker({
          position: center,
          map,
          title: '작업구역',
          icon: {
            content: '<div class="map-badge work">작업구역</div>',
            anchor: new window.naver.maps.Point(42, 18)
          }
        });

        const cctvs = [
          { name: '시청 앞 CCTV', lat: 37.5659, lng: 126.9774 },
          { name: '덕수궁길 CCTV', lat: 37.5671, lng: 126.9758 },
          { name: '무교로 CCTV', lat: 37.5670, lng: 126.9799 }
        ];
        cctvs.forEach((cctv) => {
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
            content: `<div style="padding:12px;min-width:180px;line-height:1.5"><strong>${cctv.name}</strong><br/><button onclick="window.open('https://topis.seoul.go.kr/map/openCctvMap.do','_blank')" style="margin-top:8px;border:0;background:#2563eb;color:#fff;padding:7px 10px;border-radius:8px;cursor:pointer">CCTV 보기</button></div>`
          });
          window.naver.maps.Event.addListener(marker, 'click', () => info.open(map, marker));
        });
        setMapStatus('지도 연동 완료');
      })
      .catch(() => setMapStatus('네이버 지도 인증 또는 호출 실패'));
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="map-section">
      <div ref={mapRef} className="map" />
      <div className="map-status">{mapStatus}</div>
      <div className="legend">
        <span><b className="dot green" />작업구역</span>
        <span><b className="dot blue" />CCTV</span>
        <span><b className="dot yellow" />TBM</span>
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
