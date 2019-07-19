export class VertexArray {
    constructor(gl, program, vertexBuffers, indexBuffer) {
        this.gl = gl
        this.vertexArray = gl.createVertexArray()

        this.bind()
        this.pointAttributesToBuffersAndEnable(program.attributes, vertexBuffers)
        indexBuffer.bind()
        this.unbind()
    }

    bind() {
        this.gl.bindVertexArray(this.vertexArray)
    }

    unbind() {
        this.gl.bindVertexArray(null)
    }

    pointAttributesToBuffersAndEnable(attributes, vertexBuffers) {
        for (let name in attributes) {
            const attribute = attributes[name]
            const vertexBuffer = vertexBuffers[attribute.name]
            if (vertexBuffer !== undefined) {
                attribute.pointToVertexBuffer(vertexBuffer)
                attribute.enable()
            } else {
                console.error(`No buffer available for the ${attribute.name} attribute`)
            }
        }
    }
}
