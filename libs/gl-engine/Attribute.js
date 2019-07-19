export class Attribute {
    constructor(gl, name, type, location) {
        this.gl = gl
        this.name = name
        this.type = type
        this.enabled = false
        this.location = location
        this.numberOfComponents = this.getNumberOfComponentsForType(gl, type) // e.g. float tiene 1 componente, vec2 tiene 2, vec3 tiene 3, etc
    }

    pointToVertexBuffer(buffer, normalized = false, stride = 0, offset = 0) {
        buffer.bind()
        this.gl.vertexAttribPointer(this.location, this.numberOfComponents, buffer.dataType, normalized, stride, offset)
        buffer.unbind()
    }

    enable() {
        this.gl.enableVertexAttribArray(this.location)
        this.enabled = true
    }

    disable() {
        this.gl.disableVertexAttribArray(this.location)
        this.enabled = false
    }

    getNumberOfComponentsForType(gl, type) {
        switch (type) {
            case (gl.FLOAT):
                return 1
            case (gl.FLOAT_VEC2):
                return 2
            case (gl.FLOAT_VEC3):
                return 3
            default:
                console.error("Unsupported attribute type")
                return
        }
    }
}
