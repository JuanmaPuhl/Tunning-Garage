export function toSpherical({ x, y, z }) {
    const radius = Math.sqrt(x * x + y * y + z * z) // distancia al origen
    const theta  = Math.atan(x / z)                 // angulo horizontal alrededor del eje y (partiendo del eje z positivo, en sentido anti-horario)
    const phi    = Math.acos(y / radius)            // angulo vertical desde el eje y positivo

    return { radius, theta, phi }
}

export function toCartesian({ radius, theta, phi }) {
    const x = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.cos(theta)

    return { x, y, z }
}

export function toDegrees(radians) {
    return radians * 180 / Math.PI
}

export function toRadians(degrees) {
    return degrees * Math.PI / 180
}

export function limitToRange(value, min, max) {
    return Math.max(Math.min(value, max), min)
}

export async function getFileContentsAsText(url) {
    const response = await fetch(url)
    const text     = await response.text()

    return text
}

export function loadImage(url) {
    // Retorna una "promesa" (Promise) que se cumple (o resuelve) una vez cargada la imagen
    const promise = new Promise( resolve => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.src = url
    } )

    return promise
}
