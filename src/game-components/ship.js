// import p5 from 'p5';

export class Ship {
    constructor() {
        this.image;
        this.posX = 500;
        this.posY = 400;
        this.width = 50;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.acceleration = 0; // only when arrow_up is pressed
        this.direction = 0; // expressed in radians
    }

    rotateShip(p5) {
        if (p5.keyIsDown(39)) {
            this.direction = this.direction - (p5.PI / 60);
            if (this.direction > 6.2832) this.direction = 0;
        } else if (p5.keyIsDown(37)) {
            this.direction = (this.direction + (p5.PI / 60));
            if (this.direction > 6.2832) this.direction = 0;
        }
    }

    hyperspace(p5) {
        if (p5.keyIsDown(40)) {
            console.log('ready for hyperspace!')
        }
    }

    accelerate(p5) {
        if (p5.keyIsDown(38) && this.acceleration < 1) {
            this.acceleration += .1;
        } else {
            this.acceleration = 0;
        }
    }

    calcVelocity() {
        this.velocityX += this.acceleration * Math.cos(this.direction);
        this.velocityY += this.acceleration * Math.sin(this.direction)
    }

    calcMovement() {
        console.log(this.posX, this.posY, this.speed, this.direction,)
        this.posX += this.velocityX;
        this.posY += this.velocityY;
    }

    calcOverflow(p5) {
        //     if (this.posY > p5.height) {
        //         this.posY = 0;
        //         this.posX = this.direction + p5.PI
        //     }
        //     if (this.posY < 0) this.posY = p5.height;
        //     if (this.posX > p5.width) this.posX = 0;
        //     if (this.posX < 0) this.posX = p5.width;
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
        p5.rotate(this.direction);
        p5.image(this.image, 0, 0, this.width, this.height)
        p5.pop();
    }
}