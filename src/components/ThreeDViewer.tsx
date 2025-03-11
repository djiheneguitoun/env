import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useFloorPlan } from '../contexts/FloorPlanContext';

// Component to render a wall in 3D
const Wall = ({ start, end }: { start: [number, number]; end: [number, number] }) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
  );
  
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  
  const position: [number, number, number] = [
    (start[0] + end[0]) / 2,
    1.5, // Wall height / 2
    (start[1] + end[1]) / 2,
  ];
  
  return (
    <mesh position={position} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, 3, 0.2]} />
      <meshStandardMaterial 
        color="#e0e0e0" 
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

// Component to render a door in 3D
const Door = ({ position, rotation = 0 }: { position: [number, number]; rotation?: number }) => {
  // Door frame
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotation, 0]}>
      {/* Door frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.2, 3, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Door panel */}
      <mesh position={[0, 1.5, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.9, 2.8, 0.05]} />
        <meshStandardMaterial color="#A52A2A" roughness={0.6} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[0.35, 1.5, 0.15]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Component to render a window in 3D
const Window = ({ position, rotation = 0 }: { position: [number, number]; rotation?: number }) => {
  return (
    <group position={[position[0], 1.5, position[1]]} rotation={[0, rotation, 0]}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Window glass */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.4, 1.1, 0.02]} />
        <meshStandardMaterial 
          color="#A5C8E1" 
          transparent={true} 
          opacity={0.6} 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Window divider - horizontal */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.5, 0.05, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Window divider - vertical */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.05, 1.2, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

// Component to render the floor
const Floor = ({ width, height }: { width: number; height: number }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial 
        color="#f5f5f5" 
        roughness={0.8}
        metalness={0.1}
      />
      <gridHelper args={[Math.max(width, height), Math.max(width, height) / 10, '#cccccc', '#e5e5e5']} rotation={[Math.PI / 2, 0, 0]} />
    </mesh>
  );
};

// Component to set up the scene
const Scene = () => {
  const { elements, canvasWidth, canvasHeight } = useFloorPlan();
  const { camera, scene } = useThree();
  
  // Center the camera based on canvas dimensions
  useEffect(() => {
    // Set a better initial camera position
    camera.position.set(canvasWidth / 2, canvasWidth / 3, canvasHeight / 1.5);
    camera.lookAt(canvasWidth / 2, 0, canvasHeight / 2);
    
    // Add a subtle ambient light color
    scene.background = new THREE.Color('#f0f0f0');
    
    // Add fog for depth perception
    scene.fog = new THREE.Fog('#f0f0f0', canvasWidth, canvasWidth * 2);
    
    return () => {
      scene.fog = null;
    };
  }, [camera, scene, canvasWidth, canvasHeight]);
  
  // Calculate rotation for doors and windows based on nearby walls
  const getElementRotation = (element: any) => {
    // Find the closest wall to this element
    const walls = elements.filter(el => 
      el.type === 'wall' && el.x2 !== undefined && el.y2 !== undefined
    );
    
    if (walls.length === 0) return 0;
    
    // Find the closest wall
    let closestWall = null;
    let minDistance = Infinity;
    
    for (const wall of walls) {
      // Calculate distance from point to line segment
      const x1 = wall.x1;
      const y1 = wall.y1;
      const x2 = wall.x2!;
      const y2 = wall.y2!;
      const x0 = element.x1;
      const y0 = element.y1;
      
      const A = x0 - x1;
      const B = y0 - y1;
      const C = x2 - x1;
      const D = y2 - y1;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;
      
      let xx, yy;
      
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
      
      const dx = x0 - xx;
      const dy = y0 - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = wall;
      }
    }
    
    if (closestWall && minDistance < 30) {
      // Calculate wall angle
      const angle = Math.atan2(
        closestWall.y2! - closestWall.y1,
        closestWall.x2! - closestWall.x1
      );
      return angle;
    }
    
    return 0;
  };
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[canvasWidth, canvasWidth / 2, canvasHeight]} intensity={0.8} castShadow />
      <directionalLight position={[-canvasWidth, canvasWidth / 2, -canvasHeight]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.7]} />
      
      {/* Floor */}
      <Floor width={canvasWidth} height={canvasHeight} />
      
      {/* Walls */}
      {elements
        .filter((element) => element.type === 'wall' && element.x2 !== undefined && element.y2 !== undefined)
        .map((wall) => (
          <Wall
            key={wall.id}
            start={[wall.x1, wall.y1]}
            end={[wall.x2!, wall.y2!]}
          />
        ))}
      
      {/* Doors */}
      {elements
        .filter((element) => element.type === 'door')
        .map((door) => (
          <Door 
            key={door.id} 
            position={[door.x1, door.y1]} 
            rotation={getElementRotation(door)}
          />
        ))}
      
      {/* Windows */}
      {elements
        .filter((element) => element.type === 'window')
        .map((window) => (
          <Window 
            key={window.id} 
            position={[window.x1, window.y1]} 
            rotation={getElementRotation(window)}
          />
        ))}
      
      <OrbitControls 
        target={[canvasWidth / 2, 0, canvasHeight / 2]} 
        enableDamping 
        dampingFactor={0.1}
        minDistance={10}
        maxDistance={canvasWidth * 1.5}
      />
    </>
  );
};

const ThreeDViewer: React.FC = () => {
  const { elements } = useFloorPlan();
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="border rounded-lg overflow-hidden bg-gray-900" style={{ height: '600px' }}>
        <Canvas shadows camera={{ fov: 50, near: 0.1, far: 5000 }}>
          <Scene />
        </Canvas>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>
          3D View: Use mouse to rotate, scroll to zoom, and right-click to pan.
        </p>
        <p>
          Elements: {elements.filter(e => e.type === 'wall').length} walls, {elements.filter(e => e.type === 'door').length} doors, {elements.filter(e => e.type === 'window').length} windows
        </p>
      </div>
    </div>
  );
};

export default ThreeDViewer;