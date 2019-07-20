#version 300 es
precision mediump float;
uniform mat4 mProj;
uniform mat4 mView;
uniform mat4 mWorld;
uniform vec4 pointLightPosition;
in vec3 vertexPosition;

out vec3 fPos;
out vec3 vLE;
void main(){
  vec4 L = mView * pointLightPosition;


  fPos = -(mView*mWorld * vec4(vertexPosition,1.0)).xyz;
  vLE    = L.xyz + fPos.xyz;
  gl_Position = mProj * mView * mWorld*vec4(vertexPosition,1.0);
}
