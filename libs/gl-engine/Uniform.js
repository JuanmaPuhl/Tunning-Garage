export class Uniform {
    constructor(gl, name, type, location) {
        this.gl = gl
        this.name = name
        this.type = type
        this.location = location
        this.setValue = this.getValueSetter(gl, type, location)
    }

    set value(value) {
        this.setValue(value)
    }

    getValueSetter(gl, type, location) {
        switch (type) {
            case (gl.SAMPLER_CUBE):
                return (value) => { gl.uniform1i(location, value) }
            case (gl.SAMPLER_2D):
                return (value) => { gl.uniform1i(location, value) }
            case (gl.FLOAT):
                return (value) => { gl.uniform1f(location, value) }
            case (gl.FLOAT_VEC2):
                return (value) => { gl.uniform2fv(location, value) }
            case (gl.FLOAT_VEC3):
                return (value) => { gl.uniform3fv(location, value) }
            case (gl.FLOAT_VEC4):
                return (value) => { gl.uniform4fv(location, value) }
            case (gl.FLOAT_MAT3):
                return (value) => { gl.uniformMatrix3fv(location, false, value) }
            case (gl.FLOAT_MAT4):
                return (value) => { gl.uniformMatrix4fv(location, false, value) }
            case(gl.INT):
                return (value) => { gl.uniform1i(location, value) }
            default:
                console.error("Unsupported uniform type")
                return () => {} // no-op
        }
    }
}
