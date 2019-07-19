export async function parse(objFileUrl) {
    const response = await fetch(objFileUrl)
    const objData  = await response.text()

    // Obtenemos las posiciones de los vertices, las coordenadas de texturas, normales, etc que conforman al modelo

    const positions = []            // elementos "v" : [[x, y, z], [x, y, z], ...]
    const textureCoordinates = []   // elementos "vt": [[s, t], [s, t], ...]
    const normals = []              // elementos "vn": [[x, y, z], [x, y, z], ...]

    const vertices = []             // info de cada vertice, i.e. indices a los arreglos de posiciones, coordenadas de textura y normales ("2/9/1 1/7/3 ..." -> [[1, 8, 0], [0, 6, 2], ...])
    const verticesIndex = new Map() // mapeo de grupos "v/vt/vn" a su indice en el arreglo de vertices (para acceso rapido)
    const faces = []                // grupos de indices de los vertices que forman cada cara [[v1, v2, v3], [v2, v3, v4], ...]

    const lines = objData.split("\n")

    for ( let line of lines ) {
        const lineElements = line.split(" ")        // "v 1.00 2.00 3.00" -> ["v", "1.00", "2.00", "3.00"]
        const firstElement = lineElements.shift()   // ["v", "1.00", "2.00", "3.00"] -> ["1.00", "1.00", "1.00"]

        switch (firstElement) {
            case "v":
                positions.push(lineElements.map(element => parseFloat(element)))
                break
            case "vt":
                textureCoordinates.push(lineElements.map(element => parseFloat(element)))
                break
            case "vn":
                normals.push(lineElements.map(element => parseFloat(element)))
                break
            case "f":
                const faceVertices = []

                for(let vertexString of lineElements) {
                    let vertexIndex = verticesIndex.get(vertexString)

                    if (vertexIndex === undefined) {
                        const vertex = vertexString.split("/").map(element => parseInt(element) - 1)
                        vertices.push( vertex )
                        vertexIndex = vertices.length - 1
                        verticesIndex.set(vertexString, vertexIndex)
                    }

                    faceVertices.push(vertexIndex)
                }

                faces.push(faceVertices)
                break
        }
    }

    // Calculo de tangentes

    const tangents = []

    if (positions.length && normals.length && textureCoordinates.length) {
        for (let faceVertices of faces) {
            // Indices a cada vertice en el arreglo de vertices
            const [v1Index, v2Index, v3Index] = faceVertices

            // Extraemos la info de los tres vertices de la cara (cada uno un arreglo [posIndex, texCoordIndex, normalIndex])
            const v1 = vertices[v1Index]
            const v2 = vertices[v2Index]
            const v3 = vertices[v3Index]

            // Posicion de c/vertice
            const p1 = positions[v1[0]] // p1 = [x, y, z]
            const p2 = positions[v2[0]]
            const p3 = positions[v3[0]]

            // Coordenadas de textura de c/vertice
            const tc1 = textureCoordinates[v1[1]] // tc1 = [s, t]
            const tc2 = textureCoordinates[v2[1]]
            const tc3 = textureCoordinates[v3[1]]

            // Normales de c/vertice
            const n1 = normals[v1[2]] // n1 = [x, y, z]
            const n2 = normals[v2[2]]
            const n3 = normals[v3[2]]

            // Formamos dos de los tres lados del triangulo, con las posiciones de los vertices 1,2 y 1,3
            const edge1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
            const edge2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]]

            // Calculamos la diferencia sobre el eje 's' entre las coordenadas de texturas de esos pares de vertices
            const deltaS1 = tc2[0] - tc1[0]
            const deltaS2 = tc3[0] - tc1[0]

            // Sobre el eje 't'
            const deltaT1 = tc2[1] - tc1[1]
            const deltaT2 = tc3[1] - tc1[1]

            // Calculamos el vector tangente
            const k = 1 / (deltaS1 * deltaT2 - deltaS2 * deltaT1)
            const tangent = [
                k * (deltaT2 * edge1[0] - deltaT1 * edge2[0]),  // componente x de la tengente
                k * (deltaT2 * edge1[1] - deltaT1 * edge2[1]),  // y
                k * (deltaT2 * edge1[2] - deltaT1 * edge2[2])   // z
            ]

            // Lo normalizamos
            normalizeVector(tangent)

            // Y asociamos los tres vertices del triangulo a la tangente calculada (el vertice con el indice N tiene su tangente en tangents[N])
            tangents[v1Index] = tangent
            tangents[v2Index] = tangent
            tangents[v3Index] = tangent
        }
    } else {
        console.warn("Faltan atributos para el calculo de tangentes")
    }

    // Pasamos la informacion obtenida a un formato apropiado para ser almacenada en buffers (flattened)

    const vertexPositions = []              // [x, y, z, x, y, z, x...]
    const vertexTextureCoordinates = []     // [s, t, s, t, s, ...]
    const vertexNormals = []                // [x, y, z, x, y, z, x...]
    const vertexTangents = []               // [x, y, z, x, y, z, x...]

    if (positions.length) {
        for (let vertex of vertices) {
            const positionIndex = vertex[0]
            vertexPositions.push(...positions[positionIndex])
        }
    }

    if (textureCoordinates.length) {
        for (let vertex of vertices) {
            const textureCoordinatesIndex = vertex[1]
            vertexTextureCoordinates.push(...textureCoordinates[textureCoordinatesIndex])
        }
    }

    if (normals.length) {
        for (let vertex of vertices) {
            const normalIndex = vertex[2]
            vertexNormals.push(...normals[normalIndex])
        }
    }

    if (tangents.length) {
        for (let tangent of tangents) {
            vertexTangents.push(...tangent)
        }
    }

    const indexTriangles    = []        // indices para dibujado con gl.TRIANGLES
    const indexLines        = []        // indices para dibujado con gl.LINES
    const alreadyAddedLines = new Set() // lineas ya agregadas al indice ("1/2", "2/3", ... con "1/2" siendo la linea que una al vertice 1 y 2)

    for (let faceVertices of faces) {
        for (let index = 0; index < 3; index ++) {
            // para los indices de los triangulos, simplemente agregamos cada uno al arreglo correspondiente
            indexTriangles.push(faceVertices[index])

            // en el caso del arreglo de indices para lineas, agarramos de a dos indices (a, b) y chequeamos que el par no haya sido ya agregado,
            // (a fin de evitar redibujar lineas innecesariamente)
            const a = faceVertices[index]
            const b = faceVertices[(index + 1) % 3]

            if (!alreadyAddedLines.has(a + "/" + b)) {
                indexLines.push(a)
                indexLines.push(b)
                alreadyAddedLines.add(a + "/" + b) // la linea que une a y b
                alreadyAddedLines.add(b + "/" + a) // es la misma que una b y a
            }
        }
    }

    return {
        vertexPositions,
        vertexTextureCoordinates,
        vertexNormals,
        vertexTangents,
        indexTriangles,
        indexLines
    }
}

function normalizeVector(vector) {
  let x = vector[0]
  let y = vector[1]
  let z = vector[2]

  let length = Math.sqrt(x*x + y*y + z*z)

  vector[0] = x / length
  vector[1] = y / length
  vector[2] = z / length
}
