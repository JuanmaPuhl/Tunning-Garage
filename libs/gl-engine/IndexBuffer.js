import { Buffer } from "./Buffer.js"

export class IndexBuffer extends Buffer {
    constructor(gl, data, dataType = gl.UNSIGNED_INT) {
        super(gl, gl.ELEMENT_ARRAY_BUFFER, data, dataType)
    }

    loadData(data, dataType = this.gl.UNSIGNED_INT) {
        super.loadData(data, dataType)
    }
}
