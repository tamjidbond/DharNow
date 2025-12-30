import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CreativeLanding = () => {
  const canvasRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // --- ENGINE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- THE NEURAL MESH (CREATIVE CORE) ---
    const geometry = new THREE.BufferGeometry();
    const count = 150; // Focused count for meaningful connections
    const positions = new Float32Array(count * 3);
    
    for(let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Shader-like Material
    const material = new THREE.PointsMaterial({
      size: 0.04,
      color: '#6366f1',
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Create Lines (The "Links")
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#4338ca', transparent: true, opacity: 0.2 });
    const lineGeometry = new THREE.BufferGeometry();
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    camera.position.z = 5;

    // --- INTERACTION LOGIC ---
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // --- ANIMATION LOOP ---
    const animate = () => {
      const time = Date.now() * 0.0005;
      
      // Gentle floating motion
      points.rotation.y = time * 0.1;
      points.rotation.x = time * 0.05;

      // Mouse following parallax
      gsap.to(camera.position, {
        x: mouse.current.x * 1.5,
        y: mouse.current.y * 1.5,
        duration: 2,
        ease: "power2.out"
      });

      // Dynamic Line Building (Connecting the dots)
      const currentPos = points.geometry.attributes.position.array;
      const linePositions = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = currentPos[i * 3] - currentPos[j * 3];
          const dy = currentPos[i * 3 + 1] - currentPos[j * 3 + 1];
          const dz = currentPos[i * 3 + 2] - currentPos[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < 1.5) { // Connection threshold
            linePositions.push(currentPos[i*3], currentPos[i*3+1], currentPos[i*3+2]);
            linePositions.push(currentPos[j*3], currentPos[j*3+1], currentPos[j*3+2]);
          }
        }
      }
      lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineMesh.rotation.copy(points.rotation);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // --- SCROLL ORCHESTRATION ---
    gsap.timeline({
      scrollTrigger: {
        trigger: ".main-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5
      }
    })
    .to(camera.position, { z: 2, ease: "none" })
    .to(scene.fog, { far: 1, ease: "none" }, 0);

    return () => window.removeEventListener('mousemove', onMouseMove );
  }, []);

  return (
    <div className="main-container bg-[#020617] text-white selection:bg-indigo-500 overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

      {/* SECTION 1: KINETIC TYPOGRAPHY */}
      <section className="h-screen flex flex-col justify-center px-6 md:px-20 relative">
        <div className="overflow-hidden">
          <h2 className="text-indigo-500 font-mono text-sm tracking-[0.8em] mb-4 animate-pulse">SYSTEM INITIALIZED // V2.0</h2>
        </div>
        <h1 className="text-[14vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase">
          DHAR <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">LINK.</span>
        </h1>
        <div className="mt-12 flex flex-col md:flex-row gap-10 md:items-center">
            <div className="w-20 h-[1px] bg-indigo-500" />
            <p className="max-w-md text-slate-400 text-lg leading-relaxed font-light">
                A decentralized borrowing protocol built for the next generation of physical asset sharing.
            </p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">Scroll to Connect</span>
            <div className="w-[1px] h-20 bg-gradient-to-b from-indigo-500 to-transparent" />
        </div>
      </section>

      {/* SECTION 2: GLITCH CARDS */}
      <section className="min-h-screen py-40 px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <FeatureCard 
            number="01" 
            title="Local Protocol" 
            desc="Items mapped within 500m via spatial-intelligence." 
          />
          <FeatureCard 
            number="02" 
            title="Karma Ledger" 
            desc="Trust-weighted borrowing scores for every neighbor." 
            active
          />
          <FeatureCard 
            number="03" 
            title="Zero Waste" 
            desc="Maximizing item lifecycle through community velocity." 
          />
        </div>
      </section>

      {/* FINAL CTA: THE VOID */}
      <section className="h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">READY TO JOIN THE <br/> NEIGHBORHOOD?</h2>
          <button className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-tighter hover:bg-indigo-500 hover:text-white transition-all duration-500 rounded-full overflow-hidden">
            <span className="relative z-10">Launch Dashboard</span>
            <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-black transition-transform duration-500" />
          </button>
      </section>
    </div>
  );
};

const FeatureCard = ({ number, title, desc, active }) => (
  <div className={`p-10 rounded-[3rem] border transition-all duration-500 group ${active ? 'bg-indigo-600 border-transparent' : 'bg-white/5 border-white/10 hover:border-indigo-500'}`}>
    <span className="text-xs font-mono mb-10 block opacity-50 group-hover:translate-x-2 transition-transform">{number} —</span>
    <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase">{title}</h3>
    <p className={`${active ? 'text-indigo-100' : 'text-slate-400'} leading-relaxed`}>{desc}</p>
  </div>
);

export default CreativeLanding;