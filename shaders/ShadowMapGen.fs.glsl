#version 300 es

precision mediump float;

uniform vec4 pointLightPosition;
uniform vec2 shadowClipNearFar;
uniform mat4 mView;

in vec3 vLE;
in vec3 fPos;
out vec4 fragColor;

void main(){
  float dist = length(vLE);
  // vec3 fromLightToFrag = (fPos - pointLightPosition.xyz);
  float fromLightToFrag = (dist-shadowClipNearFar.x)/(shadowClipNearFar.y-shadowClipNearFar.x);
  // float lightFragDist = (length(fromLightToFrag)-shadowClipNearFar.x)/(shadowClipNearFar.y - shadowClipNearFar.x);
  fragColor = vec4(fromLightToFrag,fromLightToFrag,fromLightToFrag,1.0);
}
