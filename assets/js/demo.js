if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer;

var video, video1, texture, texture1, material, material1, mesh, mesh1;

var composer;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var cube_count, mesh, material;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 2500;

	scene = new THREE.Scene();

	var light = new THREE.AmbientLight( 0xaaaaaa );
	//light.position.set( 0.5, 1, 1 ).normalize();
	scene.add( light );

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//video = document.getElementById( 'video' );
	video	= document.createElement('video');
	video.width	= 1920;
	video.height	= 1080;
	video.autoplay	= true;
	video.loop	= true;
	video1	= document.createElement('video');
	video1.width	= 640;
	video1.height	= 480;
	video1.autoplay	= true;
	video1.loop	= true;
	// expose video as this.video
	//this.video	= video

	if( navigator.webkitGetUserMedia ){
		navigator.webkitGetUserMedia({video:{
		    optional:[{"minWidth": 1920}]
        }}, function(stream){
			video1.src	= URL.createObjectURL(stream);
		}, function(error){
			alert('you got no WebRTC webcam');
		});		
	}else if(navigator.mozGetUserMedia){
		navigator.mozGetUserMedia({video:{optional:[{"minWidth": 1920}]}}, function(stream){
			video.src	= URL.createObjectURL(stream);
		}, function(error){
			alert('you got no WebRTC webcam');
		});				
	}else	console.assert(false)

	if( navigator.webkitGetUserMedia ){
		navigator.webkitGetUserMedia({
		    video:{
		        optional: [
                    {"sourceId": "88de45ca7ac6baa0e98a0a527d87be48e5abd1166f0261344c0c8f57272dda48"},
                    {"minWidth": 1920},
                    {"minWidth": 1280},
                    {"minWidth": 720}]
		    }
		}, function(stream){
			video.src	= URL.createObjectURL(stream);
		}, function(error){
			alert('you got no WebRTC webcam');
		});		
	}else if(navigator.mozGetUserMedia){
		navigator.mozGetUserMedia({video:true}, function(stream){
			video1.src	= URL.createObjectURL(stream);
		}, function(error){
			alert('you got no WebRTC webcam');
		});				
	}else	console.assert(false)
	// create the texture
	//var texture	= new THREE.Texture( video );
	// expose texture as this.texture
	//this.texture	= texture
	texture = new THREE.VideoTexture( video );
	texture.update	= function(delta, now){
		if( video.readyState !== video.HAVE_ENOUGH_DATA )	return;
		texture.needsUpdate	= true;		
	}
	texture1 = new THREE.VideoTexture( video1 );
	texture1.update	= function(delta, now){
		if( video1.readyState !== video1.HAVE_ENOUGH_DATA )	return;
		texture.needsUpdate	= true;
	}
	//texture = new THREEx.WebcamTexture()
	

	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	texture1.minFilter = THREE.LinearFilter;
	texture1.magFilter = THREE.LinearFilter;
	texture1.format = THREE.RGBFormat;
	//

	var i, j, ux, uy, ox, oy,
		geometry, geometry1,
		xsize, ysize;

	ux = 1;
	uy = 1;

	xsize = 960;
	ysize = 540;

	var parameters = { color: 0xffffff, map: texture };

	geometry = new THREE.PlaneGeometry( 960, 540 );
	geometry1 = new THREE.PlaneGeometry( 960, 540 );

	//change_uvs( geometry, ux, uy, ox, oy );

	material = new THREE.MeshLambertMaterial( { 
		color: 0xffffff, 
		map: texture, 
		reflectivity: 0,
		lightMapIntensity: 0 } );
	material1 = new THREE.MeshLambertMaterial( { 
		color: 0xffffff, 
		map: texture1, 
		reflectivity: 0,
		lightMapIntensity: 0
	});

	//material.hue = 1;
	//material.saturation = 1;

	//material.color.setHSL( material.hue, material.saturation, 0.5 );

	//material1.hue = 1;
	//material1.saturation = 1;

	//material1.color.setHSL( material.hue, material.saturation, 0.5 );

	mesh = new THREE.Mesh( geometry, material );

	mesh.position.x =   0*(-1/2 ) * xsize;
	mesh.position.y =   0*(-1/2 ) * ysize;
	mesh.position.z = 0;

	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

	scene.add( mesh );

	mesh.dx = 0.001 * ( 0.5 - Math.random() );
	mesh.dy = 0.001 * ( 0.5 - Math.random() );

	mesh1 = new THREE.Mesh( geometry1, material1 );

	mesh1.position.x =   0*(-1/2 ) * xsize;
	mesh1.position.y =   (1 ) * ysize;
	mesh1.position.z = 0;

	mesh1.scale.x = mesh1.scale.y = mesh1.scale.z = 1;

	scene.add( mesh1 );

	mesh1.dx = 0.001 * ( 0.5 - Math.random() );
	mesh1.dy = 0.001 * ( 0.5 - Math.random() );

	

	renderer.autoClear = false;

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	// postprocessing

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 1.3 );
	var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

	effectCopy.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectCopy );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.reset();

}

function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

	var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

	for ( var i = 0; i < faceVertexUvs.length; i ++ ) {

		var uvs = faceVertexUvs[ i ];

		for ( var j = 0; j < uvs.length; j ++ ) {

			var uv = uvs[ j ];

			uv.x = ( uv.x + offsetx ) * unitx;
			uv.y = ( uv.y + offsety ) * unity;

		}

	}

}


function onDocumentMouseMove(event) {

	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY ) * 0.3;

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

var h, counter = 1;

function render() {

	var time = Date.now() * 0.00005;
	texture.update(0.1,0.1);
	texture1.update(0.1,0.1);

	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

	camera.lookAt( scene.position );

	//h = ( 360 * ( material.hue + time ) % 360 ) / 360;
	//material.color.setHSL( h, material.saturation, 0.5 );

	//h = ( 360 * ( material1.hue + time ) % 360 ) / 360;
	//material1.color.setHSL( h, material1.saturation, 0.5 );

	if ( counter % 1000 > 20000 ) {

		mesh.rotation.x += 10 * mesh.dx;
		mesh.rotation.y += 10 * mesh.dy;

		mesh.position.x += 200 * mesh.dx;
		mesh.position.y += 200 * mesh.dy;
		mesh.position.z += 400 * mesh.dx;

		mesh1.rotation.x += 10 * mesh.dx;
		mesh1.rotation.y += 10 * mesh.dy;

		mesh1.position.x += 200 * mesh.dx;
		mesh1.position.y += 200 * mesh.dy;
		mesh1.position.z += 400 * mesh.dx;
	}

	counter ++;

	renderer.clear();
	composer.render();

}