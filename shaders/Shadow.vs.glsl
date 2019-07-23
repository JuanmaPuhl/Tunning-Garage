#version 300 es

precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 normalMatrix;
uniform mat4 MV;
in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;
out vec3 fPos;
out vec3 fNorm;
out vec3 vNE;
out vec3 vVE;
out vec2 fTexCoor;
void main(){
  fPos =  (modelMatrix * vec4(vertexPosition,1.0)).xyz;
  fNorm = (modelMatrix * vec4(vertexNormal,0.0)).xyz;
  vNE = (normalMatrix * vec4(vertexNormal, 0.0)).xyz;
  vVE = -(MV * vec4(vertexPosition,1.0)).xyz;
  fTexCoor = vertexTextureCoordinates;
  gl_Position = projectionMatrix * MV * vec4(vertexPosition,1.0);
}
