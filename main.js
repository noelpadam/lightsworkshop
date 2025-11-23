import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'; // Not used, but kept in imports for completeness
import $ from "jquery";

// --- Configuration Constants ---
const PLANE_SIZE = 40;
const SPHERE_RADIUS = 3;
const SPHERE_DIVISIONS_W = 32;
const SPHERE_DIVISIONS_H = 16;
const CHEEKER_TEXTURE_URL = 'https://threejs.org/manual/examples/resources/images/checker.png';
const ORBIT_RADIUS = 27; // Radius for the circular slider UI

// --- Shared Variables for Scene/Light ---
let scene;
let camera;
let renderer;
let light;
let lightColor = 0xFFFFFF;
let lightIntensity = 1;

// --- Helper Class (from original code) ---
/**
 * Helper to link THREE.Color properties to the dat.GUI color controller.
 * Although dat.GUI is commented out, this is a useful pattern to keep.
 */
class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

// --- THREE.js Setup Functions ---

/**
 * Initializes the Renderer, Camera, Scene, and Controls.
 */
function initThree(canvas) {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
}

/**
 * Creates and adds the ground plane to the scene.
 */
function createPlane() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(CHEEKER_TEXTURE_URL);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = PLANE_SIZE / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
}

/**
 * Creates and adds the cube (currently commented out in original).
 */
function createCube() {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    // scene.add( mesh ); // Original code had this commented out
}

/**
 * Creates and adds the sphere to the scene.
 */
function createSphere() {
    const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_DIVISIONS_W, SPHERE_DIVISIONS_H);
    const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-SPHERE_RADIUS - 1, SPHERE_RADIUS + 2, 0);
    scene.add(mesh);
}

/**
 * Initializes the Ambient Light.
 */
function initLight() {
    light = new THREE.AmbientLight(lightColor, lightIntensity);
    scene.add(light);
}

/**
 * Updates the light with current color and intensity, removing the old one first.
 */
function updateLight() {
    scene.remove(light);
    light = new THREE.AmbientLight(lightColor, lightIntensity);
    scene.add(light);
}

// --- Rendering Loop Functions ---

/**
 * Checks if the renderer needs resizing and adjusts if necessary.
 * @param {THREE.WebGLRenderer} renderer The three.js renderer instance.
 * @returns {boolean} True if the renderer was resized, false otherwise.
 */
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

/**
 * The main render loop function.
 */
function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// --- UI Control Functions (jQuery) ---

/**
 * Maps an angle (in degrees) to a light color and updates the UI elements.
 * @param {number} deg The current angle in degrees (0-360).
 */
function setLightAndUIFromAngle(deg) {
    const $container = $('#circle');
    let colorHex = 0xFFFFFF;
    let cssColor = 'white';
    let boxShadowColor = 'white';

    // The original code uses a series of if/else if blocks to map angle to color.
    if (deg < 40) {
        colorHex = 0xFFFFFF; // White
        cssColor = 'white';
    } else if (deg < 80) {
        colorHex = 0xadd8e6; // Light Blue
        cssColor = 'lightblue';
        boxShadowColor = 'lightblue';
    } else if (deg < 120) {
        colorHex = 0xF78787; // Light Red/Coral (Approximation of F78787)
        cssColor = 'red';
        boxShadowColor = 'red';
    } else if (deg < 160) {
        colorHex = 0x90EE90; // Light Green
        cssColor = 'lightgreen';
        boxShadowColor = 'lightgreen';
    } else if (deg < 200) {
        colorHex = 0xffff00; // Yellow
        cssColor = 'yellow';
        boxShadowColor = 'yellow';
    } else if (deg < 240) {
        colorHex = 0xffa500; // Orange
        cssColor = 'orange';
        boxShadowColor = 'orange';
    } else if (deg < 280) {
        // Original code used 0xffa500 and 'brown ' for 240-280, which is inconsistent.
        // Keeping original logic for now, using a brown hex for THREE.js light.
        colorHex = 0xa52a2a; // Brown
        cssColor = 'brown';
        boxShadowColor = 'brown';
    } else if (deg < 320) {
        colorHex = 0xa52a2a; // Brown
        cssColor = 'purple';
        boxShadowColor = 'purple';
    } else if (deg <= 360) {
        colorHex = 0xcc6699; // Pink
        cssColor = '#cc6699';
        boxShadowColor = 'pink';
    }

    // Update THREE.js Light
    lightColor = colorHex;
    updateLight();

    // Update UI elements
    $container.css({
        'background-color': cssColor,
        'box-shadow': `1px 1px 5px 3px ${boxShadowColor}`
    });
    $('input[name="angle"]').val(Math.ceil(deg));
}

