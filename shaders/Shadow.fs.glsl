#version 300 es
precision mediump float;
#define PI 3.1415926535897932384626433832795
uniform vec4 pointLightPosition;
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;

uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;

uniform struct Light{
  vec4 position;
  vec4 direction;
  vec3 color;
  int type;
}lights[10];
uniform int cantLights;

in vec3 fPos;
in vec3 fNorm;
in vec3 vNE;
in vec3 vVE;
out vec4 fragColor;

uniform float F0;
uniform float rugosidad;
uniform float p;
uniform float sigma;
vec3 coefDifuso;


float calcSombras(Light light,vec3 N, vec3 V){
  vec3 vLE = light.position.xyz + vVE;
  vec3 L = normalize(vLE);
  float LdotN = max(dot(L, N), 0.0);
  float dif		= LdotN;
  float toReturn = 0.0;
  vec3 toLightNormal = normalize(pointLightPosition.xyz - fPos);
  float fromLightToFrag = (length(fPos - pointLightPosition.xyz)-shadowClipNearFar.x)/(shadowClipNearFar.y-shadowClipNearFar.x);
  float shadowMapValue = texture(lightShadowMap,-toLightNormal).r;
  float lightIntensity = 0.3;
  if((shadowMapValue + 0.003)>= fromLightToFrag){
    lightIntensity += 1.0 *dif;
  }
  toReturn = lightIntensity;
  return toReturn;
}

float orenNayar(vec3 N, vec3 V, vec3 L, vec3 H){
  float f0N = 0.0;

  float A = 1.0 - 0.5 * sigma/(pow(sigma,2.0)+0.33);
  float B = 0.45 * (sigma/(pow(sigma,2.0)+0.09));
  float cosR = max(dot(N,V),0.0);
  float cosI = max(dot(N,L),0.0);
  float anguloR = acos(cosR);
  float anguloI = acos(cosI);
  float a = max(anguloR,anguloI);
  float b = min(anguloR,anguloI);
  float cosPHI = dot( normalize(V-N*(cosR)), normalize(L - N*(cosI)) );
  f0N = (p/PI)*cosI*(A+(B*max(0.0,cosPHI))*sin(a)*tan(b));
  return f0N;
}

vec3 calcularAportePuntual(Light l, vec3 N , vec3 V){
  vec4 posL = l.position;
  vec4 dirL = l.direction;
  vec3 ia = l.color;
  vec3 light_direction = vec3(posL) + vVE; //direccion de la luz al vertice
  vec3 L = normalize(light_direction);
  vec3 H = normalize(V+L);
  float titaH = max(dot(N,H),0.0);
  float titaI = max(dot(N,L),0.0);
  //Variables de la atenuacion geometrica

  float Beckmann;
  //Termino de Fresnel
  float Fres = pow(1.0 - titaH, 5.0);
  Fres *= (1.0 - F0);
  Fres += F0;

  //Termino de Beackmann
  float divisor = pow(rugosidad,2.0)* pow(titaH,4.0);
  float exponente = -(pow(tan(acos(titaH))/rugosidad,2.0));
  exponente = exp(exponente);
  Beckmann = exponente/divisor;

  //Variables de la atenuacion geometrica
  float GCT;
  float Ge;
  float Gs;
  float titaV = max(dot(V,H),0.0);
  Ge = (2.0*titaH*titaV)/(titaV);
  Gs = (2.0*titaH*titaI)/(titaV);

  GCT=min(1.0,Ge);
  GCT=min(GCT,Gs);
  float componente1 = max(dot(N,V),0.0);
  float componente2 = max(dot(N,L),0.0);

  float value = orenNayar(N,V,L,H);

  if(componente1*componente2!=0.0)
    return ia*(coefDifuso*value + ks*(Fres/3.141516)* (Beckmann*GCT)/(componente1*componente2));
  else
     return ia*coefDifuso*value;
}

// vec3 calcularAportePuntual(Light light, vec3 N, vec3 V){
//   vec3 vLE = light.position.xyz + vVE;
//   vec3 L = normalize(vLE);
//   vec3 H = normalize(L + V);
//   float LdotN = max(dot(L, N), 0.0);
//   float HdotN = max(dot(H, N), 0.0);
//   float dif		= LdotN;
//
//   float specPhong = 0.0;
//   if (LdotN > 0.0) {
//    specPhong = pow(HdotN, 100.0);
//   }
//   vec3 ambiente = ka*0.5;
//   vec3 difuso = kd * dif;
//   vec3 especular = vec3(1.0)*specPhong;
//   vec3 toReturn = vec3(0.0);
//   toReturn = light.color*(difuso + especular);
//   return toReturn;
// }

void main(){
  vec3 N = normalize(vNE);
  vec3 V = normalize(vVE);
  coefDifuso = kd;
  vec3 ret = calcularAportePuntual(lights[0],N,V);
  vec3 col = ka*coefDifuso+calcSombras(lights[0],N,V)*ret;

  fragColor = vec4(col,1.0);

}
