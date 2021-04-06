// import p5 from 'p5';

export class Ship {
    constructor() {
        this.image;
        this.posX = 400;
        this.posY = 400;
        this.shipLength = 50;
        this.shipWidth = 30;
        this.velX = 0;
        this.velY = 0;
        this.acc = 0; // only when arrow_up is pressed
        this.dir = 0; // expressed in radians
    }

    rotateShip(p5) {
        if (p5.keyIsDown(39)) {
            console.log(this.dir)
            this.dir += Math.PI / 60;
        } else if (p5.keyIsDown(37)) {
            console.log(this.dir)
            this.dir -= Math.PI / 60;
        }

        if (this.dir > Math.PI * 2) this.dir %= Math.PI;
        if (this.dir < 0) this.dir = Math.PI * 2;
    }

    hyperspace(p5) {
        if (p5.keyIsDown(40)) {
            console.log('ready for hyperspace!')
            // for now its stop
            this.velX = 0;
            this.velY = 0;
        }
    }

    accelerate(p5) {
        if (p5.keyIsDown(38) && this.acc < 1) {
            this.acc += .01;
        } else {
            this.acc = 0;
        }
    }

    calcVelocity() {
        this.velX += this.acc * Math.cos(this.dir);
        this.velY += this.acc * Math.sin(this.dir);
    }

    calcMovement() {
        this.posX += this.velX;
        this.posY += this.velY;
    }

    calcOverflow(p5) {
        let width = p5.width;
        let height = p5.height;

        if (this.posY > height) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)

            let hypo = 800 / Math.cos(this.dir);
            let newX = hypo * Math.sin(this.dir);
            this.posY %= height;
            this.posX += newX;

            // this.posY %= height;
            // this.posX -= Math.tan(this.direction - p5.PI / 2) * height;
            // console.log("New position: ", this.posX, this.posY)
        }

        if (this.posY < 0) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            this.posY += height;
            this.posX += Math.tan(this.dir) * height;
            console.log("New position: ", this.posX, this.posY)
        }

        if (this.posX > width) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            this.posX %= width;
            this.posY -= Math.tan(this.dir) * width;
            console.log("New position: ", this.posX, this.posY)
        }

        if (this.posX < 0) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            this.posX += width;
            this.posY += Math.tan(this.dir) * width;
            console.log("New position: ", this.posX, this.posY)
        };
    }

    draw(p5) {
        this.rotateShip(p5);
        this.accelerate(p5);
        this.hyperspace(p5);
        this.calcVelocity();
        this.calcMovement();
        this.calcOverflow(p5);


        p5.push()
        p5.translate(this.posX, this.posY);
        p5.rotate(this.dir);
        p5.image(this.image, 0, 0, this.shipLength, this.shipWidth)
        p5.pop();
    }
}