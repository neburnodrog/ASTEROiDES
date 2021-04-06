// import p5 from 'p5';

export class Ship {
    constructor() {
        // image props
        this.image;
        this.shipLength = 50;
        this.shipWidth = 30;

        // position
        this.posX = 400;
        this.posY = 400;

        // velocity & acceleration
        this.velX = 0;
        this.velY = 0;
        this.acceleration = 0; // only when arrow_up is pressed

        // directions (of ship = where its pointing / of movement = where its flying)
        this.directionOfMovement = 0;
        this.directionOfShip = 0; // expressed in radians
    }

    rotateShip(p5) {
        if (p5.keyIsDown(39)) {
            console.log(this.directionOfShip)
            this.directionOfShip += Math.PI / 60;
        } else if (p5.keyIsDown(37)) {
            console.log(this.directionOfShip)
            this.directionOfShip -= Math.PI / 60;
        }

        if (this.directionOfShip > Math.PI * 2) this.directionOfShip %= Math.PI;
        if (this.directionOfShip < 0) this.directionOfShip = Math.PI * 2;
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
        if (p5.keyIsDown(38) && this.acceleration < 1) {
            this.acceleration += .01;
        } else {
            this.acceleration = 0;
        }
    }

    calcVelocity() {
        this.velX += this.acceleration * Math.cos(this.directionOfShip);
        this.velY += this.acceleration * Math.sin(this.directionOfShip);
    }

    calcDirectionOfMovement() {
        this.directionOfMovement = Math.asin(this.velY / Math.sqrt(this.velY ** 2 + this.velX ** 2));
    }

    calcMovement() {
        this.posX += this.velX;
        this.posY += this.velY;
    }

    calcOverflow(p5) {
        let width = p5.width;
        let height = p5.height;

        if (this.posY > height) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY);
            let newX = (height / Math.sin(this.directionOfMovement)) * Math.cos(this.directionOfMovement);
            this.posY %= height;
            this.posX -= newX;
            console.log("New position: ", this.posX, this.posY);
        }

        if (this.posY < 0) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            let newX = (height / Math.sin(this.directionOfMovement)) * Math.cos(this.directionOfMovement);
            this.posY += height;
            this.posX += newX;
            console.log("New position: ", this.posX, this.posY);
        }

        if (this.posX > width) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            let newY = (width / Math.cos(this.directionOfMovement)) * Math.sin(this.directionOfMovement);
            this.posX %= width;
            this.posY -= newY;
            console.log("New position: ", this.posX, this.posY)
        }

        if (this.posX < 0) {
            console.log("Overflowing, now the position is: ", this.posX, this.posY)
            let newY = (width / Math.cos(this.directionOfMovement)) * Math.sin(this.directionOfMovement);
            this.posX += width;
            this.posY += newY;
            console.log("New position: ", this.posX, this.posY)
        };
    }

    draw(p5) {
        this.rotateShip(p5);
        this.accelerate(p5);
        this.hyperspace(p5);
        this.calcVelocity();
        this.calcDirectionOfMovemen();
        this.calcMovement();
        this.calcOverflow(p5);


        p5.push()
        p5.translate(this.posX, this.posY);
        p5.rotate(this.directionOfShip);
        p5.image(this.image, 0, 0, this.shipLength, this.shipWidth)
        p5.pop();
    }
}