#version 300 es
precision mediump float;
uniform vec3 kd;

out vec4 fragColor;

void main(){

  fragColor = vec4(kd,0.9);

}
