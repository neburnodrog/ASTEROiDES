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

export function spaceOrEnterPressed(p5) {
    p5.keyPressed = () => {
        if (p5.keyCode === 32 || p5.keyCode === 13) {
            return true;
        }
    }
}

export function findOutWidth() {
    return window.innerWidth && document.documentElement.clientWidth ?
        Math.min(window.innerWidth, document.documentElement.clientWidth)
        : window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;
}

export function findOutHeight() {
    return window.innerHeight && document.documentElement.clientHeight ?
        Math.min(window.innerHeight, document.documentElement.clientHeight)
        : window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;
}