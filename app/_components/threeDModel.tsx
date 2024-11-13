// import React, { Suspense, useEffect, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';

// function Model(props: any) {
//   const { scene } = useGLTF('/models/scene.gltf');
//   const [scrollY, setScrollY] = useState(0);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrollY(window.scrollY);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   useEffect(() => {
//     // Set initial rotation and position
//     scene.rotation.set(51, 0, 20); // Adjust initial rotation as needed
//     scene.position.set(0, 0, 0); // Adjust initial position as needed
//   }, [scene]);

//   useFrame(() => {
//     scene.rotation.y = scrollY * 0.005; // Adjust rotation speed
//     scene.position.y = -scrollY * 0.001; // Adjust position speed
//   });

//   return <primitive object={scene} {...props} />;
// }

// export default function ThreeDModel() {
//   return (
//     <div style={{ width: '90vh', height: '50vh' }}>
//       <Canvas>
//         <ambientLight intensity={0.8} />
//         <directionalLight position={[0, 5, 5]} intensity={1} />
//         <Suspense fallback={null}>
//           <Model scale={1} />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }