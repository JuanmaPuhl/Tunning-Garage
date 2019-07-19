#version 300 es

precision highp float;

in vec3 fragmentNormal;

out vec4 fragmentColor;

void main () {
    fragmentColor = vec4(fragmentNormal, 1);
}
