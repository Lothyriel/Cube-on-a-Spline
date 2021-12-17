"use strict";
class Canvas {
    constructor(scene, camera, render) {
        this.scene = scene;
        this.camera = camera;
        this.render = render;
        this.entities = {};
        this.keys = {};
        this.up = new THREE.Vector3(1, 0, 0);
    }
    draw() {
        this.render.render(this.scene, this.camera);

        treatInputs();
        this.entities.car.draw();

        requestAnimationFrame(this.draw.bind(this));
    }
}

class Car {
    constructor(maxSpeed, curve, step) {
        this.maxSpeed = maxSpeed;
        this.curve = curve;
        this.counter = 0
        this.cube = this.createCube();
        this.step = step;
    }
    createCube() {
        let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        let cubeGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);

        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        canvas.scene.add(cube);
        return cube;
    }
    draw() {
        console.log(this.counter +" "+  this.cube.position.x + " " + this.cube.position.y);
        let point = this.curve.getPointAt(this.counter);
        this.cube.position.set(point.x, point.y, 0);
        this.adjustAngle()
    }
    adjustAngle() {
        let tangent = this.curve.getTangentAt(this.counter).normalize();
        tangent = new THREE.Vector3(tangent.x, tangent.y, 0);

        let axis = new THREE.Vector3(); 
        axis.crossVectors(canvas.up, tangent).normalize();

        let radians = Math.acos(canvas.up.dot(tangent));

        this.cube.quaternion.setFromAxisAngle(axis, radians);
    }
    move(step) {
        this.counter += step;
    }
    moveLeft() {
        if (this.counter - this.step < 0)
            return;

        this.move(-this.step);
    }
    moveRight() {
        if (this.counter + this.step > 1)
            return;
        this.move(this.step);
    }
}

function createCurve(precision) {
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    let originalPoints = [
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-0.5, 0.5, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, -0.5, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1.5, 0.5, 0),
        new THREE.Vector3(2, 0, 0)
    ];
    let curve = new THREE.SplineCurve(originalPoints);
    let points = curve.getPoints(precision);

    let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    let line = new THREE.Line(lineGeometry, lineMaterial);
    canvas.scene.add(line);

    return curve;
}

function drawInitialPoints(points) {
    let pointMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });

    for (let p of points) {
        let coord = [];
        coord.push(new THREE.Vector3(p.x, p.y, p.z));
        let pointGeometry = new THREE.BufferGeometry().setFromPoints(coord);
        let renderedPoint = new THREE.Points(pointGeometry, pointMaterial);
        canvas.scene.add(renderedPoint);
    }
}

function configCanvas() {
    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    let render = new THREE.WebGLRenderer();
    render.setSize(window.innerWidth, window.innerHeight);

    let canvasElement = render.domElement;
    document.body.appendChild(canvasElement);

    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    let lightPoint = new THREE.PointLight(0x888888);
    lightPoint.position.set(2, 2, 4);
    scene.add(lightPoint);

    let _ = new THREE.OrbitControls(camera, render.domElement);

    return new Canvas(scene, camera, render)
}

function configInputs() {
    document.onkeydown = function (evt) {
        canvas.keys[evt.key] = true;
    }
    document.onkeyup = function (evt) {
        canvas.keys[evt.key] = false;
    }
}

function treatInputs() {
    let car = canvas.entities.car;
    if (canvas.keys["ArrowLeft"])
        car.moveLeft();
    else if (canvas.keys["ArrowRight"])
        car.moveRight();
}

function main() {    
    var canvas = configCanvas();

    configInputs();

    let curve = createCurve(100);
    canvas.entities.curve = curve;

    canvas.entities.car = new Car(10, canvas.entities.curve, 0.01);

    drawInitialPoints(curve.points);

    canvas.draw();
}