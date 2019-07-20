import { Program } from "./Program.js"

export class Material {
    constructor(program, affectedByLight,affectedByShadows, properties = {}) {
        this.program = program
        this.affectedByLight = affectedByLight
        this.properties = properties
        this.affectedByShadows = affectedByShadows;
    }
}
