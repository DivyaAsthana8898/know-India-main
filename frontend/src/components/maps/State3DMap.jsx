import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ──────────────────────────────────────────────────────
   GeoJSON: fetch, cache, match
   ────────────────────────────────────────────────────── */

const STATE_OUTLINE_URL =
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

const DISTRICT_BASE =
  'https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES';

const FOLDER_MAP = {
  'andaman and nicobar islands': 'ANDAMAN & NICOBAR',
  'jammu and kashmir': 'JAMMU & KASHMIR',
  'odisha': 'ORISSA',
};

const FILE_MAP = {
  'ORISSA': 'ODISHA_DISTRICTS.geojson',
  'DADRA & NAGAR HAVELI': 'DADRA & NAGAR HAVE_DISTRICTS.geojson',
};

let stateOutlineCache = null;
let stateOutlinePromise = null;
const districtCacheMap = {};
const districtPromiseMap = {};

function cachedFetch(url, timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  return fetch(url, { signal: ctrl.signal })
    .then((r) => {
      clearTimeout(timer);
      return r.ok ? r.json() : null;
    })
    .catch(() => {
      clearTimeout(timer);
      return null;
    });
}

function fetchStateOutline() {
  if (stateOutlineCache) return Promise.resolve(stateOutlineCache);
  if (!stateOutlinePromise)
    stateOutlinePromise = cachedFetch(STATE_OUTLINE_URL, 8000).then((d) => {
      stateOutlineCache = d;
      if (!d) stateOutlinePromise = null;
      return d;
    });
  return stateOutlinePromise;
}

