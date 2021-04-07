import { Ship } from './ship';

directions = {
    ESE: Math.PI / 5,
    SSE: Math.PI / 3,
    SSW: Math.PI / 5 + Math.PI / 2,
    WSW: Math.PI / 3 + Math.PI / 2,
    WNW: Math.PI / 5 + Math.PI,
    NNW: Math.PI / 3 + Math.PI,
    NNE: Math.PI / 5 + Math.PI * 3 / 2,
    ENE: Math.PI / 3 + Math.PI * 3 / 2,
}

const p5 = {
    height: 800,
    width: 800,
}


test('ship overflow ESE', () => {
    let ship = new Ship()
    ship.angleOfMovement = directions.ESE;
    ship.posX = 801;
    ship.posY = 600;
})