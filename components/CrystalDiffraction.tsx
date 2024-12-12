"use client"

import React, { useState, useEffect } from 'react';

const Button = ({ 
  onClick, 
  children, 
  className = "" 
}: { 
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

const Slider = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max 
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) => (
  <div className="mb-4">
    <label className="block mb-2">{label}</label>
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      className="w-64"
    />
    <span className="ml-2">{value}</span>
  </div>
);

const CrystalDiffraction = () => {
  const [latticeSpacing, setLatticeSpacing] = useState(40);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [atomRadius, setAtomRadius] = useState(6);
  const reciprocalScale = 2;

  useEffect(() => {
    let animationFrame;
    if (isAnimating) {
      const animate = () => {
        setRotationZ(prev => (prev + 0.5) % 360);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isAnimating]);

  // Generate 3D crystal lattice points
  const generateLatticePoints = () => {
    const points = [];
    const gridSize = 2;
    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        for (let k = -gridSize; k <= gridSize; k++) {
          points.push({
            x: i * latticeSpacing,
            y: j * latticeSpacing,
            z: k * latticeSpacing
          });
        }
      }
    }
    return points;
  };

  // Generate 3D reciprocal lattice points
  const generateReciprocalPoints = () => {
    const points = [];
    const gridSize = 2;
    const reciprocalSpacing = (200 / latticeSpacing) * reciprocalScale;
    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        for (let k = -gridSize; k <= gridSize; k++) {
          points.push({
            x: i * reciprocalSpacing,
            y: j * reciprocalSpacing,
            z: k * reciprocalSpacing
          });
        }
      }
    }
    return points;
  };

  // 3D transformation matrix multiplication
  const transform3D = (point) => {
    const radX = rotationX * Math.PI / 180;
    const radY = rotationY * Math.PI / 180;
    const radZ = rotationZ * Math.PI / 180;
    
    // Rotation around X axis
    let x = point.x;
    let y = point.y * Math.cos(radX) - point.z * Math.sin(radX);
    let z = point.y * Math.sin(radX) + point.z * Math.cos(radX);
    
    // Rotation around Y axis
    const tempX = x * Math.cos(radY) + z * Math.sin(radY);
    const tempZ = -x * Math.sin(radY) + z * Math.cos(radY);
    x = tempX;
    z = tempZ;
    
    // Rotation around Z axis
    const tempX2 = x * Math.cos(radZ) - y * Math.sin(radZ);
    const tempY = x * Math.sin(radZ) + y * Math.cos(radZ);
    x = tempX2;
    y = tempY;

    // Apply perspective
    const perspective = 500;
    const scale = perspective / (perspective + z);
    
    return {
      x: x * scale,
      y: y * scale,
      z: z,
      scale
    };
  };

  const calculateConnections = (points) => {
    const connections = [];
    const threshold = latticeSpacing * 1.1;
    
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i];
        const p2 = points[j];
        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) +
          Math.pow(p1.y - p2.y, 2) +
          Math.pow(p1.z - p2.z, 2)
        );
        
        if (distance <= threshold) {
          connections.push([p1, p2]);
        }
      }
    }
    return connections;
  };

  const renderLattice = (points, connections, color, lineColor, isReciprocal = false) => {
    const transformedPoints = points.map(p => ({
      ...p,
      ...transform3D(p)
    })).sort((a, b) => b.z - a.z);

    const transformedConnections = connections.map(([p1, p2]) => ([
      transform3D(p1),
      transform3D(p2)
    ])).sort((a, b) => (b[0].z + b[1].z)/2 - (a[0].z + a[1].z)/2);

    return (
      <>
        {transformedConnections.map((pair, i) => (
          <line
            key={`connection-${i}`}
            x1={pair[0].x}
            y1={pair[0].y}
            x2={pair[1].x}
            y2={pair[1].y}
            stroke={lineColor}
            strokeWidth="1"
            opacity={0.4}
          />
        ))}
        {transformedPoints.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={atomRadius * point.scale * (isReciprocal ? 1.2 : 1)}
            fill={color}
            opacity={0.8}
          />
        ))}
      </>
    );
  };

  const latticePoints = generateLatticePoints();
  const reciprocalPoints = generateReciprocalPoints();
  const latticeConnections = calculateConnections(latticePoints);
  const reciprocalConnections = calculateConnections(reciprocalPoints);

  return (
    <div className="w-full max-w-4xl p-4">
      <div className="mb-6">
        <Button 
          onClick={() => setIsAnimating(!isAnimating)}
          className="mr-4"
        >
          {isAnimating ? 'Stop' : 'Start'} Animation
        </Button>
        <Button 
          onClick={() => {
            setRotationX(0);
            setRotationY(0);
            setRotationZ(0);
          }}
        >
          Reset Rotation
        </Button>
      </div>

      <Slider
        label="Lattice Spacing"
        value={latticeSpacing}
        onChange={setLatticeSpacing}
        min={20}
        max={60}
      />

      <Slider
        label="Atom Size"
        value={atomRadius}
        onChange={setAtomRadius}
        min={2}
        max={10}
      />

      <Slider
        label="X Rotation"
        value={rotationX}
        onChange={setRotationX}
        min={0}
        max={360}
      />

      <Slider
        label="Y Rotation"
        value={rotationY}
        onChange={setRotationY}
        min={0}
        max={360}
      />

      <div className="flex gap-4">
        <div className="relative w-96 h-96 border rounded">
          <svg 
            viewBox="-200 -200 400 400"
            className="w-full h-full"
          >
            {renderLattice(latticePoints, latticeConnections, "#4299e1", "#90cdf4")}
          </svg>
          <div className="absolute top-2 left-2 text-sm font-medium">Real Space</div>
        </div>

        <div className="relative w-96 h-96 border rounded">
          <svg 
            viewBox="-200 -200 400 400"
            className="w-full h-full"
          >
            {renderLattice(reciprocalPoints, reciprocalConnections, "#ed64a6", "#fbb6ce", true)}
          </svg>
          <div className="absolute top-2 left-2 text-sm font-medium">Reciprocal Space</div>
        </div>
      </div>
    </div>
  );
};

export default CrystalDiffraction;
