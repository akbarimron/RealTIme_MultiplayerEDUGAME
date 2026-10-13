import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Mountain, Sparkles, Compass, Shield } from 'lucide-react';

export default function ThreeMountainArena({ teams = [], recentEvent = null }) {
  const mountRef = useRef(null);
  const [cameraMode, setCameraMode] = useState('leader'); // 'leader', 'overview', 'cinematic'
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const climbersRef = useRef({});
  const particlesRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Atmosphere (GDevelop Theme)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0b1a); // Midnight space
    scene.fog = new THREE.FogExp2(0x0a0b1a, 0.009);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 18, 48);
    camera.lookAt(0, 15, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xcfd8dc, 0.85);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xd5f9eb, 1.9);
    moonLight.position.set(-25, 60, 20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 10;
    moonLight.shadow.camera.far = 180;
    moonLight.shadow.camera.left = -35;
    moonLight.shadow.camera.right = 35;
    moonLight.shadow.camera.top = 70;
    moonLight.shadow.camera.bottom = -10;
    scene.add(moonLight);

    // Cyan Portal glow light at top
    const portalLight = new THREE.PointLight(0x1fe4ce, 3.5, 45);
    portalLight.position.set(0, 52, 0);
    scene.add(portalLight);

    // 4. Background Giant Luminous Moon (GDevelop Moon)
    const moonGeo = new THREE.SphereGeometry(14, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xd5f9eb });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-28, 56, -35);
    scene.add(moon);

    // Star specks in background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 180;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 160;
      starPositions[i * 3 + 1] = Math.random() * 80 + 10;
      starPositions[i * 3 + 2] = -40 - Math.random() * 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 5. Giant Mountain Cliff Wall (Earth & Mint Grass Ledges)
    const cliffGroup = new THREE.Group();
    scene.add(cliffGroup);

    // Main central rocky cliff spine
    const cliffBackGeo = new THREE.BoxGeometry(28, 65, 8);
    const cliffBackMat = new THREE.MeshStandardMaterial({ color: 0x3d2a1d, roughness: 0.9, metalness: 0.1 });
    const cliffBack = new THREE.Mesh(cliffBackGeo, cliffBackMat);
    cliffBack.position.set(0, 26, -4);
    cliffBack.receiveShadow = true;
    cliffGroup.add(cliffBack);

    // Tiered Floating Rock Ledges (Nodes) with Mint Green Grass Caps
    const numLedges = 15;
    const ledges = [];
    for (let i = 0; i < numLedges; i++) {
      const y = i * 3.4 + 2.5;
      const xOffset = Math.sin(i * 1.3) * 6.5;
      const width = 8.5 + (Math.sin(i) * 2.0);

      const ledgeGroup = new THREE.Group();

      // Rock bottom
      const rockGeo = new THREE.BoxGeometry(width, 1.8, 3.2);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a3528, roughness: 0.85 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(0, 0, 0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      ledgeGroup.add(rock);

      // Mint green grass top cap (GDevelop vibrant mint)
      const grassGeo = new THREE.BoxGeometry(width + 0.3, 0.45, 3.4);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x3ce0a0, roughness: 0.5 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(0, 0.95, 0);
      grass.castShadow = true;
      grass.receiveShadow = true;
      ledgeGroup.add(grass);

      // Hanging ivy vines
      if (i % 2 === 0) {
        const vineGeo = new THREE.BoxGeometry(0.5, 1.4, 0.2);
        const vineMat = new THREE.MeshStandardMaterial({ color: 0x1fa36e });
        const vine = new THREE.Mesh(vineGeo, vineMat);
        vine.position.set(width * 0.25, -1.1, 1.6);
        ledgeGroup.add(vine);
      }

      ledgeGroup.position.set(xOffset, y, 0);
      cliffGroup.add(ledgeGroup);
      ledges.push({ x: xOffset, y: y, z: 1.0 });
    }

    // 6. Ancient Portal at Summit (Peak Goal: 1500m / Y=52)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 52, 0);

    // Stone Arch
    const archGeo = new THREE.TorusGeometry(3.5, 0.8, 12, 24, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.rotation.z = 0;
    arch.castShadow = true;
    portalGroup.add(arch);

    // Glowing Inner Magic Portal
    const portalInnerGeo = new THREE.CircleGeometry(2.8, 24);
    const portalInnerMat = new THREE.MeshBasicMaterial({ color: 0x1fe4ce, side: THREE.DoubleSide });
    const portalInner = new THREE.Mesh(portalInnerGeo, portalInnerMat);
    portalInner.position.z = 0.1;
    portalGroup.add(portalInner);

    // Spinning Yellow Diamond Gem (Reference image icon)
    const gemGeo = new THREE.OctahedronGeometry(0.9);
    const gemMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, roughness: 0.2, metalness: 0.8 });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 5.2, 0.5);
    portalGroup.add(gem);

    cliffGroup.add(portalGroup);

    // 7. Fluffy White Clouds at the Base
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(0, -1, 4);
    for (let c = 0; c < 12; c++) {
      const puffGeo = new THREE.SphereGeometry(3 + Math.random() * 2, 16, 16);
      const puffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
      const puff = new THREE.Mesh(puffGeo, puffMat);
      puff.position.set((c - 6) * 4.5, Math.random() * 2, (Math.random() - 0.5) * 6);
      cloudGroup.add(puff);
    }
    scene.add(cloudGroup);

    // 8. Create 5 Stylized Climber Avatars (GDevelop Explorer Characters)
    const teamColors = {
      1: 0xff5a5a, // Coral Red (Like GDevelop main mascot bird/explorer)
      2: 0xffb800, // Gold
      3: 0x1fe4ce, // Cyan Turquoise
      4: 0x3ce0a0, // Mint Green
      5: 0x9d4edd  // Royal Purple
    };

    function createClimberModel(colorHex, teamNum) {
      const climberGroup = new THREE.Group();

      // Main cute round body
      const bodyGeo = new THREE.SphereGeometry(0.85, 18, 18);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, metalness: 0.1 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.85;
      body.castShadow = true;
      climberGroup.add(body);

      // Climber adventurer backpack
      const packGeo = new THREE.BoxGeometry(0.7, 0.9, 0.5);
      const packMat = new THREE.MeshStandardMaterial({ color: 0x3d2a1d, roughness: 0.8 });
      const pack = new THREE.Mesh(packGeo, packMat);
      pack.position.set(0, 0.85, -0.7);
      climberGroup.add(pack);

      // Big cute face eye / visor (GDevelop style)
      const eyeGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0.95, 0.7);
      climberGroup.add(eye);

      const pupilGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0b1a });
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0.95, 0.92);
      climberGroup.add(pupil);

      // Climber pickaxe / rope hook
      const ropeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
      const ropeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(0.7, 0.8, 0.3);
      rope.rotation.z = Math.PI / 4;
      climberGroup.add(rope);

      // Team Number Badge Floating Above
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`K${teamNum}`, 32, 32);

      const badgeTex = new THREE.CanvasTexture(canvas);
      const badgeMat = new THREE.SpriteMaterial({ map: badgeTex });
      const badgeSprite = new THREE.Sprite(badgeMat);
      badgeSprite.position.set(0, 2.3, 0);
      badgeSprite.scale.set(1.4, 1.4, 1.4);
      climberGroup.add(badgeSprite);

      // Debuffs & Spells Meshes
      // 1. Ice Crystal Block (Frozen)
      const iceGeo = new THREE.BoxGeometry(2.4, 2.6, 2.2);
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.1
      });
      const iceMesh = new THREE.Mesh(iceGeo, iceMat);
      iceMesh.position.y = 1.0;
      iceMesh.visible = false;
      climberGroup.add(iceMesh);

      // 2. Shield Rune Ring
      const shieldGeo = new THREE.TorusGeometry(1.6, 0.1, 12, 32);
      const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffb800 });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      shieldMesh.position.y = 1.0;
      shieldMesh.rotation.x = Math.PI / 2;
      shieldMesh.visible = false;
      climberGroup.add(shieldMesh);

      // Horizontal lane positioning for 5 climbers
      // Spread across X: K1 (-8), K2 (-4), K3 (0), K4 (4), K5 (8)
      const laneX = (teamNum - 3) * 3.8;
      climberGroup.position.set(laneX, 2.0, 1.6);
      scene.add(climberGroup);

      return {
        mesh: climberGroup,
        bodyMesh: body,
        laneX,
        effects: {
          ice: iceMesh,
          shield: shieldMesh
        },
        y: 2.0,
        targetY: 2.0,
        teamNum,
        jumpOffset: 0
      };
    }

    [1, 2, 3, 4, 5].forEach(id => {
      climbersRef.current[id] = createClimberModel(teamColors[id], id);
    });

    // 9. Particle Dust / Sparks System
    const particleCount = 100;
    const activeParticles = [];
    for (let i = 0; i < particleCount; i++) {
      activeParticles.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0
      });
    }
    particlesRef.current = activeParticles;

    // 10. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Spin summit gem
      if (gem) {
        gem.rotation.y = elapsed * 1.5;
        gem.position.y = 5.2 + Math.sin(elapsed * 2) * 0.3;
      }

      // Find highest climber
      let maxClimberY = 2;
      Object.values(climbersRef.current).forEach((climber) => {
        // Smooth vertical climb interpolation
        climber.y = THREE.MathUtils.lerp(climber.y, climber.targetY, delta * 4.0);

        // Climbing bobbing bounce
        const bob = Math.sin(elapsed * 6 + climber.teamNum) * 0.15;
        climber.mesh.position.y = climber.y + bob;

        if (climber.y > maxClimberY) {
          maxClimberY = climber.y;
        }

        // Spin shield rune ring
        if (climber.effects.shield.visible) {
          climber.effects.shield.rotation.z = elapsed * 3;
        }
      });

      // Smooth camera follow
      if (cameraMode === 'leader' && cameraRef.current) {
        const targetCamY = THREE.MathUtils.clamp(maxClimberY + 6, 14, 50);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, delta * 2.5);
        camera.position.z = 40;
        camera.position.x = 0;
        camera.lookAt(0, camera.position.y - 4, 0);
      } else if (cameraMode === 'overview') {
        camera.position.set(0, 30, 68);
        camera.lookAt(0, 26, 0);
      } else if (cameraMode === 'cinematic') {
        camera.position.x = Math.sin(elapsed * 0.2) * 32;
        camera.position.z = Math.cos(elapsed * 0.2) * 45;
        camera.position.y = 28 + Math.sin(elapsed * 0.3) * 6;
        camera.lookAt(0, 24, 0);
      }

      renderer.render(scene, camera);
    }

    animate();

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

  // Update Climbers height from incoming props (teams distance)
  useEffect(() => {
    if (!teams || teams.length === 0) return;

    // Max distance is 1500m -> mapped to mountain height (Y = 2 to Y = 48)
    const MAX_DISTANCE = 1500;
    const MOUNTAIN_HEIGHT = 46;

    teams.forEach((team) => {
      const climber = climbersRef.current[team.id];
      if (climber) {
        const progressRatio = THREE.MathUtils.clamp((team.distance || 0) / MAX_DISTANCE, 0, 1);
        climber.targetY = 2.0 + (progressRatio * MOUNTAIN_HEIGHT);

        // Debuffs
        if (climber.effects) {
          climber.effects.ice.visible = Boolean(team.isFrozen);
          climber.effects.shield.visible = Boolean(team.hasShield);
        }
      }
    });
  }, [teams]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#0A0B1A] rounded-2xl overflow-hidden border-2 border-[#292B54] shadow-2xl">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Camera Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#12132D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#292B54] text-xs font-bold text-slate-300 z-10 shadow-lg">
        <Camera className="w-4 h-4 text-[#3CE0A0]" />
        <span className="text-slate-400 font-semibold mr-1">Kamera:</span>
        <button
          onClick={() => setCameraMode('leader')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'leader' ? 'bg-[#3CE0A0] text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Ikuti Pemimpin
        </button>
        <button
          onClick={() => setCameraMode('overview')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'overview' ? 'bg-[#3CE0A0] text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Seluruh Tebing
        </button>
        <button
          onClick={() => setCameraMode('cinematic')}
          className={`px-2.5 py-1 rounded-lg transition-all ${cameraMode === 'cinematic' ? 'bg-[#3CE0A0] text-slate-950 font-extrabold shadow' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Sinematik
        </button>
      </div>

      {/* Floating Climber Team Status Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 bg-[#12132D]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#292B54] text-xs font-semibold text-slate-300 z-10 shadow-lg">
        <div className="flex items-center gap-1.5 text-[#3CE0A0] font-extrabold">
          <Mountain className="w-4 h-4" />
          <span>TEBING STRUKDAT:</span>
        </div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF5A5A] shadow-sm shadow-[#FF5A5A]"></span> K1</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] shadow-sm shadow-[#FFB800]"></span> K2</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1FE4CE] shadow-sm shadow-[#1FE4CE]"></span> K3</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3CE0A0] shadow-sm shadow-[#3CE0A0]"></span> K4</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9D4EDD] shadow-sm shadow-[#9D4EDD]"></span> K5</div>
      </div>
    </div>
  );
}