function districtUrl(folder) {
  const file = FILE_MAP[folder] || `${folder}_DISTRICTS.geojson`;
  return `${DISTRICT_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

function fetchDistrictsForState(stateName) {
  const key = stateName.toLowerCase();
  if (districtCacheMap[key]) return Promise.resolve(districtCacheMap[key]);
  if (districtPromiseMap[key]) return districtPromiseMap[key];

  let promise;

  if (key === 'dadra and nagar haveli and daman and diu') {
    promise = Promise.all([
      cachedFetch(districtUrl('DADRA & NAGAR HAVELI'), 12000),
      cachedFetch(districtUrl('DAMAN & DIU'), 12000),
    ]).then(([a, b]) => {
      const merged = [...(a?.features || []), ...(b?.features || [])];
      return merged.length > 0 ? merged : null;
    });
  } else {
    const folder = FOLDER_MAP[key] || stateName.toUpperCase();
    promise = cachedFetch(districtUrl(folder), 12000).then((d) =>
      d?.features?.length > 0 ? d.features : null,
    );
  }

  districtPromiseMap[key] = promise.then((features) => {
    if (features) districtCacheMap[key] = features;
    else delete districtPromiseMap[key];
    return features;
  });

  return districtPromiseMap[key];
}

const RENAMED_STATES = {
  orissa: 'odisha',
  uttaranchal: 'uttarakhand',
};

function norm(n) {
  const raw = n.toLowerCase().replace(/\band\b/g, '').replace(/[^a-z0-9]/g, '');
  return RENAMED_STATES[raw] || raw;
}

function nameMatch(a, b) {
  return a === b || a.includes(b) || b.includes(a);
}

function findStateFeature(geo, name) {
  const t = norm(name);
  for (const f of geo.features) {
    const p = f.properties || {};
    if (nameMatch(norm(p.ST_NM || p.NAME_1 || p.name || ''), t)) return f;
  }
  return null;
}

function getDistrictName(feature) {
  const p = feature.properties || {};
  return p.dtname || p.district || p.NAME || p.name || p.DISTRICT || '';
}

/* ──────────────────────────────────────────────────────
   Geometry utilities
   ────────────────────────────────────────────────────── */

function simplify(ring, max = 120) {
  if (ring.length <= max) return ring;
  const step = (ring.length - 1) / (max - 1);
  const out = [];
  for (let i = 0; i < max - 1; i++) out.push(ring[Math.round(i * step)]);
  out.push(ring[ring.length - 1]);
  return out;
}

function getPolygons(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function boundsOf(features) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const f of features)
    for (const poly of getPolygons(f.geometry))
      for (const ring of poly)
        for (const [x, y] of ring) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
  return { minX, maxX, minY, maxY };
}

function makeProjection(bounds) {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const s = 3.0 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const lc = Math.cos((cy * Math.PI) / 180);
  return ([lng, lat]) => [(lng - cx) * s * lc, (lat - cy) * s];
}

function polygonsToShapes(geometry, project, outerMax, holeMax) {
  return getPolygons(geometry).map((poly) => {
    const outer = simplify(poly[0], outerMax).map(project);
    const shape = new THREE.Shape();
    outer.forEach(([x, y], i) =>
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y),
    );
    for (let h = 1; h < poly.length; h++) {
      const pts = simplify(poly[h], holeMax).map(project);
      const hole = new THREE.Path();
      pts.forEach(([x, y], j) =>
        j === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y),
      );
      shape.holes.push(hole);
    }
    return shape;
  });
}

/* ──────────────────────────────────────────────────────
   Build district map data
   ────────────────────────────────────────────────────── */

const DISTRICT_COLORS = [
  '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E8BAFF',
  '#FFE0B3', '#B3FFD4', '#FFB3DE', '#B3D4FF', '#D4FFB3',
  '#FFDFBA', '#B3FFE0', '#FFD4B3', '#D0D1FF', '#FFC8DD',
  '#BDE0FE', '#A2D2FF', '#CDB4DB', '#FFC09F', '#FFEE93',
  '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9', '#FF99C8',
  '#C7CEEA', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#F0E6EF',
];

function seededRand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function darkenHex(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * factor));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * factor));
  const b = Math.max(0, Math.round((n & 0xff) * factor));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function buildDistrictData(features) {
  const bounds = boundsOf(features);
  const project = makeProjection(bounds);
  return features.map((f, idx) => {
    const name = getDistrictName(f);
    const shapes = polygonsToShapes(f.geometry, project, 80, 30);
    const color = DISTRICT_COLORS[idx % DISTRICT_COLORS.length];
    const height = 0.12 + seededRand(idx) * 0.32;
    return { name, shapes, color, sideColor: darkenHex(color, 0.6), height };
  });
}

function buildStateShapes(feature) {
  const bounds = boundsOf([feature]);
  const project = makeProjection(bounds);
  return polygonsToShapes(feature.geometry, project, 200, 80);
}

/* ──────────────────────────────────────────────────────
   3D components
   ────────────────────────────────────────────────────── */

function DistrictMesh({ geo, border, materials, name, isDark, onDistrictClick }) {
  const [hovered, setHovered] = useState(false);

  const highlightMats = useMemo(() => {
    const col = isDark ? '#fbbf24' : '#f59e0b';
    const face = new THREE.MeshStandardMaterial({
      color: col, roughness: 0.3, metalness: 0.15,
      emissive: new THREE.Color(col), emissiveIntensity: 0.2,
    });
    const side = new THREE.MeshStandardMaterial({
      color: col, roughness: 0.4, metalness: 0.1,
    });
    return [face, side];
  }, [isDark]);

  useEffect(() => {
    return () => highlightMats.forEach((m) => m.dispose());
  }, [highlightMats]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onDistrictClick) onDistrictClick(name);
  }, [name, onDistrictClick]);

  const borderCol = hovered ? (isDark ? '#fff' : '#000') : isDark ? '#333' : '#444';

  return (
    <group>
      <mesh
        geometry={geo}
        material={hovered ? highlightMats : materials}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <lineSegments geometry={border}>
        <lineBasicMaterial color={borderCol} transparent opacity={hovered ? 1 : 0.7} />
      </lineSegments>
    </group>
  );
}

function DistrictMap({ districts, isDark, flat, onDistrictClick }) {
  const geoData = useMemo(() => {
    return districts.map(({ shapes, color, sideColor, name, height }) => {
      const depth = flat ? 0.04 + height * 0.25 : height;
      const extSettings = {
        depth,
        bevelEnabled: true,
        bevelThickness: flat ? 0.01 : 0.02,
        bevelSize: flat ? 0.008 : 0.015,
        bevelSegments: 2,
      };
      const faceMat = new THREE.MeshStandardMaterial({
        color,
        roughness: isDark ? 0.45 : 0.35,
        metalness: 0.08,
        emissive: isDark ? color : undefined,
        emissiveIntensity: isDark ? 0.1 : 0,
      });
      const sideMat = new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: isDark ? 0.55 : 0.5,
        metalness: 0.05,
      });
      const meshes = shapes.map((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, extSettings);
        geo.computeVertexNormals();
        const border = new THREE.EdgesGeometry(geo, 15);
        return { geo, border, materials: [faceMat, sideMat] };
      });
      return { meshes, name };
    });
  }, [districts, isDark, flat]);

  useEffect(() => {
    return () =>
      geoData.forEach(({ meshes }) =>
        meshes.forEach(({ geo, border, materials }) => {
          geo.dispose();
          border.dispose();
          materials.forEach((m) => m.dispose());
        }),
      );
  }, [geoData]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      {geoData.map(({ meshes, name }, di) =>
        meshes.map(({ geo, border, materials }, mi) => (
          <DistrictMesh
            key={`${di}-${mi}`}
            geo={geo}
            border={border}
            materials={materials}
            name={name}
            isDark={isDark}
            onDistrictClick={onDistrictClick}
          />
        )),
      )}
    </group>
  );
}

function ExtrudedState({ shapes, isDark }) {
  const geoData = useMemo(() => {
    const settings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    };
    return shapes.map((shape) => {
      const ext = new THREE.ExtrudeGeometry(shape, settings);
      ext.computeVertexNormals();
      const edge = new THREE.EdgesGeometry(ext, 20);
      return { ext, edge };
    });
  }, [shapes]);

  useEffect(() => {
    return () =>
      geoData.forEach(({ ext, edge }) => {
        ext.dispose();
        edge.dispose();
      });
  }, [geoData]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      {geoData.map(({ ext, edge }, i) => (
        <group key={i}>
          <mesh geometry={ext} castShadow receiveShadow>
            <meshStandardMaterial
              color={isDark ? '#f97316' : '#fb923c'}
              roughness={0.3}
              metalness={0.15}
            />
          </mesh>
          <lineSegments geometry={edge}>
            <lineBasicMaterial
              color={isDark ? '#fdba74' : '#ea580c'}
              transparent
              opacity={0.45}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function BasePlate({ isDark }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[1.8, 64]} />
      <meshStandardMaterial
        color={isDark ? '#1e1e2e' : '#fef3c7'}
        roughness={0.8}
        metalness={0.05}
      />
    </mesh>
  );
}

function GridLines({ isDark }) {
  const c = isDark ? '#333' : '#e5e7eb';
  return <gridHelper args={[3.6, 10, c, c]} position={[0, -0.01, 0]} />;
}

function RotatingRing({ isDark }) {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <torusGeometry args={[1.6, 0.015, 8, 64]} />
      <meshStandardMaterial
        color={isDark ? '#f97316' : '#fb923c'}
        emissive={isDark ? '#f97316' : '#fb923c'}
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function LocationPin() {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current)
      ref.current.position.y = 0.9 + Math.sin(s.clock.elapsedTime * 2) * 0.08;
  });
  return (
    <group ref={ref} position={[0, 0.9, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.12, 0]} castShadow>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function StateNameSprite({ text, isDark }) {
  const material = useMemo(() => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = 512;
    c.height = 96;
    ctx.clearRect(0, 0, 512, 96);
    ctx.font = 'bold 48px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = isDark ? '#000' : '#fff';
    ctx.lineWidth = 6;
    ctx.strokeText(text, 256, 48);
    ctx.fillStyle = isDark ? '#fb923c' : '#ea580c';
    ctx.fillText(text, 256, 48);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  }, [text, isDark]);

  useEffect(() => {
    return () => {
      material.map?.dispose();
      material.dispose();
    };
  }, [material]);

  return <sprite position={[0, 1.4, 0]} scale={[2.4, 0.45, 1]} material={material} />;
}

/* ──────────────────────────────────────────────────────
   Scene variants
   ────────────────────────────────────────────────────── */

function MinimalScene({ districtData, stateShapes, isDark, onDistrictClick }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.6 : 0.7} />
      <hemisphereLight
        args={[
          isDark ? '#fb923c' : '#ffe0b2',
          isDark ? '#1e1b4b' : '#b3e5fc',
          isDark ? 0.4 : 0.45,
        ]}
      />
      <directionalLight position={[0, 8, 0]} intensity={isDark ? 0.8 : 1} />

      {districtData ? (
        <DistrictMap districts={districtData} isDark={isDark} flat onDistrictClick={onDistrictClick} />
      ) : stateShapes ? (
        <ExtrudedState shapes={stateShapes} isDark={isDark} />
      ) : null}
    </>
  );
}

function FullScene({ stateName, districtData, stateShapes, isDark, onDistrictClick }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.35 : 0.5} />
      <hemisphereLight
        args={[
          isDark ? '#fb923c' : '#ffe0b2',
          isDark ? '#1e1b4b' : '#b3e5fc',
          isDark ? 0.6 : 0.7,
        ]}
      />
      <directionalLight
        position={[5, 8, 5]}
        intensity={isDark ? 0.8 : 1}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <pointLight position={[-3, 4, -3]} intensity={0.3} color="#fb923c" />

      <BasePlate isDark={isDark} />
      <GridLines isDark={isDark} />
      <RotatingRing isDark={isDark} />

      {districtData ? (
        <DistrictMap districts={districtData} isDark={isDark} flat={false} onDistrictClick={onDistrictClick} />
      ) : stateShapes ? (
        <ExtrudedState shapes={stateShapes} isDark={isDark} />
      ) : null}

      <StateNameSprite text={stateName} isDark={isDark} />
      <LocationPin />

      <OrbitControls
        enableZoom
        enableRotate
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────
   Public component
   ────────────────────────────────────────────────────── */

function DistrictPopup({ name, isDark, onDone }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const fadeTimer = setTimeout(() => setFading(true), 6200);
    const doneTimer = setTimeout(() => onDone(), 7000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className="absolute left-1/2 top-4 -translate-x-1/2 z-10 pointer-events-none"
      style={{
        opacity: fading ? 0 : visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible && !fading ? '0' : '-8px'})`,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div
        className={`
          px-4 py-2 rounded-lg shadow-lg backdrop-blur-md
          flex items-center gap-2 text-sm font-semibold
          ${isDark
            ? 'bg-gray-900/85 text-orange-300 border border-orange-500/30 shadow-orange-900/30'
            : 'bg-white/90 text-orange-700 border border-orange-200 shadow-orange-200/40'
          }
        `}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {name}
      </div>
    </div>
  );
}

