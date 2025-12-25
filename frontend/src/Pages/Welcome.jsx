import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HyperAdvancedLanding = () => {
  const canvasRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a Particle Field (The Community)
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: '#6366f1' });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 3;

    // --- GSAP + THREE.JS ANIMATION ---
    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();

    // Rotate particles on scroll
    gsap.to(particlesMesh.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
      }
    });

    // Zoom into the field on scroll
    gsap.to(camera.position, {
      z: 1,
      scrollTrigger: {
        trigger: ".second-section",
        start: "top bottom",
        end: "top top",
        scrub: true,
      }
    });

    // --- TEXT REVEAL ANIMATION ---
    const tl = gsap.timeline();
    tl.from(".reveal-text", {
      y: 200,
      rotationX: -90,
      opacity: 0,
      stagger: 0.2,
      duration: 2,
      ease: "expo.out"
    });

    return () => {
      renderer.dispose();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="bg-[#020617] text-white">
      {/* 3D CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col items-center justify-center relative px-4 overflow-hidden">
        <div className="text-center perspective-1000">
          <h1 className="reveal-text text-[12vw] font-black leading-none tracking-tighter uppercase italic">
            Hyper <br /> <span className="text-indigo-500">Linked</span>
          </h1>
          <p className="reveal-text text-xl font-light tracking-[0.5em] mt-10 opacity-60">
            DHARLINK ENGINE v2.0
          </p>
        </div>
      </section>

      {/* SECOND SECTION: THE INTERACTIVE GRID */}
      <section className="second-section min-h-screen py-32 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
            <div className="space-y-10">
              <h2 className="text-8xl font-black leading-none">Shared <br/> Economy</h2>
              <p className="text-2xl text-slate-400 leading-relaxed">
                We are moving away from ownership into a fluid state of access. 
                Our community is a living organism.
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-transparent" />
            </div>
            
            <div className="relative group">
               {/* Magnetic Floating Card */}
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] hover:bg-white/10 transition-all duration-700 hover:-translate-y-10 group cursor-crosshair">
                  <div className="text-6xl mb-8">⚡</div>
                  <h3 className="text-4xl font-bold mb-4">Instant Access</h3>
                  <p className="text-slate-400">The items you need are within 500 meters of your current location.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="h-screen flex items-center justify-center">
         <button className="relative group overflow-hidden px-16 py-8 rounded-full border border-white/20 hover:border-indigo-500 transition-colors">
            <span className="relative z-10 text-xl font-black tracking-widest group-hover:text-indigo-500">INITIALIZE NETWORK</span>
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
         </button>
      </section>
    </div>
  );
};

export default HyperAdvancedLanding;