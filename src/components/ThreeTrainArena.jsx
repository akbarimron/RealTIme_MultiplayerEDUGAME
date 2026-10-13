import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Eye, Zap, Flame, Sparkles } from 'lucide-react';

export default function ThreeTrainArena({ teams = [], recentEvent = null }) {
  const mountRef = useRef(null);
  const [cameraMode, setCameraMode] = useState('orbit'); // 'orbit', 'leader', 'top'
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const trainsRef = useRef({});
  const particlesRef = useRef([]);
  const trackCurveRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.008);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 48, 68);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(40, 70, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 160;
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    scene.add(dirLight);

    // Subtle arena stadium spot
    const spotLight = new THREE.SpotLight(0x38bdf8, 2.5, 120, Math.PI / 4, 0.4);
    spotLight.position.set(0, 50, 0);
    scene.add(spotLight);

    // 4. Ground Arena Platform
    const floorGeo = new THREE.CylinderGeometry(55, 58, 2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Neon grid border ring
    const ringGeo = new THREE.TorusGeometry(53, 0.4, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    scene.add(ring);

    // 5. 3D Closed Track Path
    // An elliptical roller-coaster style circuit
    const trackPoints = [];
    const numPoints = 16;
    const rx = 40;
    const rz = 26;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = Math.cos(angle) * (rx + Math.sin(angle * 2) * 4);
      const z = Math.sin(angle) * rz;
      const y = Math.sin(angle * 3) * 2.5 + 2.5; // subtle gentle hills
      trackPoints.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(trackPoints, true);
    trackCurveRef.current = curve;

    // Build Rails & Sleepers
    const railPoints = curve.getSpacedPoints(180);
    
    // Left and Right steel rail lines
    const leftRailPoints = [];
    const rightRailPoints = [];
    const railGauge = 1.4;

    for (let i = 0; i < railPoints.length; i++) {
      const p = railPoints[i];
      const tangent = curve.getTangentAt(i / railPoints.length).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      leftRailPoints.push(p.clone().addScaledVector(side, railGauge / 2));
      rightRailPoints.push(p.clone().addScaledVector(side, -railGauge / 2));

      // Add wooden sleeper (tie) every 3 points
      if (i % 3 === 0) {
        const sleeperGeo = new THREE.BoxGeometry(2.4, 0.2, 0.5);
        const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.copy(p);
        sleeper.position.y -= 0.1;
        sleeper.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), side);
        sleeper.receiveShadow = true;
        scene.add(sleeper);
      }
    }

    const leftRailCurve = new THREE.CatmullRomCurve3(leftRailPoints, true);
    const rightRailCurve = new THREE.CatmullRomCurve3(rightRailPoints, true);

    const railGeoLeft = new THREE.TubeGeometry(leftRailCurve, 180, 0.14, 8, true);
    const railGeoRight = new THREE.TubeGeometry(rightRailCurve, 180, 0.14, 8, true);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

    const leftMesh = new THREE.Mesh(railGeoLeft, railMat);
    const rightMesh = new THREE.Mesh(railGeoRight, railMat);
    leftMesh.castShadow = true;
    rightMesh.castShadow = true;
    scene.add(leftMesh);
    scene.add(rightMesh);

    // 6. Create Procedural Train Meshes for 5 Teams
    const teamColors = {
      1: 0xef4444, // Red
      2: 0xf59e0b, // Gold
      3: 0x06b6d4, // Cyan
      4: 0x10b981, // Green
      5: 0xa855f7  // Purple
    };

    function createTrainModel(colorHex, teamNum) {
      const trainGroup = new THREE.Group();

      // Boiler / Locomotive cylinder
      const boilerGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.6, 16);
      boilerGeo.rotateZ(Math.PI / 2);
      const boilerMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.6, roughness: 0.4 });
      const boiler = new THREE.Mesh(boilerGeo, boilerMat);
      boiler.position.set(0.4, 0.85, 0);
      boiler.castShadow = true;
      trainGroup.add(boiler);

      // Cab (Driver Cabin)
      const cabGeo = new THREE.BoxGeometry(1.6, 1.8, 1.5);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(-1.0, 1.1, 0);
      cab.castShadow = true;
      trainGroup.add(cab);

      // Chimney / Smokestack
      const chimneyGeo = new THREE.CylinderGeometry(0.25, 0.18, 0.8, 12);
      const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
      const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
      chimney.position.set(1.2, 1.6, 0);
      chimney.castShadow = true;
      trainGroup.add(chimney);

      // Glowing Headlight
      const lampGeo = new THREE.SphereGeometry(0.25, 12, 12);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(1.7, 0.85, 0);
      trainGroup.add(lamp);

      // Headlight light source
      const headLight = new THREE.PointLight(0xffedd5, 2, 12);
      headLight.position.set(2.0, 0.85, 0);
      trainGroup.add(headLight);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
      wheelGeo.rotateX(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

      [-1.3, -0.6, 0.3, 1.1].forEach((wx) => {
        const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
        wheelL.position.set(wx, 0.35, 0.75);
        trainGroup.add(wheelL);

        const wheelR = new THREE.Mesh(wheelGeo, wheelMat);
        wheelR.position.set(wx, 0.35, -0.75);
        trainGroup.add(wheelR);
      });

      // Connected Wagon (Node 2: Linked Car)
      const wagonGroup = new THREE.Group();
      const wagonBoxGeo = new THREE.BoxGeometry(2.0, 1.2, 1.4);
      const wagonBoxMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4, roughness: 0.6 });
      const wagonBox = new THREE.Mesh(wagonBoxGeo, wagonBoxMat);
      wagonBox.position.set(-3.2, 0.8, 0);
      wagonBox.castShadow = true;
      wagonGroup.add(wagonBox);

      // Brass Coupler (Pointer Next Kait)
      const couplerGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
      couplerGeo.rotateZ(Math.PI / 2);
      const couplerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const coupler = new THREE.Mesh(couplerGeo, couplerMat);
      coupler.position.set(-2.0, 0.6, 0);
      trainGroup.add(coupler);

      trainGroup.add(wagonGroup);

      // Debuff / Aura effects container
      const effectsGroup = new THREE.Group();
      trainGroup.add(effectsGroup);

      // 1. Ice Cube (For Freeze Debuff)
      const iceGeo = new THREE.BoxGeometry(4.8, 2.8, 2.4);
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.1
      });
      const iceMesh = new THREE.Mesh(iceGeo, iceMat);
      iceMesh.position.set(-0.8, 1.1, 0);
      iceMesh.visible = false;
      effectsGroup.add(iceMesh);

      // 2. Shield Bubble
      const shieldGeo = new THREE.SphereGeometry(3.0, 24, 24);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      shieldMesh.position.set(-0.8, 1.1, 0);
      shieldMesh.visible = false;
      effectsGroup.add(shieldMesh);

      // 3. Nitro Rocket Flame
      const flameGeo = new THREE.ConeGeometry(0.4, 1.5, 12);
      flameGeo.rotateZ(-Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.set(-4.5, 0.8, 0);
      flameMesh.visible = false;
      effectsGroup.add(flameMesh);

      scene.add(trainGroup);

      return {
        mesh: trainGroup,
        chimneyPos: chimney,
        effects: {
          ice: iceMesh,
          shield: shieldMesh,
          flame: flameMesh
        },
        t: (teamNum - 1) * 0.04, // initial offset
        targetT: (teamNum - 1) * 0.04,
        teamNum
      };
    }

    [1, 2, 3, 4, 5].forEach((id) => {
      trainsRef.current[id] = createTrainModel(teamColors[id], id);
    });

    // 7. Particle System (Steam & Bomb Debris)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    const activeParticles = [];
    for (let i = 0; i < particleCount; i++) {
      activeParticles.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        color: new THREE.Color(0xffffff)
      });
    }
    particlesRef.current = activeParticles;

    // 8. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle camera orbit when in orbit mode
      if (cameraMode === 'orbit') {
        const camAngle = elapsed * 0.08;
        camera.position.x = Math.sin(camAngle) * 65;
        camera.position.z = Math.cos(camAngle) * 65;
        camera.position.y = 42 + Math.sin(elapsed * 0.2) * 5;
        camera.lookAt(0, 4, 0);
      } else if (cameraMode === 'top') {
        camera.position.set(0, 90, 0.1);
        camera.lookAt(0, 0, 0);
      }

      // Update Trains along track
      const curveInstance = trackCurveRef.current;
      if (curveInstance) {
        Object.values(trainsRef.current).forEach((train) => {
          // Smooth interpolation towards target position along the track loop
          train.t = THREE.MathUtils.lerp(train.t, train.targetT, delta * 3.5);

          const loopT = ((train.t % 1) + 1) % 1; // Normalize 0..1
          const pos = curveInstance.getPointAt(loopT);
          const tangent = curveInstance.getTangentAt(loopT).normalize();

          train.mesh.position.copy(pos);

          // Align train facing along rail tangent
          const lookTarget = pos.clone().add(tangent);
          train.mesh.lookAt(lookTarget);

          // Subtle train rocking motion
          train.mesh.rotation.z += Math.sin(elapsed * 12 + train.teamNum) * 0.03;

          // Emit chimney steam puff if moving
          if (Math.random() < 0.3) {
            const worldChimney = new THREE.Vector3();
            train.chimneyPos.getWorldPosition(worldChimney);
            spawnParticle(worldChimney, new THREE.Vector3(0, 1.5, 0), 0.8, 0xe2e8f0);
          }
        });
      }

      // Update particles
      activeParticles.forEach((p) => {
        if (p.life > 0) {
          p.life -= delta;
          p.pos.addScaledVector(p.vel, delta);
          p.pos.y += delta * 0.8; // steam rises
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Helper to spawn particle
  function spawnParticle(origin, velocity, duration, colorHex) {
    if (!particlesRef.current) return;
    const p = particlesRef.current.find((part) => part.life <= 0);
    if (!p) return;
    p.pos.copy(origin);
    p.vel.copy(velocity).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 0.8, (Math.random() - 0.5) * 1.5));
    p.life = duration;
    p.maxLife = duration;
    p.color.setHex(colorHex);
  }

  // Update trains from incoming props (teams)
  useEffect(() => {
    if (!teams || teams.length === 0 || !trackCurveRef.current) return;

    // Max lap distance base (e.g. 1500m per lap)
    const LAP_DISTANCE = 1500;

    teams.forEach((team) => {
      const train = trainsRef.current[team.id];
      if (train) {
        // Target normalized curve t
        const normalizedT = (team.distance || 0) / LAP_DISTANCE;
        train.targetT = normalizedT;

        // Debuffs / Shield effects
        if (train.effects) {
          train.effects.ice.visible = Boolean(team.isFrozen);
          train.effects.shield.visible = Boolean(team.hasShield);
          train.effects.flame.visible = Boolean(team.isBoosting);
        }
      }
    });

    // If camera mode is 'leader', point to #1 team
    if (cameraMode === 'leader' && cameraRef.current) {
      const sorted = [...teams].sort((a, b) => b.distance - a.distance);
      const leader = sorted[0];
      if (leader && trainsRef.current[leader.id]) {
        const leaderPos = trainsRef.current[leader.id].mesh.position;
        cameraRef.current.position.set(leaderPos.x + 12, leaderPos.y + 16, leaderPos.z + 18);
        cameraRef.current.lookAt(leaderPos);
      }
    }
  }, [teams, cameraMode]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Arena Camera Controls Floating Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-300 z-10 shadow-lg">
        <Camera className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400 font-semibold mr-1">Kamera:</span>
        <button
          onClick={() => setCameraMode('orbit')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'orbit' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Sinematik
        </button>
        <button
          onClick={() => setCameraMode('leader')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'leader' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Leader Cam
        </button>
        <button
          onClick={() => setCameraMode('top')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'top' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Atas Rel
        </button>
      </div>

      {/* Floating Track Status Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-300 z-10 shadow-lg">
        <span className="text-amber-400 font-extrabold">ARENA REL 3D:</span>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500"></span> K1</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span> K2</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span> K3</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span> K4</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500"></span> K5</div>
      </div>
    </div>
  );
}
