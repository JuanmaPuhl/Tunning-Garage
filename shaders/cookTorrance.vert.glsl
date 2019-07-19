#version 300 es

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform mat4 MV;
uniform mat4 MVP;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec2 vertexTextureCoordinates;
in vec3 vertexTangent;


out mat3 TBNMatrix;
out vec2 fTexCoor;
out vec3 vNE; //Vector normal en espacio ojo
//out vec3 vLE; //Vector de direccion de luz
out vec3 vVE; //Vector de vista (al ojo)


void main(void){

    gl_Position = projectionMatrix * MV * vec4(vertexPosition,1);

    vec3 vertex_pos_eye = vec3(MV*vec4(vertexPosition,1.0)); //posicion del vertice en coordenadas del ojo
    vVE = -vertex_pos_eye;
    vec3 vertex_normal_eye = vec3(normalMatrix * vec4(vertexNormal,0.0)); //normal del vertice en coordenadas del ojo
    vNE = vertex_normal_eye;
    //vec3 light_direction = vec3( posL - vec4(vertex_pos_eye,1.0)); //direccion de la luz al vertice
    //vLE = light_direction;
    //vSD = (modelViewMatrix*spot_direction).xyz;

        vec3 N = vec3(normalMatrix * vec4(vertexNormal, 0));
        vec3 T = vec3(normalMatrix * vec4(vertexTangent, 0));
        vec3 B = cross(N, T);

        TBNMatrix = mat3(T, B, N);
    fTexCoor = vertexTextureCoordinates;
}
