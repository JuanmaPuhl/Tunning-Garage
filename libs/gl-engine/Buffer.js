export class Buffer {
    constructor(gl, type, data, dataType) {
        this.gl = gl
        this.type = type
        this.buffer = gl.createBuffer()

        this.bind()
        this.loadData(data, dataType)
        this.unbind()
    }

    bind() {
        this.gl.bindBuffer(this.type, this.buffer)
    }

    unbind() {
        this.gl.bindBuffer(this.type, null)
    }

    loadData(data, dataType) {
        let typedDataArray

        switch (dataType) {
            case (this.gl.UNSIGNED_SHORT):
                typedDataArray = new Uint16Array(data)
                break
            case (this.gl.UNSIGNED_INT):
                typedDataArray = new Uint32Array(data)
                break
            case (this.gl.FLOAT):
                typedDataArray = new Float32Array(data)
                break
            default:
                console.error("Unsupported buffer data type")
        }

        if (typedDataArray !== undefined) {
            this.gl.bufferData(this.type, typedDataArray, this.gl.STATIC_DRAW)
            this.dataType = dataType
            this.size = data.length
        }
    }
}
