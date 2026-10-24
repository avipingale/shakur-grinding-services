import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

/** Keep GLB materials as authored; only fix shading/side. */
function prepareModel(root) {
    root.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.geometry && !child.geometry.getAttribute("normal")) {
            child.geometry.computeVertexNormals();
        }
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(function (mat) {
            if (!mat) return;
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
        });
    });
}

function initClampViewer(canvas) {
    const stage = canvas.parentElement;
    const modelUrl = canvas.getAttribute("data-model");
    if (!modelUrl || !stage) return;

    const note = stage.querySelector(".model-note");
    function setNote(text) {
        if (note) note.textContent = text;
    }

    try {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0xf2f5fa, 1);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 200);
        const target = new THREE.Vector3(0, 0, 0);
        let yaw = 0.75;
        let pitch = 0.28;
        let dist = 2.8;

        scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c3d8, 1.2));
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 1);
        fill.position.set(-5, 2, 2);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0xe8eef8, 0.95);
        rim.position.set(0, 3, -6);
        scene.add(rim);

        const floor = new THREE.Mesh(
            new THREE.CircleGeometry(1.6, 72),
            new THREE.MeshStandardMaterial({ color: 0xe4eaf3, roughness: 1, metalness: 0 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.01;
        scene.add(floor);

        function placeCamera() {
            const cp = Math.cos(pitch);
            camera.position.set(
                target.x + dist * cp * Math.sin(yaw),
                target.y + dist * Math.sin(pitch),
                target.z + dist * cp * Math.cos(yaw)
            );
            camera.lookAt(target);
        }

        function fit() {
            const width = Math.max(stage.clientWidth || 0, 280);
            const height = Math.max(stage.clientHeight || 0, 260);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        function frameObject(object) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            object.scale.setScalar(1.7 / maxDim);
            const boxed = new THREE.Box3().setFromObject(object);
            object.position.sub(boxed.getCenter(new THREE.Vector3()));
            object.position.y -= boxed.min.y;
            const framed = new THREE.Box3().setFromObject(object);
            const framedSize = framed.getSize(new THREE.Vector3());
            target.copy(framed.getCenter(new THREE.Vector3()));
            floor.position.y = framed.min.y;
            dist = Math.max(1.6, Math.min(8, Math.max(framedSize.x, framedSize.y, framedSize.z) * 2.15));
        }

        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let spin = 0.005;

        canvas.style.touchAction = "none";
        canvas.addEventListener("pointerdown", function (event) {
            dragging = true;
            spin = 0;
            lastX = event.clientX;
            lastY = event.clientY;
            canvas.setPointerCapture(event.pointerId);
        });
        canvas.addEventListener("pointermove", function (event) {
            if (!dragging) return;
            yaw -= (event.clientX - lastX) * 0.008;
            pitch = Math.max(-0.2, Math.min(1.15, pitch + (event.clientY - lastY) * 0.006));
            lastX = event.clientX;
            lastY = event.clientY;
        });
        canvas.addEventListener("pointerup", function () { dragging = false; });
        canvas.addEventListener("pointercancel", function () { dragging = false; });
        canvas.addEventListener("wheel", function (event) {
            event.preventDefault();
            dist = Math.max(0.9, Math.min(12, dist + event.deltaY * 0.004));
        }, { passive: false });

        fit();
        window.addEventListener("resize", fit);
        setNote("Loading 3D…");

        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            function (gltf) {
                const modelRoot = gltf.scene;
                prepareModel(modelRoot);
                scene.add(modelRoot);
                frameObject(modelRoot);
                fit();
                stage.classList.add("has-model");
                setNote("Drag to rotate · scroll to zoom");
            },
            undefined,
            function (err) {
                console.error("Easy Clamp 3D load failed:", modelUrl, err);
                canvas.hidden = true;
                setNote("3D unavailable — photo shown");
            }
        );

        renderer.setAnimationLoop(function () {
            if (!dragging) yaw += spin;
            placeCamera();
            renderer.render(scene, camera);
        });
    } catch (error) {
        console.error("Easy Clamp 3D init failed:", error);
        canvas.hidden = true;
        setNote("3D unavailable — photo shown");
    }
}

function boot() {
    document.querySelectorAll("canvas[data-model]").forEach(initClampViewer);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
