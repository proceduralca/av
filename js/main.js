// Procedural.ca!

window.onload = init;
window.onresize = resize;
window.fullscreenchange = resize;
window.focus = resize;

let scene, camera, renderer, ui, fft;
let mesh, master, moon;

let palette = [];

palette[0] = 0xff2e62 // HIGHLIGHT
palette[1] = 0x7c3f58 // SHADOW
palette[2] = 0xfffc4f // ACCENT
palette[3] = 0xf9a875 // ACCENT
palette[4] = '#7c3f58'

let color;
let frame = 0;
let orbit;

function init(){

	scene = new THREE.Scene();

// 		scene.up = new THREE.Vector3( 0,0,1 );

	camera = new THREE.PerspectiveCamera();

		camera.up = new THREE.Vector3( 0,0,1 );
		camera.position.y = 7;
// 		camera.position.z = 20;

		camera.lookAt( 0, 0, 0 );
		camera.fov   = 60;
		camera.near  = 0.0001;
		camera.far   = 3000;
		camera.name = 'Camera';

	scene.add( camera );

	renderer = new THREE.WebGLRenderer({

		logarithmicDepthBuffer: true,
		antialias: false

	});

		color = new THREE.Color( palette[2] );

		renderer.setClearColor( color );
		renderer.domElement.id = 'RENDERER';
		document.body.appendChild( renderer.domElement );

	ui = new UI( './img/unifont.min.png', 16, 32, 64 );

// 	ui.col = 12;
// 	ui.row = 20;

	fft = new FFT();

	resize();

	let geometry = new THREE.IcosahedronGeometry( 1, 0 );

	master = geometry.clone();

	let material = new THREE.MeshLambertMaterial({

		wireframe: false,
		color: palette[0]

	});
	
	material.transparent = true;
	material.opacity = 0.8;
// 	material.blending = THREE.AdditiveBlending;
	
	mesh = new THREE.Mesh( geometry, material );

// 	mesh.position.z += 5;
// 	mesh.position.x += 5;

	moon = new THREE.Mesh(

		new THREE.IcosahedronGeometry( 0.25, 0 ),
		new THREE.MeshLambertMaterial( { color: palette[1] })

	);

	moon.position.copy( geometry.vertices[ 11 ] );
	moon.position.multiplyScalar( 3 );

	scene.add( moon );

	orbit = new THREE.Vector3( 0,1,1 );
	orbit.normalize();

	let light = new THREE.HemisphereLight(  0xffffff, color );

		scene.add( mesh )
		scene.add( light )

	ui.onload = function(){

		fft.connect();
		resize();
		main();

	}


}

function resize(){
	
	let width	= window.innerWidth;
	let height	= window.innerHeight;

	renderer.clear();
	renderer.setSize( width, height );

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	
	ui.resize( width, height, 1 );

}

function main(){

	ui.clear();
	window.requestAnimationFrame( main );

	ui.preventRedraw();

	ui.print( '_', '1', '2' );

	ui.print('新 事 業 _', '1', '1.0-2', 1 );


	ui.update();

	if( fft.active ){

		fft.update();

		moon.position.applyAxisAngle( camera.up, 0.02 );
		moon.position.applyAxisAngle( orbit, 0.02 );

// 		moon.rotateX( ( fft.channel[3] / 128 ) * 0.1 );
// 		moon.rotateY( ( fft.channel[6] / 128 ) * 0.1 );
// 		moon.rotateZ( ( fft.channel[1] / 128 ) * 0.1 );

		for( let i = 0; i < master.vertices.length; i++ ){

			let v = master.vertices[i].clone();
			v.multiplyScalar( 1+fft.channel[i]/128 );
			mesh.geometry.vertices[i].copy( v );

// 			ui.print( String.fromCharCode(

// 				Math.floor( 1+fft.channel[0]  + 650+i*20),

// 			), '2+' + i*16 + 'p', '0.25');

		}


		let l = Math.floor( fft.channel[1] / 20 );

		for( let i = 0; i < l; i++ ){

			ui.print( '♥', 16+i*16, '1' );

		}

		ui.print( String.fromCharCode(

			Math.floor( 1+fft.channel[0]  + 650),
			Math.floor( 1+fft.channel[5] + 650+90),
			Math.floor( 1+fft.channel[8] /20 + 650+20 ),

		), '2', '4');

		let string = '❄';
		let code = string.charCodeAt( 0 );

		ui.print( String.fromCharCode( code + Math.floor( fft.channel[7] / 5 ) ), '1.0-3', '1.0-3', 2);

		ui.style = 1;

		ui.print( '手 続 き 型', '1', '0.66', 2 );

		code = ('☿').charCodeAt( 0 )
		ui.print( String.fromCharCode( code + Math.floor( fft.channel[10] / 20 ) ) , '1.0-6', '1', 6 );
		ui.style = 0;

		}

		mesh.geometry.verticesNeedUpdate = true;

		camera.position.applyAxisAngle( camera.up, 0.01 );
		camera.lookAt( mesh.position );
				
		renderer.render( scene, camera );

}