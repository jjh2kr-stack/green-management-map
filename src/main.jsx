
import React, {useEffect, useRef, useState} from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const NAVER_CLIENT_ID = 'bfyno0gxjg';

const SEGMENTS = [
  { id:'gayang-seongsan', name:'가양대교~성산대교', center:[37.5638,126.8746], qty:{'가로수': '교목합계 125주 / 결주 1주','식재':'교목합계 47주, 관목합계 11,048㎡, 초화합계 660.2㎡','주요수목':'이팝나무, 회화나무, 소나무, 스트로브잣나무, 중국단풍','주요관목':'사철나무, 개나리, 철쭉, 쥐똥나무, 맥문동'} },
  { id:'seongsan-yanghwa', name:'성산대교~양화대교', center:[37.5518,126.9007], qty:{'가로수':'교목합계 403주 / 결주 9주','식재':'교목합계 559주, 관목합계 5,418㎡','주요수목':'느티나무, 이팝나무, 회화나무, 스트로브잣나무','주요관목':'사철나무, 개나리, 조팝나무, 철쭉, 영산홍'} },
  { id:'yanghwa-seogang', name:'양화대교~서강대교', center:[37.5388,126.9198], qty:{'식재':'PDF 현황평면도 구간','주요구간':'양화대교, 서강대교 주변 강변북로 녹지'} },
  { id:'seogang-wonhyo', name:'서강대교~원효대교', center:[37.5316,126.9398], qty:{'식재':'PDF 현황평면도 구간','주요구간':'서강대교, 원효대교 주변 강변북로 녹지'} },
  { id:'wonhyo-hangang', name:'원효대교~한강대교', center:[37.5258,126.9559], qty:{'식재':'PDF 현황평면도 구간','주요구간':'원효대교, 한강대교 주변 강변북로 녹지'} },
  { id:'hangang-dongjak', name:'한강대교~동작대교', center:[37.5180,126.9787], qty:{'식재':'PDF 현황평면도 구간','주요구간':'한강대교, 동작대교 주변 강변북로 녹지'} },
  { id:'dongjak-banpo', name:'동작대교~반포대교', center:[37.5136,126.9957], qty:{'식재':'PDF 현황수량표 구간','주요구간':'동작대교, 반포대교 주변 강변북로 녹지'} },
  { id:'banpo-hannam', name:'반포대교~한남대교', center:[37.5178,127.0165], qty:{'식재':'PDF 현황평면도 구간','주요구간':'반포대교, 한남대교 주변 강변북로 녹지'} },
  { id:'hannam-dongho', name:'한남대교~동호대교', center:[37.5260,127.0320], qty:{'식재':'PDF 현황평면도 구간','주요구간':'한남대교, 동호대교 주변 강변북로 녹지'} },
  { id:'dongho-seongsu', name:'동호대교~성수대교', center:[37.5350,127.0448], qty:{'식재':'PDF 현황평면도 구간','주요구간':'동호대교, 성수대교 주변 강변북로 녹지'} },
  { id:'seongsu-cheongdam', name:'성수대교~청담대교', center:[37.5392,127.0622], qty:{'식재':'PDF 현황평면도 구간','주요구간':'성수대교, 청담대교 주변 강변북로 녹지'} },
  { id:'cheongdam-jamsil', name:'청담대교~잠실대교', center:[37.5240,127.0848], qty:{'가로수':'교목합계 52주 / 결주 9주','식재':'교목합계 2주, 관목합계 336㎡','주요수목':'느릅나무','주요관목':'회양목, 사철나무'} },
  { id:'jamsil-olympic', name:'잠실대교~올림픽대교', center:[37.5211,127.1039], qty:{'식재':'PDF 현황평면도 구간','주요구간':'잠실대교, 올림픽대교 주변 강변북로 녹지'} },
  { id:'olympic-cheonho', name:'올림픽대교~천호대교', center:[37.5322,127.1166], qty:{'식재':'PDF 현황평면도 구간','주요구간':'올림픽대교, 천호대교 주변 강변북로 녹지'} },
  { id:'cheonho-amsa', name:'천호대교~암사대교', center:[37.5481,127.1260], qty:{'식재':'소나무, 스트로브잣나무, 산수유, 소사나무, 이팝나무, 회화나무 등','주요관목':'개나리, 개쉬땅나무, 철쭉, 조팝나무, 화살나무'} },
];

