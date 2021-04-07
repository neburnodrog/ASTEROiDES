


export const calcOverflowedPosition = (p5, posX, posY, directionOfMovement) => {
    if (posY > p5.height) {
        console.log("Overflowing, now the position is: ", posX, posY);

        let differenceOfX = (p5.height / Math.sin(directionOfMovement)) * Math.cos(directionOfMovement);

        const newY = posY % p5.height;
        const newX = posX - differenceOfX;

        console.log("New position: ", posX, posY);

        return [newX, newY];
    }

    if (posY < 0) {
        console.log("Overflowing, now the position is: ", posX, posY)

        let differenceOfX = (p5.height / Math.sin(directionOfMovement)) * Math.cos(directionOfMovement);

        const newY = posY + p5.height;
        const newX = posX + differenceOfX;

        console.log("New position: ", posX, posY);

        return [newX, newY];
    }

    if (posX > p5.width) {
        console.log("Overflowing, now the position is: ", posX, posY)

        let differenceOfY = (p5.width / Math.cos(directionOfMovement)) * Math.sin(directionOfMovement);

        const newX = posX % p5.width;
        const newY = posY - differenceOfY;

        console.log("New position: ", posX, posY)

        return [newX, newY];
    }

    if (posX < 0) {
        console.log("Overflowing, now the position is: ", posX, posY)

        let differenceOfY = (p5.width / Math.cos(directionOfMovement)) * Math.sin(directionOfMovement);

        const newX = posX + p5.width;
        const newY = posY - differenceOfY;

        console.log("New position: ", posX, posY)

        return [newX, newY];
    }

    return [posX, posY];
}