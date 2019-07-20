export class SceneLight {
    constructor(position = [2, 2, 2,1], color = [1, 1, 1],angle,direction=[0,-1,0,0], type = 1 ) {
        this.position = position
        this.color = color
        this.type = type;
        this.direction = direction;
        this.angle = angle;
    }
}
