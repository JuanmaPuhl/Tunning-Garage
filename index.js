import { mat4,vec4,vec3 } from "/libs/gl-matrix/index.js"
import { getFileContentsAsText, toRadians , loadImage} from "/libs/utils.js"
import { Program, VertexBuffer, IndexBuffer, VertexArray, SphericalCamera, SphericalCameraMouseControls, Material,SceneObject,Geometry ,SceneLight} from "/libs/gl-engine/index.js"
import { parse } from "/libs/gl-engine/parsers/obj-parser.js"

var pcf=1;
main()

async function main() {
  const canvas = document.getElementById("webgl-canvas", {premultipliedAlpha: false})
  const gl = canvas.getContext("webgl2")
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clearColor(0.05, 0.05, 0.05, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // #️⃣ Cargamos assets a usar (modelos, codigo de shaders, etc)

  console.log("CARGANDO TEXTURAS");
  const lambo_logoTexture = gl.createTexture();
  const lambo_engineTexture = gl.createTexture();

  armarTextura(lambo_logoTexture, await loadImage("/textures/logo_lamborghini.jpeg"));
  armarTextura(lambo_engineTexture, await loadImage("/textures/lp700_motor.jpeg"));
  console.log("CARGANDO MODELOS");
  //const lamborghiniGeometryData = await parse("models/lambo.obj", true)
  const cubeGeometryData   = await parse("models/cube.obj", false)
  const lambo_glassGeometryData = await parse("models/Lambo_glass.obj",true);
  const lambo_chasisGeometryData = await parse("models/Lambo_chasis.obj", true);
  const lambo_mirrorGeometryData = await parse("models/Lambo_mirror.obj", true);
  const lambo_logoGeometryData = await parse("models/Lambo_logo.obj",true);
  const lambo_ruedasGeometryData = await parse("models/Lambo_ruedas.obj",true);
  const lambo_llantasGeometryData = await parse("models/Lambo_llantas.obj", true);
  const lambo_plasticGeometryData = await parse("models/Lambo_plastic.obj", true);
  const lambo_glass_lightsGeometryData = await parse("models/Lambo_glass_lights.obj", true);
  const lambo_interiorGeometryData = await parse("models/Lambo_interior.obj",true);
  const lambo_engineGeometryData = await parse("models/Lambo_engine.obj",true);
  const lambo_wordGeometryData = await parse("models/Lambo_word.obj", true);
  const lambo_exhaustGeometryData = await parse("models/Lambo_exhaust.obj", true);

  console.log("CARGANDO SHADERS");
  const normalsVertexShaderSource   = await getFileContentsAsText("shaders/normals.vert.glsl")
  const normalsFragmentShaderSource = await getFileContentsAsText("shaders/normals.frag.glsl")
  const textureVertexShaderSource   = await getFileContentsAsText("shaders/texture.vert.glsl")
  const textureFragmentShaderSource = await getFileContentsAsText("shaders/texture.frag.glsl")
  const cookTorranceVertexShaderSource = await getFileContentsAsText("shaders/cookTorrance.vert.glsl");
  const cookTorranceFragmentShaderSource = await getFileContentsAsText("shaders/cookTorrance.frag.glsl");
  const glassVertexShaderSource = await getFileContentsAsText("shaders/glass.vs.glsl");
  const glassFragmentShaderSource = await getFileContentsAsText("shaders/glass.fs.glsl");
  const shadowVertexShaderSource = await getFileContentsAsText("shaders/ShadowMapGen.vs.glsl");
  const shadowFragmentShaderSource = await getFileContentsAsText("shaders/ShadowMapGen.fs.glsl");
  const sVertexShaderSource = await getFileContentsAsText("shaders/Shadow.vs.glsl");
  const sFragmentShaderSource = await getFileContentsAsText("shaders/Shadow.fs.glsl");

  console.log("CREANDO GEOMETRIAS");
  //const lamborghiniGeometry = new Geometry(gl, lamborghiniGeometryData);
  const cubeGeometry = new Geometry(gl,cubeGeometryData);
  const lambo_glassGeometry = new Geometry(gl, lambo_glassGeometryData);
  const lambo_chasisGeometry = new Geometry(gl, lambo_chasisGeometryData);
  const lambo_mirrorGeometry = new Geometry(gl,lambo_mirrorGeometryData);
  const lambo_logoGeometry = new Geometry(gl, lambo_logoGeometryData);
  const lambo_ruedasGeometry = new Geometry(gl, lambo_ruedasGeometryData);
  const lambo_llantasGeometry = new Geometry(gl, lambo_llantasGeometryData);
  const lambo_plasticGeometry = new Geometry(gl, lambo_plasticGeometryData);
  const lambo_glass_lightsGeometry = new Geometry(gl, lambo_glass_lightsGeometryData);
  const lambo_interiorGeometry = new Geometry(gl, lambo_interiorGeometryData);
  const lambo_engineGeometry = new Geometry(gl, lambo_engineGeometryData);
  const lambo_wordGeometry = new Geometry(gl, lambo_wordGeometryData);
  const lambo_exhaustGeometry = new Geometry(gl, lambo_exhaustGeometryData);
  // #️⃣ Creamos la camara principal, sus controles y una camara secundaria para la escena offscreen (mas detalle en breve)

  const camera = new SphericalCamera(5, 30, 70)
  const cameraMouseControls = new SphericalCameraMouseControls(camera, canvas)


  // #️⃣ Creamos programas de shaders a usar
  console.log("CREANDO PROGRAMAS DE SHADERS");
  const normalsProgram = new Program(gl, normalsVertexShaderSource, normalsFragmentShaderSource)
  const textureProgram = new Program(gl, textureVertexShaderSource, textureFragmentShaderSource)
  const cookTorranceProgram = new Program(gl, cookTorranceVertexShaderSource, cookTorranceFragmentShaderSource);
  const glassProgram = new Program(gl,glassVertexShaderSource,glassFragmentShaderSource);
  const shadowProgram = new Program(gl,shadowVertexShaderSource,shadowFragmentShaderSource);
  const sProgram = new Program(gl, sVertexShaderSource,sFragmentShaderSource);

  console.log("CREANDO MATERIALES");
  const floorMaterial = new Material(sProgram, true,true, {texture0:1,texture2:2,normalsTexture: 3, ka:[0.2,0.2,0.2], kd:[1,1,1],ks:[0.0,0.0,0.0],F0:2.81, rugosidad:0.3, sigma:0.0, p:2,b:[0,0,0]});
  const lamborghiniMaterial1 = new Material(sProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.05,0.15,0.005], kd: [0.1607,0.5294,0.04705], ks:[0.1,0.7,0.1], F0: 0.13, rugosidad: 0.3, sigma: 0.3, p:2,b:[0,0,0]});
  const lamborghiniMaterial2 = new Material(sProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.2,0.2,0], kd: [0.8,0.8,0.1], ks:[1,1,0], F0: 0.13, rugosidad: 0.3, sigma: 0.3, p:2, b:[0,0,0]});
  const lamborghiniMaterial3 = new Material(sProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.2,0.2,0], kd: [0,0,0], ks:[1,1,1], F0: 0.13, rugosidad: 0.3, sigma: 0.3, p:2, b:[0,0,0]});
  const lamborghiniMaterial4 = new Material(sProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.2,0.2,0], kd: [1,0.1,0.1], ks:[0.7,0.1,0.1], F0: 0.13, rugosidad: 0.3, sigma: 0.3, p:2, b:[0,0,0]});
  const lamborghiniMaterial5 = new Material(sProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.2,0.2,0], kd: [0.2862,0.9019,0.8470], ks:[0.2862,0.9019,0.8470], F0: 0.13, rugosidad: 0.3, sigma: 0.3, p:2, b:[0,0,0]});
  const glassMaterial = new Material(glassProgram, true,false,{texture0:0,kd: [0.1,0.1,0.1], ks:[1,1,1], a: 0.01});
  const glassMaterial2 = new Material(glassProgram, true,false,{texture0:0,kd: [0.1,0.1,0.1], ks:[1,1,1],a : 0.01});
  const mirrorMaterial = new Material(sProgram, true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0,0,0],kd:[0,0,0], ks:[1,1,1], F0: 0.1, rugosidad: 0.09, sigma:0, p:100,b:[0,0,0]});
  const wheelMaterial = new Material(sProgram, true,true, {texture0:1,texture2:2,normalsTexture: 3, ka:[0,0,0],kd:[0.26,0.26,0.26], ks:[0,0,0], F0:0.09, rugosidad:0.1, sigma:90, p:1,b:[0,0,0]});
  const rimMaterial = new Material(sProgram, true,true, {texture0:1,texture2:2, normalsTexture: 3,ka:[0.05,0.05,0.05],kd:[0.6019,0.6019,0.6019], ks:[0.37058,0.37058,0.37058], F0: 0.13, rugosidad: 0.1, sigma: 0, p:2,b:[0,0,0]});
  const logoMaterial = new Material(sProgram, true, true, {texture0:1, texture2:2, normalsTexture: 3, ka:[0,0,0], kd:[0.6,0.6,0.6], ks:[0.0,0.0,0.0], F0:0.1, rugosidad: 0.09, sigma: 90, p:0.1,b:[0,0,0]});

  // const floorMaterial = new Material(cookTorranceProgram, true,true, {texture0:1,texture2:2,normalsTexture: 3, ka:[0.2,0.2,0.2], kd:[0.85446,0.85446,0.85446],ks:[0.0,0.0,0.0],F0:2.81, rugosidad:0.3, sigma:90, p:1});
  // const lamborghiniMaterial = new Material(cookTorranceProgram,true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0.2,0.2,0], kd: [0.4,0.4,0], ks:[1,1,0], F0: 0.13, rugosidad: 0.3, sigma: 90, p:1});
  // const glassMaterial = new Material(glassProgram, true,false,{texture0:0,kd: [0.1,0.1,0.1], ks:[1,1,1], a: 0.1});
  // const glassMaterial2 = new Material(glassProgram, true,false,{texture0:0,kd: [0.1,0.1,0.1], ks:[1,1,1],a : 0.1});
  // const mirrorMaterial = new Material(cookTorranceProgram, true,true,{texture0:1,texture2:2,normalsTexture: 3,ka:[0,0,0],kd:[0,0,0], ks:[1,1,1], F0: 0.1, rugosidad: 0.09, sigma:90, p:1});
  // const wheelMaterial = new Material(cookTorranceProgram, true,true, {texture0:1,texture2:2,normalsTexture: 3, ka:[0,0,0],kd:[0.26,0.26,0.26], ks:[0,0,0], F0:0.09, rugosidad:0.1, sigma:90, p:1});
  // const rimMaterial = new Material(cookTorranceProgram, true,true, {texture0:1,texture2:2, normalsTexture: 3,ka:[0.05,0.05,0.05],kd:[0.6019,0.6019,0.6019], ks:[0.37058,0.37058,0.37058], F0: 0.13, rugosidad: 0.1, sigma: 90, p:1});
  // #️⃣ Descripcion de objetos en escena: inicializamos sus matrices, almacenamos su geometria en buffers, etc

  console.log("CREANDO OBJETOS");
  //const lamborghini = new SceneObject(gl, lamborghiniGeometry,lamborghiniMaterial, [null],false);
  const cube = new SceneObject(gl, cubeGeometry, floorMaterial,[null],false);
  const lambo_glass = new SceneObject(gl, lambo_glassGeometry, glassMaterial,[null], false);
  const lambo_chasis = new SceneObject(gl, lambo_chasisGeometry, lamborghiniMaterial1,[null], false);
  const lambo_mirror = new SceneObject(gl, lambo_mirrorGeometry, mirrorMaterial,[null], false);
  const lambo_logo = new SceneObject(gl, lambo_logoGeometry, logoMaterial, [lambo_logoTexture],false);
  const lambo_ruedas = new SceneObject(gl, lambo_ruedasGeometry, wheelMaterial, [null], false);
  const lambo_llantas = new SceneObject(gl, lambo_llantasGeometry, rimMaterial, [null], false);
  const lambo_plastic = new SceneObject(gl, lambo_plasticGeometry, wheelMaterial, [null], false);
  const lambo_glass_lights = new SceneObject(gl, lambo_glass_lightsGeometry, glassMaterial2, [null], false);
  const lambo_interior = new SceneObject(gl, lambo_interiorGeometry, wheelMaterial, [null], false);
  const lambo_engine = new SceneObject(gl, lambo_engineGeometry, wheelMaterial, [lambo_engineTexture], false);
  const lambo_word = new SceneObject(gl, lambo_wordGeometry, rimMaterial, [null], false);
  const lambo_exhaust = new SceneObject(gl, lambo_exhaustGeometry, rimMaterial, [null], false);

  const sceneObjects = [cube,lambo_chasis,lambo_mirror, lambo_logo, lambo_ruedas, lambo_llantas, lambo_plastic, lambo_interior, lambo_engine, lambo_word, lambo_exhaust];
  sceneObjects.push(lambo_glass);//Lo agrego siempre al final
  sceneObjects.push(lambo_glass_lights);

  let sm= mat4.create();
  let m = cube.modelMatrix;
  mat4.fromScaling(sm,[50,0.5,50]);
  mat4.multiply(m,sm,m);
  sm = mat4.create();
  mat4.fromTranslation(sm,[0,-0.48,0]);
  mat4.multiply(m,sm,m);

  //Creo las luces de la escena.
  const light = new SceneLight([0,5,0,1],[1, 1,1],Math.cos(toRadians(50)),[0,-1,0,0],1); //En el Shader siempre es una luz puntual...
  const light2 = new SceneLight([0,5,10,1],[1,0.1,0.1],Math.cos(toRadians(50)),[0,-1,0,0],0);
  const light3 = new SceneLight([0,5,-10,1],[1,0.1,0.1],Math.cos(toRadians(50)),[-1,0,0,0],2);

  const sceneLights = [light];

  const color1 = document.getElementById("color1");
  const color2 = document.getElementById("color2");
  const color3 = document.getElementById("color3");
  const color4 = document.getElementById("color4");
  const color5 = document.getElementById("color5");

  color1.addEventListener("click", () => {
    lambo_chasis.material = lamborghiniMaterial1;
	});
  color2.addEventListener("click", () => {
    lambo_chasis.material = lamborghiniMaterial2;
  });
  color3.addEventListener("click", () => {
    lambo_chasis.material = lamborghiniMaterial3;
  });
  color4.addEventListener("click", () => {
    lambo_chasis.material = lamborghiniMaterial4;
  });
  color5.addEventListener("click", () => {
    lambo_chasis.material = lamborghiniMaterial5;
  });

  /*FUNCIONAMIENTO SOMBRAS GLOBALES CON CUBEMAPS

  La idea general del shadowmapping es poner una camara en la posicion de
  la luz y guardar los valores de profundidad en una textura, que despues
  sera usada al renderizar la escena.
  El problema aparece con las luces puntuales. ¿A donde apuntamos la camara?
  Con cubemaps se arregla. Hacemos que la camara apunte en 6 direcciones
  distintas, una a la vez. Y en cada direccion genera una textura.
  Luego, en el ciclo de renderizado normal, se obtiene el valor de la textura
  del cubemap para cada vertice y se decide si se dibuja o no.
  */

  /*Obtengo la extension para guardar texturas con valores en float.
  Esto sirve para mejorar la precision a la hora de hacer shadow mapping*/
  const ext = gl.getExtension("EXT_color_buffer_float");
    if (!ext) {
      alert("need EXT_color_buffer_float");
      return;
    }

  var SHADOW_MAP_SIZE = 4096 //Tamaño de la sombra
  //Creo el cubemap
  var shadowMapCube = gl.createTexture();
  var shadowMapFrameBuffer;
  var shadowMapRenderBuffer;
  setTextureConfig();
  //Creo los arreglos con direcciones para cada cara del cubemap
  //Direcciones Target
  var ENV_CUBE_LOOK_DIR = [
  [1.0, 0.0, 0.0],
  [-1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, -1.0, 0.0],
  [0.0, 0.0, 1.0],
  [0.0, 0.0, -1.0]
  ];

  //Direcciones UP
  var ENV_CUBE_LOOK_UP = [
  [0.0, -1.0, 0.0],
  [0.0, -1.0, 0.0],
  [0.0, 0.0, 1.0],
  [0.0, 0.0, -1.0],
  [0.0, -1.0, 0.0],
  [0.0, -1.0, 0.0]
  ];

  //Creo la matriz de proyeccion de la camara en la posicion de la luz
  var shadowMapProj = mat4.create();
  var shadowClipNearFar = [0.1,50];
  mat4.perspective(shadowMapProj,toRadians(90),1,shadowClipNearFar[0],shadowClipNearFar[1]);
  generateShadowMap(light);

  // 🎬 Iniciamos el render-loop
  var then=0;
  var count =0;
  var last =0;
  var bias = document.getElementById("lamborghini-rotation");
  var btnPCF = document.getElementById("PCF");
  btnPCF.addEventListener("click", () => {
	if(pcf)
    pcf = 0;
  else
    pcf = 1;
	});

  requestAnimationFrame(render)

  function render(now) {
    now *= 0.001;                          // convert to seconds
  	const deltaTime = now - then;          // compute time since last frame
    count++;//Aumento fps
  	if(now - last> 1){
  		document.getElementById("FPS").innerText = count;
      count = 0;
  		last = now;
  	}
  	then = now; //Actualizo el valor
    //console.log(fps);            // compute frames per second
    // 2️⃣ Dibujamos la escena con el cubo usando el Frame Buffer por defecto (asociado al canvas)
    drawSceneAsUsual()
    // Solicitamos el proximo frame
    requestAnimationFrame(render)
  }

  /*Funcion que dibuja la escena usando el shadowMap calculado previamente*/
  function drawSceneAsUsual(){
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
    updateView(gl, canvas, camera, true)
    for(let object of sceneObjects){
      let programa = object.material.program;
      programa.use();
      if(object.material.affectedByShadows){
        programa.setUniformValue("pointLightPosition", light.position);
        programa.setUniformValue("shadowClipNearFar", shadowClipNearFar);
        programa.setUniformValue("lightShadowMap", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
      }
      programa.setUniformValue("projectionMatrix",camera.projectionMatrix);
      programa.setUniformValue("viewMatrix",camera.viewMatrix);
      mat4.multiply(object.modelViewMatrix, camera.viewMatrix, object.modelMatrix)
      mat4.invert(object.normalMatrix, object.modelViewMatrix)
      mat4.transpose(object.normalMatrix, object.normalMatrix)
      programa.setUniformValue("modelMatrix",object.modelMatrix);
      programa.setUniformValue("MV",object.modelViewMatrix);
      programa.setUniformValue("normalMatrix",object.normalMatrix);
      programa.setUniformValue("pcf", pcf);
      for (let name in object.material.properties) {
        const value = object.material.properties[name];
        programa.setUniformValue(name, value);
      }
      if(object.material.affectedByLight){
        let i=0;
        for(let light of sceneLights){
          let lightPosEye = vec4.create();
          let lightDirEye = vec4.create();
          vec4.transformMat4(lightPosEye, light.position, camera.viewMatrix);
          vec4.transformMat4(lightDirEye, light.direction, camera.viewMatrix);
          programa.setUniformValue("lights["+i+"].position", lightPosEye);
          programa.setUniformValue("lights["+i+"].color", light.color);
          programa.setUniformValue("lights["+i+"].direction", lightDirEye);
          programa.setUniformValue("lights["+i+"].limit", light.angle);
          programa.setUniformValue("lights["+i+"].type", light.type);
          i++;
        }
        programa.setUniformValue("cantLights",i);

      }
      // Seteamos unidad de textura activa, junto con su target (TEXTURE_2D) y la textura a usar (donde tenemos la escena renderizada)
      let j=0;
      for(let texture of object.textures){
        gl.activeTexture(gl.TEXTURE1 + j)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        j++;
      }
      object.vertexArray.bind();
      gl.drawElements(object.drawMode, object.indexBuffer.size, object.indexBuffer.dataType, 0);
    }
  }


  function armarTextura(texture, image) {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

  function setTextureConfig() {
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

  for (let i = 0; i < 6; i++) {
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0,  gl.RGBA32F, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE, 0, gl.RGBA, gl.FLOAT, null);
  }
  //Creo los framebuffer que almacenan la textura.
  shadowMapFrameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFrameBuffer);
  shadowMapRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
  function generateShadowMap(luz) {
  		shadowProgram.use(); //Seteo el programa a usar
  		// gl.activeTexture(gl.TEXTURE0);
  		gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube); //Bindeo texturas y buffers
  		gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFrameBuffer);
  		gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderBuffer);
      gl.viewport(0, 0, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);//Hago viewport para que dibuje texturas del tamaÃ±o deseado
  		//Paso uniforms
  		shadowProgram.setUniformValue("shadowClipNearFar", shadowClipNearFar);
  		shadowProgram.setUniformValue("pointLightPosition", luz.position);
  		shadowProgram.setUniformValue("mProj", shadowMapProj);
  		for (let i = 0; i < 6; i++) {//Para cada cara del cubemap...
  			let lookAt = vec3.create();
  			let matriz = mat4.create();
  			vec3.add(lookAt, luz.position, ENV_CUBE_LOOK_DIR[i]); //Calculo el centro al cual mirar
  			mat4.lookAt(matriz, luz.position, lookAt, ENV_CUBE_LOOK_UP[i]); //Miro a la direccion necesaria
  			shadowProgram.setUniformValue("mView", matriz);
  			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, shadowMapCube, 0);
  			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowMapRenderBuffer);
  			gl.clearColor(0, 0, 0, 1);
  			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//Limpio pantalla
  			//gl.viewport(0, 0, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);//Hago viewport para que dibuje texturas del tamaÃ±o deseado

  			for (let object of sceneObjects) { //Renderizo cada objeto
            if(object.material.affectedByShadows){
              shadowProgram.setUniformValue("mWorld", object.modelMatrix);
              object.vertexArray.bind();
              gl.drawElements(object.drawMode, object.indexBuffer.size, object.indexBuffer.dataType, 0);
            }
  			}
  		}
  		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  	}
}



function updateView(gl, canvas, camera, forceUpdate = false) {
    // Obtenemos el tamaño en pantalla del canvas
    const displayWidth = Math.floor(canvas.clientWidth * window.devicePixelRatio)
    const displayHeight = Math.floor(canvas.clientHeight * window.devicePixelRatio)

    // Vemos si las dimensiones del buffer del canvas (numero de pixeles) coincide con su tamaño en pantalla
    if (forceUpdate || (canvas.width !== displayWidth) || (canvas.height !== displayHeight)) {
        // Ajustamos dimensiones del buffer para que coincidan con su tamaño en pantalla
        canvas.width = displayWidth
        canvas.height = displayHeight

        // Ajustamos relacion de aspecto de la camara
        camera.aspect = displayWidth / displayHeight
        camera.updateProjectionMatrix()

        // Actualizamos mapeo entre coorenadas del espacio de clipping (de -1 a 1) a pixeles en pantalla
        gl.viewport(0, 0, displayWidth, displayHeight)
    }
}
