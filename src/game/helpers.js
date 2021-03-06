export function randomInteger(a, b) {
    // random integer between a(included) & b(excluded).
    return Math.floor((Math.random() * (b - a))) + a;
}

export function drawPolygon(p5, x, y, radius, npoints) {
    let angle = p5.TWO_PI / npoints;
    p5.beginShape();
    for (let a = 0; a < p5.TWO_PI; a += angle) {
        let sx = x + p5.cos(a) * radius;
        let sy = y + p5.sin(a) * radius;
        p5.vertex(sx, sy);
    }
    p5.endShape(p5.CLOSE);
}

export function calcVelocityComponents(direction, speed) {
    // only calculated when a new Shot is instanciated.
    return {
        x: Math.cos(direction) * speed,
        y: Math.sin(direction) * speed,
    }
}

export function calcVectorValue(x, y) {
    // The absolute value of the vector is the hypotenuse of the x & y components (Pythagorean theorem)
    return Math.sqrt(y ** 2 + x ** 2);
}


export function findOutWidth() {
    return window.innerWidth && document.documentElement.clientWidth ?
        Math.min(window.innerWidth, document.documentElement.clientWidth) * 0.99
        : window.innerWidth * 0.99
        || document.documentElement.clientWidth * 0.99
        || document.getElementsByTagName('body')[0].clientWidth * 0.99
}

export function findOutHeight() {
    return window.innerHeight && document.documentElement.clientHeight ?
        Math.min(window.innerHeight, document.documentElement.clientHeight) * 0.99
        : window.innerHeight * 0.99
        || document.documentElement.clientHeight * 0.99
        || document.getElementsByTagName('body')[0].clientHeight * 0.99
}