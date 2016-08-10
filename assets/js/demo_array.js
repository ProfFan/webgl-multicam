if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, scene, renderer;

var video, texture, material, mesh;

var composer;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var cube_count,

	meshes = [],
	materials = [],

	xgrid = 16,
	ygrid = 9;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 2500;

	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0.5, 1, 1 ).normalize();
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
		navigator.webkitGetUserMedia({video:true}, function(stream){
			video.src	= URL.createObjectURL(stream);
		}, function(error){
			alert('you got no WebRTC webcam');
		});		
	}else if(navigator.mozGetUserMedia){
		navigator.mozGetUserMedia({video:true}, function(stream){
			video.src	= URL.createObjectURL(stream);
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
		geometry,
		xsize, ysize;

	ux = 1 / xgrid;
	uy = 1 / ygrid;

	xsize = 960 / xgrid;
	ysize = 540 / ygrid;

	var parameters = { color: 0xffffff, map: texture };

	cube_count = 0;

	for (var i = 0; i < xgrid; i ++ )
	for (var j = 0; j < ygrid; j ++ ) {

		ox = i;
		oy = j;

		geometry = new THREE.BoxGeometry( xsize, ysize, xsize );

		change_uvs( geometry, ux, uy, ox, oy );

		materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );

		material = materials[ cube_count ];

		material.hue = i/xgrid;
		material.saturation = 1 - j/ygrid;

		material.color.setHSL( material.hue, material.saturation, 0.5 );

		mesh = new THREE.Mesh( geometry, material );

		mesh.position.x =   ( i - xgrid/2 ) * xsize;
		mesh.position.y =   ( j - ygrid/2 ) * ysize;
		mesh.position.z = 0;

		mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

		scene.add( mesh );

		mesh.dx = 0.001 * ( 0.5 - Math.random() );
		mesh.dy = 0.001 * ( 0.5 - Math.random() );

		meshes[ cube_count ] = mesh;

		cube_count += 1;

	}

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
	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

	camera.lookAt( scene.position );

	for (var i = 0; i < cube_count; i ++ ) {

		material = materials[ i ];

		h = ( 360 * ( material.hue + time ) % 360 ) / 360;
		material.color.setHSL( h, material.saturation, 0.5 );

	}

	if ( counter % 1000 > 20 ) {

		for (var i = 0; i < cube_count; i ++ ) {

			mesh = meshes[ i ];

			mesh.rotation.x += 10 * mesh.dx;
			mesh.rotation.y += 10 * mesh.dy;

			mesh.position.x += 200 * mesh.dx;
			mesh.position.y += 200 * mesh.dy;
			mesh.position.z += 400 * mesh.dx;

		}

	}

	if ( counter % 1000 === 0 ) {

		for (var i = 0; i < cube_count; i ++ ) {

			mesh = meshes[ i ];

			mesh.dx *= -1;
			mesh.dy *= -1;

		}

	}

	counter ++;

	renderer.clear();
	composer.render();

}