const State3DMap = React.memo(function State3DMap({
  stateName,
  isDark = false,
  minimal = false,
}) {
  const [stateShapes, setStateShapes] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [popupDistrict, setPopupDistrict] = useState(null);
  const popupKeyRef = useRef(0);
  const [popupKey, setPopupKey] = useState(0);

  const handleDistrictClick = useCallback((name) => {
    popupKeyRef.current += 1;
    setPopupKey(popupKeyRef.current);
    setPopupDistrict(name);
  }, []);

  const handlePopupDone = useCallback(() => {
    setPopupDistrict(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchStateOutline().then((geo) => {
      if (cancelled || !geo) return;
      const feature = findStateFeature(geo, stateName);
      if (feature) setStateShapes(buildStateShapes(feature));
    });

    fetchDistrictsForState(stateName).then((features) => {
      if (cancelled || !features) return;
      setDistrictData(buildDistrictData(features));
    });

    return () => {
      cancelled = true;
    };
  }, [stateName]);

  return (
    <div className="relative w-full h-full min-h-[280px]">
      {popupDistrict && (
        <DistrictPopup
          key={popupKey}
          name={popupDistrict}
          isDark={isDark}
          onDone={handlePopupDone}
        />
      )}

      <Canvas
        shadows
        camera={{
          position: minimal ? [0, 3.8, 0.01] : [0, 3.8, 0.01],
          fov: minimal ? 45 : 45,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {minimal ? (
          <MinimalScene
            districtData={districtData}
            stateShapes={stateShapes}
            isDark={isDark}
            onDistrictClick={handleDistrictClick}
          />
        ) : (
          <FullScene
            stateName={stateName}
            districtData={districtData}
            stateShapes={stateShapes}
            isDark={isDark}
            onDistrictClick={handleDistrictClick}
          />
        )}
      </Canvas>

      {!minimal && (
        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm ${
            isDark
              ? 'bg-gray-900/70 text-gray-400 border border-gray-700/50'
              : 'bg-white/80 text-gray-500 border border-gray-200/50'
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 0v10l4.5 4.5" />
          </svg>
          Drag to rotate · Scroll to zoom · Click district
        </div>
      )}
    </div>
  );
});

export default State3DMap;
