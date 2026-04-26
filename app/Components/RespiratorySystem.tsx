import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './RespiratorySystem.css';

interface Props {
    heartRate: number;
}

const RespiratorySystem: React.FC<Props> = ({ heartRate }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heartRateRef = useRef<number>(heartRate || 70);

    useEffect(() => {
        heartRateRef.current = heartRate || 70;
    }, [heartRate]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / Math.max(1, container.clientHeight),
            0.1,
            100
        );
        camera.position.set(4, 2, 5.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const geometries: THREE.BufferGeometry[] = [];
        const materials: THREE.Material[] = [];
        const track = <T extends THREE.BufferGeometry>(g: T): T => {
            geometries.push(g);
            return g;
        };
        const trackMat = <T extends THREE.Material>(m: T): T => {
            materials.push(m);
            return m;
        };

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        const pink = new THREE.PointLight(0xff69b4, 2);
        pink.position.set(3, 3, 3);
        scene.add(pink);
        const magenta = new THREE.PointLight(0xff1493, 1);
        magenta.position.set(-3, -2, 2);
        scene.add(magenta);

        // Torso — wireframe ghost cage
        const torsoGeom = track(new THREE.CapsuleGeometry(1.1, 2.8, 8, 16));
        const torsoMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff69b4,
                wireframe: true,
                transparent: true,
                opacity: 0.15,
            })
        );
        const torso = new THREE.Mesh(torsoGeom, torsoMat);
        scene.add(torso);

        // Lungs — filled sphere + wireframe overlay, both always visible
        const lungGeom = track(new THREE.SphereGeometry(0.52, 16, 16));
        const lungFillMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff69b4,
                wireframe: false,
                transparent: true,
                opacity: 0.25,
            })
        );
        const lungWireMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff1493,
                wireframe: true,
                transparent: true,
                opacity: 0.4,
            })
        );

        const leftLung = new THREE.Mesh(lungGeom, lungFillMat);
        leftLung.position.set(-0.75, 0.2, 0);
        scene.add(leftLung);
        const leftLungWire = new THREE.Mesh(lungGeom, lungWireMat);
        leftLungWire.position.copy(leftLung.position);
        scene.add(leftLungWire);

        const rightLung = new THREE.Mesh(lungGeom, lungFillMat);
        rightLung.position.set(0.75, 0.2, 0);
        scene.add(rightLung);
        const rightLungWire = new THREE.Mesh(lungGeom, lungWireMat);
        rightLungWire.position.copy(rightLung.position);
        scene.add(rightLungWire);

        // Heart — the hero object: solid glow + wireframe overlay
        const heartGeom = track(new THREE.SphereGeometry(0.32, 16, 16));
        const heartFillMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff1493,
                wireframe: false,
                transparent: true,
                opacity: 0.6,
            })
        );
        const heartWireMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff69b4,
                wireframe: true,
                transparent: true,
                opacity: 0.8,
            })
        );
        const heart = new THREE.Mesh(heartGeom, heartFillMat);
        heart.position.set(-0.15, -0.05, 0.3);
        scene.add(heart);
        const heartWire = new THREE.Mesh(heartGeom, heartWireMat);
        heartWire.position.copy(heart.position);
        scene.add(heartWire);

        // Trachea + bronchi — glowing solid pink tubes
        const tubeMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff1493,
                transparent: true,
                opacity: 0.7,
            })
        );

        const mainCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 2.2, 0),
            new THREE.Vector3(0, 1.4, 0),
            new THREE.Vector3(0, 0.8, 0),
        ]);
        const mainGeom = track(new THREE.TubeGeometry(mainCurve, 20, 0.08, 12, false));
        scene.add(new THREE.Mesh(mainGeom, tubeMat));

        const leftBronchusCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.8, 0),
            new THREE.Vector3(-0.3, 0.5, 0),
            new THREE.Vector3(-0.75, 0.3, 0),
        ]);
        const leftBronchusGeom = track(
            new THREE.TubeGeometry(leftBronchusCurve, 20, 0.06, 12, false)
        );
        scene.add(new THREE.Mesh(leftBronchusGeom, tubeMat));

        const rightBronchusCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.8, 0),
            new THREE.Vector3(0.3, 0.5, 0),
            new THREE.Vector3(0.75, 0.3, 0),
        ]);
        const rightBronchusGeom = track(
            new THREE.TubeGeometry(rightBronchusCurve, 20, 0.06, 12, false)
        );
        scene.add(new THREE.Mesh(rightBronchusGeom, tubeMat));

        // Diaphragm — flat disc below the lungs
        const diaphragmGeom = track(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32));
        const diaphragmFillMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff69b4,
                transparent: true,
                opacity: 0.2,
            })
        );
        const diaphragmWireMat = trackMat(
            new THREE.MeshBasicMaterial({
                color: 0xff69b4,
                wireframe: true,
                transparent: true,
                opacity: 0.35,
            })
        );
        const diaphragm = new THREE.Mesh(diaphragmGeom, diaphragmFillMat);
        diaphragm.position.set(0, -0.55, 0);
        scene.add(diaphragm);
        const diaphragmWire = new THREE.Mesh(diaphragmGeom, diaphragmWireMat);
        diaphragmWire.position.copy(diaphragm.position);
        scene.add(diaphragmWire);

        // Resize handling
        const resize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        // Animation loop
        let rafId = 0;
        const animate = () => {
            const time = Date.now() * 0.001;
            const hr = heartRateRef.current;

            const breathingSpeed = (hr / 60) * 1.2;
            const breathScale = 1 + Math.sin(time * breathingSpeed) * 0.13;
            leftLung.scale.set(breathScale, breathScale, breathScale);
            leftLungWire.scale.set(breathScale, breathScale, breathScale);
            rightLung.scale.set(breathScale, breathScale, breathScale);
            rightLungWire.scale.set(breathScale, breathScale, breathScale);

            const heartSpeed = (hr / 30) * 1.5;
            const heartScale = 1 + Math.sin(time * heartSpeed) * 0.12;
            heart.scale.set(heartScale, heartScale, heartScale);
            heartWire.scale.set(heartScale, heartScale, heartScale);

            const diaphragmY = -0.55 - Math.sin(time * breathingSpeed) * 0.06;
            diaphragm.position.y = diaphragmY;
            diaphragmWire.position.y = diaphragmY;

            scene.rotation.y = Math.sin(time * 0.15) * 0.2;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            geometries.forEach((g) => g.dispose());
            materials.forEach((m) => m.dispose());
            renderer.dispose();
        };
    }, []);

    return (
        <div className="respiratory-system">
            <div ref={containerRef} className="respiratory-canvas" />
        </div>
    );
};

export default RespiratorySystem;
