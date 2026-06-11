/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../store";

interface Vertex3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
  size: number;
  label?: string;
}

interface Edge {
  a: number;
  b: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
}

export default function Interactive3DScene() {
  const { theme } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [isRotating, setIsRotating] = useState(false);
  const rotationX = useRef(0.4);
  const rotationY = useRef(0.6);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetRotationX = useRef(0.4);
  const targetRotationY = useRef(0.6);
  const isDragging = useRef(false);
  const dragStartMouseX = useRef(0);
  const dragStartMouseY = useRef(0);
  const dragStartRotX = useRef(0);
  const dragStartRotY = useRef(0);

  // Screen resize tracking
  const [dimensions, setDimensions] = useState({ width: 450, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 450,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set scale factor for Retina sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Geometry parameters
    const size = Math.min(dimensions.width, dimensions.height) * 0.42;
    const vertices: Vertex3D[] = [];
    const edges: Edge[] = [];
    const particles: Particle3D[] = [];

    // 1. Generate vertices of a highly aesthetic dual-frequency geodesic globe
    const rings = 5;
    const segments = 12;
    const labels = [
      "DISPATCH.STATE: REMOTE",
      "SYS.LATENCY: 0.45s",
      "NODES.ACTIVE: 120+",
      "DB.SECURITY: COMPLAINT",
      "AI.MODULATOR: G.GEMINI",
      "CORE.INDEX: TECHNICAL SEO",
    ];

    // Top vertex
    vertices.push({ x: 0, y: -size, z: 0, baseX: 0, baseY: -size, baseZ: 0, color: "emerald", size: 4 });
    
    for (let r = 1; r < rings; r++) {
      const phi = (r / rings) * Math.PI;
      const ringY = -Math.cos(phi) * size;
      const ringRadius = Math.sin(phi) * size;
      const hasLabels = r === 2 || r === 3;

      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * 2 * Math.PI;
        const x = Math.sin(theta) * ringRadius;
        const z = Math.cos(theta) * ringRadius;
        
        let label: string | undefined = undefined;
        let pSize = 3;
        let color = "cyan";

        if (hasLabels && s % 4 === 0) {
          label = labels[s % labels.length];
          pSize = 4.5;
          color = "purple";
        } else if (s % 3 === 0) {
          color = "emerald";
        }

        vertices.push({
          x, y: ringY, z,
          baseX: x, baseY: ringY, baseZ: z,
          color, size: pSize, label
        });
      }
    }

    // Bottom vertex
    vertices.push({ x: 0, y: size, z: 0, baseX: 0, baseY: size, baseZ: 0, color: "purple", size: 4 });

    // Generate edges to form a wireframe lattice
    const lastIdx = vertices.length - 1;

    // Connect top to first ring
    for (let s = 1; s <= segments; s++) {
      edges.push({ a: 0, b: s });
      // Connect first ring horizontally
      edges.push({ a: s, b: s === segments ? 1 : s + 1 });
    }

    // Connect intermediate rings
    for (let r = 1; r < rings - 1; r++) {
      const startCurrent = 1 + (r - 1) * segments;
      const startNext = 1 + r * segments;

      for (let s = 0; s < segments; s++) {
        const curr = startCurrent + s;
        const currNextSegment = startCurrent + ((s + 1) % segments);
        const next = startNext + s;
        const nextNextSegment = startNext + ((s + 1) % segments);

        edges.push({ a: curr, b: next });
        edges.push({ a: curr, b: nextNextSegment });
        edges.push({ a: next, b: nextNextSegment });
      }
    }

    // Connect bottom ring to bottom vertex
    const startBottomRing = lastIdx - segments;
    for (let s = 0; s < segments; s++) {
      const curr = startBottomRing + s;
      edges.push({ a: curr, b: lastIdx });
      edges.push({ a: curr, b: startBottomRing + ((s + 1) % segments) });
    }

    // 2. Generate a stream of stellar dust particles
    for (let p = 0; p < 80; p++) {
      particles.push({
        x: (Math.random() - 0.5) * size * 4,
        y: (Math.random() - 0.5) * size * 4,
        z: Math.random() * size * 3 - size,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: -Math.random() * 0.7 - 0.2, // Drifting towards viewer
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animationFrameId: number;
    let autoRotationSpeed = 0.003;
    let hoverScale = 0;

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      // Handle continuous rotation inertia
      if (!isDragging.current) {
        targetRotationY.current += autoRotationSpeed;
        rotationX.current += (targetRotationX.current - rotationX.current) * 0.15;
        rotationY.current += (targetRotationY.current - rotationY.current) * 0.15;
      } else {
        rotationX.current += (targetRotationX.current - rotationX.current) * 0.2;
        rotationY.current += (targetRotationY.current - rotationY.current) * 0.2;
      }

      // Parallax mouse interaction hover scale
      hoverScale += (isDragging.current ? 1.05 - hoverScale : 1 - hoverScale) * 0.1;

      const cosX = Math.cos(rotationX.current);
      const sinX = Math.sin(rotationX.current);
      const cosY = Math.cos(rotationY.current);
      const sinY = Math.sin(rotationY.current);

      // Perspective projection parameters
      const perspective = size * 2.8;

      // 3. Draw ambient coordinate parallax grid underneath
      const drawGrid = () => {
        const gridZCenter = size * 0.3;
        const gridYPos = size * 1.05;
        const gridCount = 9;
        const gridSpacing = size * 0.22;

        ctx.strokeStyle = theme === "dark" ? "rgba(188, 156, 110, 0.1)" : "rgba(66, 48, 38, 0.06)";
        ctx.lineWidth = 1;

        // Draw parallax lines representing automated operations coordinates
        for (let i = -gridCount; i <= gridCount; i++) {
          // Lines along Z
          const x1 = i * gridSpacing;
          const z1 = -gridCount * gridSpacing;
          const x2 = i * gridSpacing;
          const z2 = gridCount * gridSpacing;

          // Rotate and Project point 1
          const ry1 = x1 * cosY - z1 * sinY;
          const rz1 = x1 * sinY + z1 * cosY;
          const rx1 = ry1;
          const rz1_proj = rz1;
          
          const rotY1 = gridYPos * cosX - rz1_proj * sinX;
          const rotZ1 = gridYPos * sinX + rz1_proj * cosX;

          const f1 = perspective / (perspective + rotZ1);
          const px1 = centerX + rx1 * f1;
          const py1 = centerY + rotY1 * f1;

          // Point 2
          const ry2 = x2 * cosY - z2 * sinY;
          const rz2 = x2 * sinY + z2 * cosY;
          const rx2 = ry2;
          const rz2_proj = rz2;

          const rotY2 = gridYPos * cosX - rz2_proj * sinX;
          const rotZ2 = gridYPos * sinX + rz2_proj * cosX;

          const f2 = perspective / (perspective + rotZ2);
          const px2 = centerX + rx2 * f2;
          const py2 = centerY + rotY2 * f2;

          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();

          // Lines along X
          const rx1_x = -gridCount * gridSpacing * cosY - i * gridSpacing * sinY;
          const rz1_x = -gridCount * gridSpacing * sinY + i * gridSpacing * cosY;
          const rotY1_x = gridYPos * cosX - rz1_x * sinX;
          const rotZ1_x = gridYPos * sinX + rz1_x * cosX;
          const f1_x = perspective / (perspective + rotZ1_x);
          const px1_x = centerX + rx1_x * f1_x;
          const py1_x = centerY + rotY1_x * f1_x;

          const rx2_x = gridCount * gridSpacing * cosY - i * gridSpacing * sinY;
          const rz2_x = gridCount * gridSpacing * sinY + i * gridSpacing * cosY;
          const rotY2_x = gridYPos * cosX - rz2_x * sinX;
          const rotZ2_x = gridYPos * sinX + rz2_x * cosX;
          const f2_x = perspective / (perspective + rotZ2_x);
          const px2_x = centerX + rx2_x * f2_x;
          const py2_x = centerY + rotY2_x * f2_x;

          ctx.beginPath();
          ctx.moveTo(px1_x, py1_x);
          ctx.lineTo(px2_x, py2_x);
          ctx.stroke();
        }
      };

      drawGrid();

      // 4. Update and Draw 3D Drifting Starfield Particles
      particles.forEach((p) => {
        p.z += p.vz;
        p.x += p.vx;
        p.y += p.vy;

        // Recycle particles when they get too close or push out of limits
        if (p.z < -size) {
          p.z = size * 2;
          p.x = (Math.random() - 0.5) * size * 3;
          p.y = (Math.random() - 0.5) * size * 3;
        }

        // Apply 3D coordinate rotation
        const ry1 = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;
        const rotY = p.y * cosX - rz1 * sinX;
        const rotZ = p.y * sinX + rz1 * cosX;

        if (rotZ + perspective > 10) {
          const factor = perspective / (perspective + rotZ);
          const drawX = centerX + ry1 * factor;
          const drawY = centerY + rotY * factor;
          const drawSize = p.size * factor;

          if (drawX >= 0 && drawX <= dimensions.width && drawY >= 0 && drawY <= dimensions.height) {
            const opacity = p.alpha * Math.min(1, (size * 2 - p.z) / size);
            ctx.fillStyle = theme === "dark" 
              ? `rgba(188, 156, 110, ${opacity * 0.35})` 
              : `rgba(133, 110, 98, ${opacity * 0.25})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, drawSize, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });

      // 5. Projected 3D nodes arrays
      const projected: { px: number; py: number; pz: number; orig: Vertex3D }[] = [];

      vertices.forEach((v) => {
        // Interactive magnetic mouse pull
        let offsetX = 0;
        let offsetY = 0;
        let offsetZ = 0;

        // Magnify mouse pull connection
        const dx = v.baseX - mouseX.current;
        const dy = v.baseY - mouseY.current;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const power = (180 - dist) / 180;
          // Apply a subtle dynamic wave effect
          offsetX = Math.sin(Date.now() * 0.002 + v.baseX) * 14 * power;
          offsetY = Math.cos(Date.now() * 0.002 + v.baseY) * 14 * power;
        }

        const currX = v.baseX + offsetX;
        const currY = v.baseY + offsetY;
        const currZ = v.baseZ + offsetZ;

        // Perform 3D rotations based on Euler matrix transformations
        // Y-axis Rotation
        const ry = currX * cosY - currZ * sinY;
        const rz = currX * sinY + currZ * cosY;

        // X-axis Rotation
        const rx = ry;
        const rotY = currY * cosX - rz * sinX;
        const rotZ = currY * sinX + rz * cosX;

        // Map projection
        const factor = perspective / (perspective + rotZ);
        const px = centerX + rx * factor * hoverScale;
        const py = centerY + rotY * factor * hoverScale;

        projected.push({ px, py, pz: rotZ, orig: v });
      });

      // 6. Draw Lattice Lines (Depth-Sorted)
      // Connect vertices with transparency matching their coordinate depths
      edges.forEach((edge) => {
        const p1 = projected[edge.a];
        const p2 = projected[edge.b];

        if (!p1 || !p2) return;

        // Midpoint Z depth sorting for realistic lighting overlaps
        const avgZ = (p1.pz + p2.pz) / 2;
        const maxDepth = size * 1.5;
        const zValue = Math.max(0, Math.min(1, (maxDepth - avgZ) / (maxDepth * 2)));

        ctx.lineWidth = 0.85;

        // Match color themes for line connectors (glowing laser lines)
        if (theme === "dark") {
          ctx.strokeStyle = `rgba(188, 156, 110, ${zValue * 0.22})`;
        } else {
          ctx.strokeStyle = `rgba(133, 110, 98, ${zValue * 0.15})`;
        }

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      });

      // 7. Draw vertices nodes + glow accents
      projected.forEach((p) => {
        const maxDepth = size * 1.5;
        const zValue = Math.max(0.1, Math.min(1, (maxDepth - p.pz) / (maxDepth * 2)));
        const itemSize = p.orig.size * zValue * 1.15;

        // Neon coloring values
        let baseColor = "rgba(188, 156, 110, ";  // Premium Gold
        if (p.orig.color === "purple") {
          baseColor = "rgba(168, 108, 72, ";  // Terracotta Copper
        } else if (p.orig.color === "emerald") {
          baseColor = "rgba(122, 130, 96, ";  // Moss/Sage Green
        }

        // Draw node auroras/glow ring
        if (p.orig.label) {
          ctx.fillStyle = `${baseColor}${zValue * 0.1})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, itemSize * 3.5, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw primary dot
        ctx.fillStyle = `${baseColor}${zValue * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, itemSize, 0, 2 * Math.PI);
        ctx.fill();

        // 8. Custom floating telemetry text indicators
        if (p.orig.label && zValue > 0.45) {
          ctx.font = "normal 500 8.5px JetBrains Mono, monospace";
          
          if (theme === "dark") {
            ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
            ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
          } else {
            ctx.fillStyle = "rgba(71, 85, 105, 0.95)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          }

          ctx.lineWidth = 2.5;

          const textWidth = ctx.measureText(p.orig.label).width;
          const textX = p.px + 7;
          const textY = p.py + 3;

          // Draw neon label micro pointer line
          ctx.strokeStyle = theme === "dark" ? "rgba(148, 163, 184, 0.2)" : "rgba(71, 85, 105, 0.15)";
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(textX - 2, textY - 3);
          ctx.stroke();

          // Stroke backplate text for legibility
          ctx.lineWidth = 2.5;
          ctx.strokeText(p.orig.label, textX, textY);
          ctx.fillText(p.orig.label, textX, textY);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, theme]);

  // Drag interaction math handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    dragStartMouseX.current = e.clientX;
    dragStartMouseY.current = e.clientY;
    dragStartRotX.current = targetRotationX.current;
    dragStartRotY.current = targetRotationY.current;
    setIsRotating(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Collect rect offset coordinates
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.current = e.clientX - rect.left - dimensions.width / 2;
      mouseY.current = e.clientY - rect.top - dimensions.height / 2;
    }

    if (!isDragging.current) return;

    const deltaX = e.clientX - dragStartMouseX.current;
    const deltaY = e.clientY - dragStartMouseY.current;

    // Direct rotation mapping factor
    targetRotationY.current = dragStartRotY.current + deltaX * 0.007;
    targetRotationX.current = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, dragStartRotX.current + deltaY * 0.007)
    );
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsRotating(false);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[450px] relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      id="3d-interactive-container"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="block max-w-full absolute inset-0 z-0"
        id="3d-interactive-canvas"
        style={{ width: "100%", height: "100%", touchAction: "none" }}
      />
      
      {/* 3D Tech HUD overlay details */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono text-[9px] uppercase tracking-wider space-y-1 select-none text-left bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/40 backdrop-blur-sm">
        <p className="text-cyan-400 font-bold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Holographic 3D Orbit Node Map</span>
        </p>
        <p className="opacity-55">Coordinate Matrix: 120 nodes active</p>
        <p className="opacity-55">Interaction: Click & Drag to Rotate</p>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none font-mono text-[9px] uppercase tracking-wider space-y-0.5 text-right opacity-65 select-none bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/40 backdrop-blur-sm">
        <p>Diavox Hub // Remote Dispatcher</p>
        <p className="text-purple-400">STATUS // SECURE STABLE ACTIVE</p>
      </div>
    </div>
  );
}