const PLACES = {
  '가양대교':[37.5711,126.8629],'성산대교':[37.5527,126.8912],'양화대교':[37.5393,126.9022],
  '서강대교':[37.5337,126.9255],'원효대교':[37.5270,126.9486],'한강대교':[37.5187,126.9618],
  '동작대교':[37.5112,126.9816],'반포대교':[37.5134,126.9966],'한남대교':[37.5249,127.0138],
  '동호대교':[37.5360,127.0216],'성수대교':[37.5391,127.0347],'청담대교':[37.5237,127.0648],
  '잠실대교':[37.5208,127.0917],'올림픽대교':[37.5334,127.1043],'천호대교':[37.5421,127.1138],
  '암사대교':[37.5522,127.1295],'강변북로':[37.5320,127.0100],
  '서울숲':[37.5444,127.0374], '월드컵공원':[37.5716,126.8848], '여의도한강공원':[37.5284,126.9349]
};

function loadNaverScript(){
  return new Promise((resolve,reject)=>{
    if(window.naver?.maps) return resolve();
    const s=document.createElement('script');
    s.src=`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}&submodules=geocoder`;
    s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
}
function dist(a,b){ const R=6371e3, toRad=x=>x*Math.PI/180; const d1=toRad(b[0]-a[0]), d2=toRad(b[1]-a[1]); const x=Math.sin(d1/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(d2/2)**2; return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }
function nearestSegment(latlng){ return [...SEGMENTS].sort((a,b)=>dist(latlng,a.center)-dist(latlng,b.center))[0]; }

function App(){
  const mapRef=useRef(null), mapObj=useRef(null), markers=useRef([]), polylines=useRef([]);
  const [ready,setReady]=useState(false);
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState(SEGMENTS[0]);
  const [status,setStatus]=useState('검색어를 입력하세요. 예: 성산대교, 가양대교~성산대교, 서울숲');
  const [location,setLocation]=useState(SEGMENTS[0].center);

  useEffect(()=>{ loadNaverScript().then(()=>{
    const n=window.naver;
    mapObj.current=new n.maps.Map(mapRef.current,{center:new n.maps.LatLng(37.5320,127.0100),zoom:12,mapTypeControl:true});
    setReady(true);
    drawSegments();
    moveToSegment(SEGMENTS[0]);
  }).catch(()=>setStatus('네이버 지도 스크립트를 불러오지 못했습니다. Client ID와 Web 서비스 URL을 확인하세요.')); },[]);

  function clearMarkers(){ markers.current.forEach(m=>m.setMap(null)); markers.current=[]; }
  function drawSegments(){
    const n=window.naver;
    polylines.current.forEach(p=>p.setMap(null)); polylines.current=[];
    for(let i=0;i<SEGMENTS.length-1;i++){
      const a=SEGMENTS[i], b=SEGMENTS[i+1];
      const line=new n.maps.Polyline({map:mapObj.current,path:[new n.maps.LatLng(a.center[0],a.center[1]),new n.maps.LatLng(b.center[0],b.center[1])],strokeColor:'#16a34a',strokeWeight:7,strokeOpacity:.75});
      n.maps.Event.addListener(line,'click',()=>moveToSegment(a));
      polylines.current.push(line);
    }
  }
  function addMarker(latlng,title,type='work'){
    const n=window.naver;
    const marker=new n.maps.Marker({position:new n.maps.LatLng(latlng[0],latlng[1]),map:mapObj.current,title});
    markers.current.push(marker);
    return marker;
  }
  function moveTo(latlng, title='검색 위치'){
    setLocation(latlng); clearMarkers();
    mapObj.current.setCenter(new window.naver.maps.LatLng(latlng[0],latlng[1])); mapObj.current.setZoom(15);
    addMarker(latlng,title);
    const seg=nearestSegment(latlng); setSelected(seg);
    setStatus(`${title} 위치로 이동했습니다. 가장 가까운 PDF 구간: ${seg.name}`);
  }
  function moveToSegment(seg){
    setSelected(seg); setLocation(seg.center); clearMarkers();
    mapObj.current.setCenter(new window.naver.maps.LatLng(seg.center[0],seg.center[1])); mapObj.current.setZoom(14);
    addMarker(seg.center,seg.name);
    setStatus(`PDF 기준 구간 선택: ${seg.name}`);
  }
  function search(){
    const q=query.trim(); if(!q) return;
    const normalized=q.replaceAll(' ','');
    const seg=SEGMENTS.find(s=>s.name.replaceAll(' ','').includes(normalized) || normalized.includes(s.name.replaceAll(' ','')) || s.id.includes(normalized.toLowerCase()));
    if(seg) return moveToSegment(seg);
    for(const [name,latlng] of Object.entries(PLACES)){
      if(name.replaceAll(' ','').includes(normalized) || normalized.includes(name.replaceAll(' ',''))) return moveTo(latlng,name);
    }
    // Naver geocode: address only. Place names often fail, so fallback above is primary.
    if(window.naver?.maps?.Service?.geocode){
      window.naver.maps.Service.geocode({query:q}, (status,response)=>{
        if(status !== window.naver.maps.Service.Status.OK || !response?.v2?.addresses?.length){
          setStatus('네이버 지오코딩 결과 없음. 다리명/구간명은 내장 좌표로 검색됩니다. 주소 검색은 네이버 Geocoding API 설정 확인 필요.');
          return;
        }
        const a=response.v2.addresses[0]; moveTo([Number(a.y),Number(a.x)], a.roadAddress || a.jibunAddress || q);
      });
    } else setStatus('geocoder 모듈이 로드되지 않았습니다. maps.js URL의 submodules=geocoder를 확인하세요.');
  }
  function myLocation(){
    if(!navigator.geolocation){setStatus('현재 위치 기능을 사용할 수 없습니다.');return;}
    navigator.geolocation.getCurrentPosition(pos=>moveTo([pos.coords.latitude,pos.coords.longitude],'현재 위치'),()=>setStatus('현재 위치 권한이 거부되었거나 GPS를 찾지 못했습니다.'));
  }
  const smartway=`https://smartway.seoul.go.kr/web/main.view`;
  const weather=`https://www.weather.go.kr/w/index.do`;
  const warning=`https://www.weather.go.kr/w/weather/warning/status.do`;

  return <div className="app">
    <div className="top"><div>🌳 GreenTBM</div><div>강변북로 PDF 구간 · CCTV · 날씨</div></div>
    <div className="main">
      <div style={{position:'relative',minHeight:0}}>
        <div className="searchbox">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')search()}} placeholder="작업구역 검색: 성산대교, 가양대교~성산대교, 서울숲, 주소"/>
          <div className="btns">
            <button className="btn" onClick={search}>검색</button>
            <button className="btn secondary" onClick={myLocation}>📍 현재 위치</button>
            <button className="btn gray" onClick={()=>moveToSegment(SEGMENTS[0])}>강변북로 시작</button>
          </div>
          <div className="btns">
            {['가양대교~성산대교','한남대교~동호대교','청담대교~잠실대교','천호대교~암사대교'].map(x=><button key={x} className="btn gray" onClick={()=>{setQuery(x); setTimeout(()=>moveToSegment(SEGMENTS.find(s=>s.name===x)),0)}}>{x}</button>)}
          </div>
          <div className="status">{status}</div>
        </div>
        <div ref={mapRef} className="map"></div>
      </div>
      <div className="panel">
        <div className="card">
          <div className="title">선택 구간</div>
          <div className="row"><span>노선</span><b>강변북로</b></div>
          <div className="row"><span>PDF 범위</span><b>가양대교~암사대교</b></div>
          <div className="row"><span>현재 구간</span><b>{selected.name}</b></div>
          <div className="small">업로드 PDF의 현황수량표/현황평면도 기준으로 구간을 구성했습니다. 실제 경계는 추후 GeoJSON화하면 더 정확해집니다.</div>
        </div>
        <div className="card">
          <div className="title">PDF 기준 구간 정보</div>
          {Object.entries(selected.qty).map(([k,v])=><div className="row" key={k}><span>{k}</span><span className="count">{v}</span></div>)}
          <div className="chips"><span className="chip">현황평면도</span><span className="chip">식재수량표</span><span className="chip">가로수수량표</span><span className="chip">MATCH LINE</span></div>
        </div>
        <div className="card list">
          <div className="title">전체 구간 바로가기</div>
          {SEGMENTS.map(s=><button key={s.id} onClick={()=>moveToSegment(s)}>{s.name}</button>)}
        </div>
        <div className="card">
          <div className="title">주변 CCTV</div>
          <a className="link" href={smartway} target="_blank">SmartWay 서울 교통 CCTV 열기</a>
          <div className="small">SmartWay는 위치별 CCTV를 사이트에서 직접 선택하는 방식입니다. 앱에서는 작업위치 기준 이동 후 새 창으로 확인하도록 연결했습니다.</div>
        </div>
        <div className="card weather">
          <div className="title">날씨 · 기상특보</div>
          <a href={weather} target="_blank">기상청 날씨 보기</a>
          <a href={warning} target="_blank">기상특보 확인</a>
        </div>
        <div className="warn">GitHub 업로드 제한 때문에 PDF 원본은 앱에 넣지 않았습니다. 대신 PDF에서 필요한 구간/수량 데이터를 코드에 내장했습니다.</div>
      </div>
    </div>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