/**
 * Handles the logic for positioning the circular slider UI element.
 * @param {number} deg The current angle in degrees.
 */
function positionSlider(deg) {
    const $slider = $('#slider');
    const sliderW2 = $slider.width() / 2;
    const sliderH2 = $slider.height() / 2;

    // Convert degrees to radians
    const rad = deg * Math.PI / 180;

    // Calculate (X, Y) position on the circle
    const X = Math.round(ORBIT_RADIUS * Math.sin(rad));
    const Y = Math.round(ORBIT_RADIUS * -Math.cos(rad)); // Y is inverted for typical canvas/screen coordinates (0,0 is top-left)

    // Position the slider element, adjusting for its center point
    $slider.css({
        left: X + ORBIT_RADIUS - sliderW2,
        top: Y + ORBIT_RADIUS - sliderH2
    });

    // Apply rotation for aesthetic effect
    $slider.css({
        WebkitTransform: `rotate(${deg}deg)`,
        '-moz-transform': `rotate(${deg}deg)`
    });
}

/**
 * Initializes the circular UI control for color.
 */
function initColorControl() {
    const $circle = $('#circle');
    let deg = 0;
    let mdown = false;

    // Pre-calculate fixed positions/dimensions
    const elP = $circle.offset();
    const elPos = { x: elP.left, y: elP.top };

    // Initialize position and light color
    setLightAndUIFromAngle(deg);
    positionSlider(deg);

    // --- Automatic Color Rotation (Interval) ---
    setInterval(() => {
        deg = (deg + 1) % 360; // Increment and wrap around 360

        positionSlider(deg);
        setLightAndUIFromAngle(deg);
    }, 10);

    // --- Manual Color Control (Mouse Events) ---
    $circle
        .on("mousedown", function (e) {
            e.preventDefault(); // Prevent text selection
            mdown = true;
        })
        .on("mouseup", function (e) {
            mdown = false;
        })
        .on("mouseleave", function (e) {
            // Stop tracking mousemove if the mouse leaves the circle
            mdown = false;
        })
        .on("mousemove", function (e) {
            if (mdown) {
                // Mouse position relative to the circle's top-left corner
                const mPos = { x: e.clientX - elPos.x, y: e.clientY - elPos.y };

                // Calculate angle using atan2
                // (mPos.x - ORBIT_RADIUS) and (mPos.y - ORBIT_RADIUS) shift the origin to the center of the circle
                const atan = Math.atan2(mPos.x - ORBIT_RADIUS, mPos.y - ORBIT_RADIUS);

                // Convert radians to degrees (0-360 positive, clockwise from top)
                // -atan/(Math.PI/180) converts to degrees, + 180 shifts 0 degrees to the top
                deg = (-atan / (Math.PI / 180) + 180) % 360;

                positionSlider(deg);
                setLightAndUIFromAngle(deg);
            }
        });
}

/**
 * Initializes the intensity slider control.
 */
function initIntensityControl() {
    const intensitySlider = document.getElementById("lightintesity");

    if (intensitySlider) {
        intensitySlider.oninput = function () {
            // Read value (0-10 or similar, based on HTML range input), convert to intensity
            // Original logic: 1 + (sliderValue * 0.1) if sliderValue > 1, else sliderValue
            const sliderValue = parseInt(this.value, 10);
            let newIntensity = sliderValue;

            if (sliderValue !== 1) {
                newIntensity = 1 + (sliderValue * 0.1);
            }

            // Update shared state and THREE.js light
            lightIntensity = newIntensity;
            updateLight();
        };
    }
}

// --- Main Execution Function ---

function main() {
    const canvas = document.querySelector('#c');

    // 1. Setup Three.js environment
    initThree(canvas);

    // 2. Create Scene Objects
    createPlane();
    // createCube(); // Still commented out
    createSphere();

    // 3. Initialize Light
    // NOTE: The original code initializes light *twice* (once in a block, once before the slider setup).
    // The second initialization is kept here via initLight() as it is immediately followed by the UI logic.
    initLight();

    // 4. Initialize Controls (OrbitControls already done in initThree)
    // 5. Initialize UI Controls
    initColorControl();
    initIntensityControl();

    // 6. Start the render loop
    requestAnimationFrame(render);
}

// Execute the main function
main();