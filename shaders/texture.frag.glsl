#version 300 es

precision highp float;

uniform sampler2D baseColorTexture;

in vec2 fragmentTextureCoordinates;

out vec4 fragmentColor;

void main () {
    fragmentColor = texture(baseColorTexture, fragmentTextureCoordinates);
}
