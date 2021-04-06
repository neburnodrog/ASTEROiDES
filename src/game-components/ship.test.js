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

test('ship overflow', () => {
    let ship = new Ship()
    ship.directionOfMovement
})