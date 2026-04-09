/**
 * SplineScene
 *
 * Purpose:
 * Renders a 3D Spline scene as an immersive fullscreen background element
 * using Three.js with an orthographic camera. The scene loads a remote
 * .splinecode asset, centers it, and applies a slow ambient rotation.
 *
 * Data dependencies:
 * - Remote Spline asset loaded via @splinetool/loader
 * - Three.js for rendering, camera, and scene management
 *
 * UX notes:
 * - The scene fills the viewport and sits behind page content
 * - A slow Y-axis rotation creates subtle liveliness without distraction
 * - Pixel ratio is capped at 2 to balance quality vs. GPU cost on retina displays
 *
 * Domain notes:
 * - The orthographic camera prevents perspective distortion, keeping the
 *   3D model's proportions stable regardless of viewport size
 * - PMREMGenerator creates an environment map for physically-based material
 *   reflections even though the env scene is minimal
 */

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import SplineLoader from "@splinetool/loader";

const SPLINE_SCENE_URL =
  "https://prod.spline.design/MqYh40jd0B1cYnN2/scene.splinecode";

/** Initial scale factor applied to the loaded model */
const MODEL_SCALE = 1.5;

/** Degrees of Z / Y tilt applied once after load */
const TILT_Z_DEG = -12;
const TILT_Y_DEG = -40;

/** Continuous rotation speed (radians per frame) */
const ROTATION_SPEED = 0.001;

/**
 * Renders the fullscreen 3D Spline background.
 *
 * Behavior:
 * - Sets up a Three.js renderer with an orthographic camera sized to the container
 * - Loads the remote Spline scene, centers it, and offsets it toward the bottom-right
 * - Runs a requestAnimationFrame loop with slow Y rotation
 * - Handles window resize to keep the camera and renderer in sync
 *
 * Fallback behavior:
 * - Shows an empty transparent canvas until the model finishes loading
 * - Cleans up all Three.js resources (renderer, env map, PMREM) on unmount
 */
export default function SplineScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -50000,
      10000
    );
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);

    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // Environment map for PBR material reflections on the Spline model
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromScene(new THREE.Scene()).texture;
    scene.environment = envMap;

    const loader = new SplineLoader();
    let splineScene: THREE.Object3D | null = null;

    loader.load(SPLINE_SCENE_URL, (loadedScene) => {
      splineScene = loadedScene;

      const boundingBox = new THREE.Box3().setFromObject(loadedScene);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      loadedScene.position.sub(center);

      pivotGroup.add(loadedScene);
      pivotGroup.scale.setScalar(MODEL_SCALE);
      pivotGroup.rotation.z = THREE.MathUtils.degToRad(TILT_Z_DEG);
      pivotGroup.rotation.y = THREE.MathUtils.degToRad(TILT_Y_DEG);

      // Offset toward bottom-right so the model doesn't occlude center content
      pivotGroup.position.set(width * 0.2, -height * 0.05, 0);
    });

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.left = w / -2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = h / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    renderer.setAnimationLoop(() => {
      pivotGroup.rotation.y += ROTATION_SPEED;
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.setAnimationLoop(null);

      if (splineScene) {
        pivotGroup.remove(splineScene);
      }

      envMap.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-screen w-full" />;
}
