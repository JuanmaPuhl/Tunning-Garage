#version 300 es
precision mediump float;
uniform vec3 kd;
uniform float a;
out vec4 fragColor;

void main(){

  fragColor = vec4(kd,a);

}
