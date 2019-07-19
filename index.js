import { mat4,vec4 } from "/libs/gl-matrix/index.js"
import { getFileContentsAsText, toRadians , loadImage} from "/libs/utils.js"
import { Program, VertexBuffer, IndexBuffer, VertexArray, SphericalCamera, SphericalCameraMouseControls, Material,SceneObject,Geometry ,SceneLight} from "/libs/gl-engine/index.js"
import { parse } from "/libs/gl-engine/parsers/obj-parser.js"

main()

async function main() {
  const canvas = document.getElementById("webgl-canvas", {premultipliedAlpha: false})
  const gl = canvas.getContext("webgl2")
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  // #️⃣ Cargamos assets a usar (modelos, codigo de shaders, etc)

  const lambo_logoTexture = gl.createTexture();
  armarTextura(lambo_logoTexture, await loadImage("/textures/logo_lamborghini.jpeg"));


  const lamborghiniGeometryData = await parse("models/lambo.obj", true)
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

  const normalsVertexShaderSource   = await getFileContentsAsText("shaders/normals.vert.glsl")
  const normalsFragmentShaderSource = await getFileContentsAsText("shaders/normals.frag.glsl")
  const textureVertexShaderSource   = await getFileContentsAsText("shaders/texture.vert.glsl")
  const textureFragmentShaderSource = await getFileContentsAsText("shaders/texture.frag.glsl")
  const cookTorranceVertexShaderSource = await getFileContentsAsText("shaders/cookTorrance.vert.glsl");
  const cookTorranceFragmentShaderSource = await getFileContentsAsText("shaders/cookTorrance.frag.glsl");
  const glassVertexShaderSource = await getFileContentsAsText("shaders/glass.vs.glsl");
  const glassFragmentShaderSource = await getFileContentsAsText("shaders/glass.fs.glsl");

  const lamborghiniGeometry = new Geometry(gl, lamborghiniGeometryData);
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
  // #️⃣ Creamos la camara principal, sus controles y una camara secundaria para la escena offscreen (mas detalle en breve)

  const camera = new SphericalCamera(5, 30, 70)
  const cameraMouseControls = new SphericalCameraMouseControls(camera, canvas)


  // #️⃣ Creamos programas de shaders a usar

  const normalsProgram = new Program(gl, normalsVertexShaderSource, normalsFragmentShaderSource)
  const textureProgram = new Program(gl, textureVertexShaderSource, textureFragmentShaderSource)
  const cookTorranceProgram = new Program(gl, cookTorranceVertexShaderSource, cookTorranceFragmentShaderSource);
  const glassProgram = new Program(gl,glassVertexShaderSource,glassFragmentShaderSource);

  const lamborghiniMaterial = new Material(cookTorranceProgram,true,{texture0:0,ka:[0.2,0.2,0], kd: [0.4,0.4,0], ks:[1,1,0]});
  const glassMaterial = new Material(glassProgram, true,{texture0:0,kd: [0.1,0.1,0.1], ks:[1,1,1], a: 0.1});
  const glassMaterial2 = new Material(glassProgram, true,{texture0:0,kd: [0.3,0.3,0.3], ks:[1,1,1],a : 0.2});
  const mirrorMaterial = new Material(cookTorranceProgram, true,{texture0:0,kd:[0,0,0], ks:[1,1,1]});
  const wheelMaterial = new Material(cookTorranceProgram, true, {texture0:0, kd:[0.2588,0.2588,0.2588], ks:[0,0,0]});
  const rimMaterial = new Material(cookTorranceProgram, true, {texture0:0, ka:[0.05,0.05,0.05],kd:[0.9019,0.9019,0.9019], ks:[0.87058,0.87058,0.87058]});
  // #️⃣ Descripcion de objetos en escena: inicializamos sus matrices, almacenamos su geometria en buffers, etc

  const lamborghini = new SceneObject(gl, lamborghiniGeometry,lamborghiniMaterial, [null],false);
  const cube = new SceneObject(gl, cubeGeometry, lamborghiniMaterial,[null],false);
  const lambo_glass = new SceneObject(gl, lambo_glassGeometry, glassMaterial,[null], false);
  const lambo_chasis = new SceneObject(gl, lambo_chasisGeometry, lamborghiniMaterial,[null], false);
  const lambo_mirror = new SceneObject(gl, lambo_mirrorGeometry, mirrorMaterial,[null], false);
  const lambo_logo = new SceneObject(gl, lambo_logoGeometry, mirrorMaterial, [lambo_logoTexture],false);
  const lambo_ruedas = new SceneObject(gl, lambo_ruedasGeometry, wheelMaterial, [null], false);
  const lambo_llantas = new SceneObject(gl, lambo_llantasGeometry, rimMaterial, [null], false);
  const lambo_plastic = new SceneObject(gl, lambo_plasticGeometry, wheelMaterial, [null], false);
  const lambo_glass_lights = new SceneObject(gl, lambo_glass_lightsGeometry, glassMaterial2, [null], false);
  const lambo_interior = new SceneObject(gl, lambo_interiorGeometry, wheelMaterial, [null], false);
  const lambo_engine = new SceneObject(gl, lambo_engineGeometry, wheelMaterial, [null], false);

  const sceneObjects = [lambo_chasis,lambo_mirror, lambo_logo, lambo_ruedas, lambo_llantas, lambo_plastic, lambo_interior, lambo_engine];
  sceneObjects.push(lambo_glass);//Lo agrego siempre al final
  sceneObjects.push(lambo_glass_lights);
  //Creo las luces de la escena.

  const light = new SceneLight([0,5,0,1],[1,1,1],1);
  const sceneLights = [light];

  console.log(lamborghini.position);

  // 🎬 Iniciamos el render-loop

  requestAnimationFrame(render)

  function render() {
      // 2️⃣ Dibujamos la escena con el cubo usando el Frame Buffer por defecto (asociado al canvas)
      drawSceneAsUsual()

      // Solicitamos el proximo frame
      requestAnimationFrame(render)
  }


  function drawSceneAsUsual() {
      // Enlazamos el Frame Buffer conectado al canvas (desenlazando el actual), y lo configuramos
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.clearColor(0.05, 0.05, 0.05, 1)
      gl.enable(gl.BLEND);
		  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      // Actualizamos vista en caso de cambios en el tamaño del canvas (e.g. por cambios en tamaño de la ventana)
      updateView(gl, canvas, camera, true)

      // Limpiamos buffers de color y profundidad del canvas antes de empezar a dibujar los objetos de la escena
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      for(let object of sceneObjects){
        mat4.multiply(object.modelViewMatrix, camera.viewMatrix, object.modelMatrix);
        mat4.invert(object.normalMatrix, object.modelViewMatrix);
        mat4.transpose(object.normalMatrix, object.normalMatrix);
        // Seteamos programa a usar
        let programa = object.material.program;
        programa.use()

        // Actualizamos uniforms que sea necesario
        programa.setUniformValue("viewMatrix", camera.viewMatrix)
        programa.setUniformValue("projectionMatrix", camera.projectionMatrix)
        programa.setUniformValue("modelMatrix", object.modelMatrix)
        programa.setUniformValue("normalMatrix", object.normalMatrix);
        programa.setUniformValue("MV",object.modelViewMatrix);
        programa.setUniformValue("ka",[0.0,0.0,0.0]);
        //programa.setUniformValue("ks",[1,1,1]);
        programa.setUniformValue("F0",0.13);
        programa.setUniformValue("rugosidad",0.3);
        programa.setUniformValue("sigma",90.0);
        programa.setUniformValue("p",1.0);
        for (let name in object.material.properties) {
				const value = object.material.properties[name];
				programa.setUniformValue(name, value);
			}
        if(object.material.affectedByLight){
          let i=0;
          for(let light of sceneLights){
            let lightPosEye = vec4.create();
            vec4.transformMat4(lightPosEye, light.position, camera.viewMatrix);
            programa.setUniformValue("lights["+i+"].posL", lightPosEye);
            programa.setUniformValue("lights["+i+"].ia", light.color);
            programa.setUniformValue("lights["+i+"].type", light.type);
            i++;
          }
          programa.setUniformValue("cantLights",i);

        }

        // Seteamos unidad de textura activa, junto con su target (TEXTURE_2D) y la textura a usar (donde tenemos la escena renderizada)
        let j=0;
        for(let texture of object.textures){
          gl.activeTexture(gl.TEXTURE0 + j)
          gl.bindTexture(gl.TEXTURE_2D, texture);
          j++;
        }


        // Seteamos info de geometria a usar
        object.vertexArray.bind()

        // Dibujamos
        gl.drawElements(object.drawMode, object.indexBuffer.size, object.indexBuffer.dataType, 0)
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
