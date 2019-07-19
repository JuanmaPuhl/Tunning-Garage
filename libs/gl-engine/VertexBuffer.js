import { Buffer } from "./Buffer.js"

export class VertexBuffer extends Buffer {
    constructor(gl, data, dataType = gl.FLOAT) {
        super(gl, gl.ARRAY_BUFFER, data, dataType)
    }

    loadData(data, dataType = this.gl.FLOAT) {
        super.loadData(data, dataType)
    }
}
