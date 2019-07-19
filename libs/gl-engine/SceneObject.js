import { VertexArray } from "./VertexArray.js"
import { mat4 } from "/libs/gl-matrix/index.js"

export class SceneObject {
    constructor(gl, geometry, material, textures,wireframe = false) {
        this.gl = gl
        this.material = material
        this.indexBuffer = wireframe ? geometry.indexBuffers.lines : geometry.indexBuffers.triangles
        this.vertexArray = new VertexArray(gl, material.program, geometry.vertexBuffers, this.indexBuffer)
        this.drawMode = wireframe ? gl.LINES : gl.TRIANGLES
        this.textures = textures
        this.modelMatrix     = mat4.create()
        this.modelViewMatrix = mat4.create()
        this.normalMatrix    = mat4.create()

        this.position = [0, 0, 0]
    }

    setPosition(x, y, z) {
        this.position = [x, y, z]
    }

    translateX(value) {
        this.position[0] += value
    }

    translateY(value) {
        this.position[1] += value
    }

    translateZ(value) {
        this.position[2] += value
    }

    updateModelMatrix() {
        mat4.fromTranslation(this.modelMatrix, this.position)
    }
}
