#version 300 es

uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

in vec3 vertexPosition;
in vec3 vertexNormal;

out vec3 fragmentNormal;

void main () {
    fragmentNormal = vertexNormal;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1);
}


