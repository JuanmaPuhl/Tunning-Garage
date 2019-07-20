#version 300 es

precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 normalMatrix;
uniform mat4 MV;
in vec3 vertexPosition;
in vec3 vertexNormal;

out vec3 fPos;
out vec3 fNorm;
out vec3 vNE;
out vec3 vVE;
void main(){
  fPos =  (modelMatrix * vec4(vertexPosition,1.0)).xyz;
  fNorm = (modelMatrix * vec4(vertexNormal,0.0)).xyz;
  vNE = (normalMatrix * vec4(vertexNormal, 0.0)).xyz;
  vVE = -(MV * vec4(vertexPosition,1.0)).xyz;

  gl_Position = projectionMatrix * MV * vec4(vertexPosition,1.0);
}
