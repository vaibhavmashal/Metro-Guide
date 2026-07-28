// ============================================================
// Three.js Custom Layer for MapLibre — Exact 3D Metro Infrastructure
// Uses MapLibre MercatorCoordinate for precise 3D elevated viaducts,
// support pillars, station structures, and animated ground rings.
// ============================================================

import * as THREE from 'three';
import maplibregl, { type Map as MaplibreMap, type CustomLayerInterface } from 'maplibre-gl';
import type { CityConfig } from '../data/cityData';

export interface ThreeLayerOptions {
  showGuideway: boolean;
  showStationHalos: boolean;
  showNeonGlow: boolean;
  stationSize: number;
}

export function createThreeLayer(
  map: MaplibreMap,
  options: ThreeLayerOptions,
  cityConfig: CityConfig
): CustomLayerInterface {
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.Camera;

  let guidewayGroup: THREE.Group;
  let haloGroup: THREE.Group;
  let stationStructureGroup: THREE.Group;

  // Track animated rings for smooth 60fps pulsing animation
  const animatedRings: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial; baseRadius: number; phaseOffset: number }[] = [];

  const layer: CustomLayerInterface = {
    id: 'three-metro-layer',
    type: 'custom',
    renderingMode: '3d',

    onAdd(_map: MaplibreMap, gl: WebGLRenderingContext) {
      scene = new THREE.Scene();
      camera = new THREE.Camera();

      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false;

      // Professional lighting setup for 3D structures
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xddeeff, 1.5);
      dirLight.position.set(0.5, 1, 0.8).normalize();
      scene.add(dirLight);

      guidewayGroup = new THREE.Group();
      haloGroup = new THREE.Group();
      stationStructureGroup = new THREE.Group();

      scene.add(guidewayGroup);
      scene.add(haloGroup);
      scene.add(stationStructureGroup);

      buildElevatedInfrastructure(guidewayGroup);
      buildStation3DStructures(stationStructureGroup, options.stationSize);
      buildAnimatedStationRings(haloGroup, options.stationSize);

      guidewayGroup.visible = options.showGuideway;
      haloGroup.visible = options.showStationHalos;
    },

    render(_gl: WebGLRenderingContext, args: any) {
      if (args?.defaultProjectionData?.mainMatrix) {
        camera.projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      }

      // Smooth pulsing wave animation for station ground rings
      const time = performance.now() * 0.0012;
      animatedRings.forEach(item => {
        const p = (time + item.phaseOffset) % 1; // 0..1
        const s = 1.0 + p * 0.85; // Expand from 1.0x to 1.85x
        item.mesh.scale.set(s, s, 1);
        item.material.opacity = (1 - p) * 0.8;
      });

      renderer.resetState();
      renderer.render(scene, camera);

      // Trigger continuous repaint so the animated rings pulse smoothly
      map.triggerRepaint();
    },

    onRemove() {
      scene.clear();
    },
  };

  // ---- Build Elevated Viaduct Beams & Support Pillars ----
  function buildElevatedInfrastructure(group: THREE.Group) {
    const trackAltitude = 16; // 16 meters above ground

    cityConfig.lines.forEach(lineInfo => {
      const colorObj = cityConfig.lineColors[lineInfo.id] || { primary: '#a855f7' };
      const lineColor = new THREE.Color(colorObj.primary);
      const darkViaductColor = new THREE.Color(0x1e293b);
      const coords = cityConfig.routeCoordinates[lineInfo.id];
      if (!coords || coords.length < 2) return;

      for (let i = 0; i < coords.length - 1; i++) {
        const [lng1, lat1] = coords[i];
        const [lng2, lat2] = coords[i + 1];

        const c1 = maplibregl.MercatorCoordinate.fromLngLat([lng1, lat1], trackAltitude);
        const c2 = maplibregl.MercatorCoordinate.fromLngLat([lng2, lat2], trackAltitude);
        const meterScale = c1.meterInMercatorCoordinateUnits();

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const midX = (c1.x + c2.x) / 2;
        const midY = (c1.y + c2.y) / 2;
        const midZ = c1.z;

        // 1. Viaduct main concrete deck beam (~7m wide, ~2.5m thick)
        const viaductWidth = 7 * meterScale;
        const viaductHeight = 2.5 * meterScale;

        const beamGeo = new THREE.BoxGeometry(length, viaductWidth, viaductHeight);
        const beamMat = new THREE.MeshPhongMaterial({
          color: darkViaductColor,
          emissive: 0x0f172a,
          emissiveIntensity: 0.3,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(midX, midY, midZ);
        beam.rotation.z = angle;
        group.add(beam);

        // 2. Glowing line strip on top of viaduct deck (~1.2m wide)
        const stripGeo = new THREE.BoxGeometry(length, 1.2 * meterScale, 0.4 * meterScale);
        const stripMat = new THREE.MeshBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: 0.95,
        });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(midX, midY, midZ + viaductHeight * 0.6);
        strip.rotation.z = angle;
        group.add(strip);

        // 3. Support pillars spaced along segment (~every 180 meters)
        const segLenMeters = length / meterScale;
        const numPillars = Math.max(1, Math.floor(segLenMeters / 180));

        for (let p = 0; p <= numPillars; p++) {
          const t = p / numPillars;
          const px = c1.x + dx * t;
          const py = c1.y + dy * t;

          const pillarRadius = 1.4 * meterScale;
          const pillarHeight = trackAltitude * meterScale;
          const pillarGeo = new THREE.BoxGeometry(pillarRadius * 1.6, pillarRadius * 1.6, pillarHeight);
          const pillarMat = new THREE.MeshPhongMaterial({
            color: 0x1e293b,
            emissive: 0x0f172a,
            emissiveIntensity: 0.2,
          });
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(px, py, pillarHeight / 2);
          group.add(pillar);
        }
      }
    });
  }

  // ---- Build 3D Translucent Station Structures ----
  function buildStation3DStructures(group: THREE.Group, stationScale: number) {
    const stationAltitude = 18;

    Object.values(cityConfig.stations).forEach(station => {
      const coord = maplibregl.MercatorCoordinate.fromLngLat([station.lng, station.lat], stationAltitude);
      const meterScale = coord.meterInMercatorCoordinateUnits();

      const colorObj = cityConfig.lineColors[station.line] || { primary: '#a855f7' };
      const primaryColor = new THREE.Color(colorObj.primary);

      // Find the track direction angle for this station from routeCoordinates
      const coords = cityConfig.routeCoordinates[station.line] || [];
      let trackAngle = 0;
      if (coords.length >= 2) {
        let minDist = Infinity;
        for (let i = 0; i < coords.length - 1; i++) {
          const [lng1, lat1] = coords[i];
          const [lng2, lat2] = coords[i + 1];
          const midLng = (lng1 + lng2) / 2;
          const midLat = (lat1 + lat2) / 2;
          const dist = Math.hypot(midLng - station.lng, midLat - station.lat);
          if (dist < minDist) {
            minDist = dist;
            const c1 = maplibregl.MercatorCoordinate.fromLngLat([lng1, lat1], stationAltitude);
            const c2 = maplibregl.MercatorCoordinate.fromLngLat([lng2, lat2], stationAltitude);
            trackAngle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
          }
        }
      }

      const length = 95 * meterScale * stationScale;
      const width = 18 * meterScale * stationScale;
      const height = 10 * meterScale * stationScale;

      // Main station glowing glass enclosure
      const boxGeo = new THREE.BoxGeometry(length, width, height);
      const boxMat = new THREE.MeshPhongMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.78,
      });
      const stationBox = new THREE.Mesh(boxGeo, boxMat);
      stationBox.position.set(coord.x, coord.y, coord.z);
      stationBox.rotation.z = trackAngle;
      group.add(stationBox);

      // Top roof edge accent
      const roofGeo = new THREE.BoxGeometry(length * 1.05, width * 1.05, 1.2 * meterScale);
      const roofMat = new THREE.MeshPhongMaterial({
        color: 0x1e293b,
        emissive: primaryColor,
        emissiveIntensity: 0.3,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(coord.x, coord.y, coord.z + height / 2);
      roof.rotation.z = trackAngle;
      group.add(roof);

      // Cylindrical shade on top of the roof
      const shadeRadius = (width * 1.05) / 2;
      const shadeLength = length * 1.05;
      const shadeGeo = new THREE.CylinderGeometry(shadeRadius, shadeRadius, shadeLength, 16, 1, false, 0, Math.PI);
      shadeGeo.rotateZ(-Math.PI / 2);
      shadeGeo.rotateX(-Math.PI / 2);
      const shadeMat = new THREE.MeshPhongMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.78,
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(coord.x, coord.y, coord.z + height / 2 + (1.2 * meterScale) / 2);
      shade.rotation.z = trackAngle;
      group.add(shade);


      // Support pillars
      const pillarGeo = new THREE.BoxGeometry(2.5 * meterScale, 4 * meterScale, stationAltitude * meterScale);
      const pillarMat = new THREE.MeshPhongMaterial({
        color: 0x1e293b,
      });
      for (const offset of [-length * 0.28, length * 0.28]) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(
          coord.x + offset * Math.cos(trackAngle),
          coord.y + offset * Math.sin(trackAngle),
          (stationAltitude * meterScale) / 2
        );
        pillar.rotation.z = trackAngle;
        group.add(pillar);
      }
    });
  }

  // ---- Build Animated Glowing Ground Rings Below Stations ----
  function buildAnimatedStationRings(group: THREE.Group, stationScale: number) {
    let index = 0;
    Object.values(cityConfig.stations).forEach(station => {
      const coord = maplibregl.MercatorCoordinate.fromLngLat([station.lng, station.lat], 0.3);
      const meterScale = coord.meterInMercatorCoordinateUnits();
      const colorObj = cityConfig.lineColors[station.line] || { primary: '#a855f7' };
      const color = new THREE.Color(colorObj.primary);

      const innerRadius = 20 * meterScale * stationScale;
      const outerRadius = 28 * meterScale * stationScale;

      // 1. Stable inner glowing ring
      const staticRingGeo = new THREE.RingGeometry(innerRadius * 0.7, innerRadius, 48);
      const staticRingMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const staticRing = new THREE.Mesh(staticRingGeo, staticRingMat);
      staticRing.position.set(coord.x, coord.y, coord.z);
      group.add(staticRing);

      // 2. Expanding outer pulsing ring wave
      const pulseRingGeo = new THREE.RingGeometry(innerRadius, outerRadius, 48);
      const pulseRingMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
      pulseRing.position.set(coord.x, coord.y, coord.z);
      group.add(pulseRing);

      animatedRings.push({
        mesh: pulseRing,
        material: pulseRingMat,
        baseRadius: outerRadius,
        phaseOffset: (index * 0.15) % 1,
      });
      index++;
    });
  }

  return layer;
}
