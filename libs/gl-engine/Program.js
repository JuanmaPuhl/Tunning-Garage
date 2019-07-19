import { Uniform } from "./Uniform.js"
import { Attribute } from "./Attribute.js"

export class Program {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl
        this.program = this.createProgram(gl, vertexShaderSource, fragmentShaderSource)
        this.uniforms = this.getActiveUniforms(gl, this.program)
        this.attributes = this.getActiveAttributes(gl, this.program)
    }

    use() {
        this.gl.useProgram(this.program)
    }

    setUniformValue(name, value) {
        const uniform = this.uniforms[name]
        if (uniform !== undefined) uniform.value = value
    }

    getActiveUniforms(gl, program) {
        const uniforms = {}
        const uniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)

        for (let uniformIndex = 0; uniformIndex < uniformsCount; uniformIndex ++) {
            const uniformInfo = gl.getActiveUniform(program, uniformIndex)
            const { name, type } = uniformInfo
            const location = gl.getUniformLocation(program, name)
            uniforms[name] = new Uniform(gl, name, type, location)
        }

        return uniforms
    }

    getActiveAttributes(gl, program) {
        const attributes = {}
        const attributesCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

        for (let attributeIndex = 0; attributeIndex < attributesCount; attributeIndex ++) {
            const attributeInfo = gl.getActiveAttrib(program, attributeIndex)
            const { name, type } = attributeInfo
            const location = gl.getAttribLocation(program, name)
            attributes[name] = new Attribute(gl, name, type, location)
        }

        return attributes
    }

    createProgram(gl, vertexShaderSource, fragmentShaderSource) {
        // Creamos shaders de vertices y fragmentos
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

        // Creamos el programa a partir de los shaders
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)

        // Y chequeamos que el programa se haya creado con exito
        const linkedSuccessfully = gl.getProgramParameter(program, gl.LINK_STATUS)

        if ( ! linkedSuccessfully ) {
            // Obtenemos el log generado al intentar crear el program y generamos excepcion
            const programLog = gl.getProgramInfoLog(program)
            throw new ProgramLinkError("\n" + programLog)
        }

        return program
    }

    createShader(gl, type, sourceCode) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, sourceCode)
        gl.compileShader(shader)

        // Chequeamos que el shader haya compilado con exito
        const compiledSuccessfully = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

        if (!compiledSuccessfully) {
            // Obtenemos el log generado por el compilador de shaders y generamos excepcion
            const shaderLog = gl.getShaderInfoLog(shader)
            if (type === gl.VERTEX_SHADER) {
                throw new VertexShaderCompilationError("\n" + shaderLog)
            } else {
                throw new FragmentShaderCompilationError("\n" + shaderLog)
            }
        }

        return shader
    }
}

// Definicion de excepciones

class VertexShaderCompilationError extends Error {
    constructor(message) {
        super(message)
        this.name = "Vertex Shader Compilation Error"
    }
}

class FragmentShaderCompilationError extends Error {
    constructor(message) {
        super(message)
        this.name = "Fragment Shader Compilation Error"
    }
}

class ProgramLinkError extends Error {
    constructor(message) {
        super(message)
        this.name = "Program Link Error"
    }
}
