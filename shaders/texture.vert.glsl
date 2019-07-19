#version 300 es

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 vertexPosition;
in vec2 vertexTextureCoordinates;

out vec2 fragmentTextureCoordinates;

void main() {
    fragmentTextureCoordinates = vertexTextureCoordinates;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertexPosition, 1);
}
