#version 300 es
precision mediump float;
#define PI 3.1415926535897932384626433832795
uniform vec4 pointLightPosition;
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;

uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;
uniform mat4 viewMatrix;
uniform struct Light{
  vec4 position;
  vec4 direction;
  vec3 color;
  float limit;
  int type;
}lights[20];
uniform int cantLights;

uniform sampler2D texture0;
uniform float bias;
in vec3 fPos;
in vec3 fNorm;
in vec3 vNE;
in vec3 vVE;
in vec2 fTexCoor;
out vec4 fragColor;

uniform float F0;
uniform float rugosidad;
uniform float p;
uniform float sigma;
vec3 coefDifuso;
uniform vec3 b;
uniform int pcf;
vec3 sampleOffsetDirections[20] = vec3[]
(
   vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1),
   vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
   vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
   vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
   vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
);

/*Este metodo calcula las sombras para una determinada luz. Requiere un cubemap de profundidad.*/
float calcSombras(Light light,vec3 N, vec3 V){
  vec3 vLE = light.position.xyz + vVE;
  vec3 L = normalize(vLE);
  float LdotN = max(dot(L, N), 0.0);
  float dif		= LdotN;
  float toReturn = 0.0;
  vec3 toLightNormal = normalize(pointLightPosition.xyz - fPos);
  float fromLightToFrag = (length(fPos - pointLightPosition.xyz)-shadowClipNearFar.x)/(shadowClipNearFar.y-shadowClipNearFar.x);
  float shadowMapValue;
  int samples = 20;
  /*Uso multiplicaciones con el valor de pcf para prescindir del uso de if's,
  los cuales ralentizan el programa*/
  samples *= pcf;
  float lightIntensity =(1.0-float(pcf))*0.3 + 0.3 * float(samples);
  float bias = max(0.05 * (1.0 - dif), 0.003);
  float ringSize = 0.001;
  //Esta primera pasada es obligatoria.
  shadowMapValue = texture(lightShadowMap,-toLightNormal).r;
  if((shadowMapValue + bias)>= fromLightToFrag){
    lightIntensity += 1.0 * dif;
  }
  /*Luego calculo el PCF. Para que sea optativo, se puede usar un multiplicador
  en el samples. Por ejemplo x, si x = 0, x * samples = 0, por lo que el bucle
  no se ejecuta, si x es 1, se ejecuta samples veces.
  Los valores iniciales de lightIntensity tambien deben modificarse para Activar
  o desactivar el pcf.
  */
  for(int i = 0; i < samples; ++i){
    shadowMapValue = texture(lightShadowMap,-toLightNormal + sampleOffsetDirections[i]*ringSize).r;
    if((shadowMapValue + bias)>= fromLightToFrag){
      lightIntensity += 1.0 * dif;
    }
  }
  lightIntensity /= (float(samples)+ (1.0-float(pcf))); //Tengo que añadir la ultima parte o sino divide por cero.
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
    return b+ia*(coefDifuso*value + ks*(Fres/3.141516)* (Beckmann*GCT)/(componente1*componente2));
  else
     return b+ia*coefDifuso*value;
}

vec3 calcularAporteSpot(Light l, vec3 N, vec3 V){
  vec4 posL = l.position;
  vec4 dirL = l.direction;
  vec3 ia = l.color;
  float limit = l.limit;
  vec3 light_direction = vec3(posL + vec4(vVE,1.0)); //direccion de la luz al vertice
  vec3 L = normalize(light_direction);
  vec3 H = normalize(V+L);
  vec3 S = normalize(vec3(dirL));
  vec3 toReturn = ka;

  float titaH = max(dot(N,H),0.0);
  float titaI = max(dot(N,L),0.0);
  //Variables de la atenuacion geometrica
  float angle = acos(max(dot(S,-L),0.0));
  float inlight = smoothstep(radians(degrees(acos(limit))+10.0),acos(limit),angle);
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
      toReturn = b+ia*(inlight * coefDifuso*value + inlight * ks*(Fres/3.141516)* (Beckmann*GCT)/(componente1*componente2));
    else
       toReturn = b+ia*inlight*coefDifuso * value;
    return toReturn;
}

vec3 calcularAporteDireccional(Light l, vec3 N , vec3 V){
  vec4 posL = l.position;
  vec4 dirL = l.direction;
  vec3 ia = l.color;
  float limit = l.limit;
  vec3 light_direction = vec3(posL + vec4(vVE,1.0)); //direccion de la luz al vertice
  vec3 S = -normalize(vec3(dirL));
  vec3 L = normalize(light_direction);
  vec3 H = normalize(V+S);

  float titaH = max(dot(N,H),0.0);
  float titaI = max(dot(N,S),0.0);
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
  float componente2 = max(dot(N,S),0.0);

  float value = orenNayar(N,V,S,H);
  if(componente1*componente2!=0.0)
    return b+ia*(coefDifuso*value + ks*(Fres/3.141516)* (Beckmann*GCT)/(componente1*componente2));
  else
     return b+ia*coefDifuso * value;
}


void main(){
  vec3 N = normalize(vNE);
  vec3 V = normalize(vVE);
  coefDifuso = kd + texture(texture0,fTexCoor).xyz  ;
  vec3 ret = calcularAportePuntual(lights[0],N,V);
  vec3 col =ret;
  for(int i = 1; i<cantLights; i++){
    if(lights[i].type==0)
     col += calcularAporteSpot(lights[i],N,V);
    if(lights[i].type==1)
      col += calcularAportePuntual(lights[i],N,V);
    if(lights[i].type==2)
     col += calcularAporteDireccional(lights[i],N,V);
  }
  fragColor = vec4((calcSombras(lights[0],N,V))*col,1.0);

}
