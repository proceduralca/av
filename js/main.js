// Procedural.ca!

window.onload = init;
window.onresize = function(){ resize() };
window.fullscreenchange = resize;
window.focus = resize;

audio_file = document.getElementById( 'audio_file' )

console.log( audio_file )

audio_file.onchange = function(){

  let files = this.files;
  let file = URL.createObjectURL(files[0]); 
              audio_player.src = file;

  audio_player.play();

	fft.load( 256 );

};

let scene, camera, renderer, ui, fft, control;
let mesh, master, moon, wireframe, grid;

let palette = [];

let state = 0;

palette[0] = 0xff2e62 // HIGHLIGHT
palette[1] = 0x7c3f58 // SHADOW
palette[2] = 0xfffc4f // ACCENT
palette[3] = 0xf9a875 // ACCENT
palette[4] = '#7c3f58'

let color;
let frame = 0;
let orbit;

let offset;
let offsetTarget;
let up;
let upTarget;

function init(){

	scene = new THREE.Scene();

// 		scene.up = new THREE.Vector3( 0,0,1 );

	camera = new THREE.PerspectiveCamera();

		camera.up = new THREE.Vector3( 0,0,1 );
		camera.position.y = 7;

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

	control = new Control();
	control.connect();

// 	ui.col = 12;
// 	ui.row = 20;

	fft = new FFT();

	let geometry = new THREE.IcosahedronGeometry( 1, 0 );

	master = geometry.clone();

	let material = new THREE.MeshLambertMaterial({

		wireframe: false,
		color: palette[0]

	});
	
	material.transparent = true;
	material.opacity = 0.9;
// 	material.blending = THREE.AdditiveBlending;
	
	mesh = new THREE.Mesh( geometry, material );

// 	mesh.position.z += 5;
// 	mesh.position.x += 5;

	moon = new THREE.Mesh(

		new THREE.IcosahedronGeometry( 0.25, 0 ),
		new THREE.MeshLambertMaterial( { color: palette[1] })

	);

	moon.material.shading = THREE.FlatShading;
	moon.position.copy( geometry.vertices[ 11 ] );
	moon.position.multiplyScalar( 3 );

	scene.add( moon );

	orbit = new THREE.Vector3( 0,1,1 );
	orbit.normalize();

	wireframe = new THREE.Mesh(

		moon.geometry.clone(),
		new THREE.MeshLambertMaterial( {

			color: palette[1],
			wireframe: true,
		
			} )

		);

	scene.add( wireframe )

	let light = new THREE.HemisphereLight(  0xffffff, color );

		scene.add( mesh )
		scene.add( light )

	ui = new UI( './img/unifont.min.png', 16, 32, 64 );

	ui.onload = function(){

			ui.print('SELECT INPUT', '1', '1',)
			ui.print('  > MIC', '1', '4',)
			ui.print('  > MP3', '1', '8+8p',)
			
			ui.button('', 16, 72, window.innerWidth-32, 48, function(){

				fft.connect( 256 );

			});

			let link = document.createElement('a');

			link.id = 'audio_link'
			link.href = '#'
			link.style.position = 'fixed';
			link.style.top = ( 16*8-8 ) + 'px';
			link.style.left = 16 + 'px';
			link.style.zIndex = 100;
			link.style.display = 'block';

			link.style.width = window.innerWidth-32 + 'px';
			link.style.height = 48 + 'px';

			link.onclick = function(){ pleaseClick( 'audio_file' ); }

			document.body.appendChild( link );

			ui.button('', 16, 72*2, window.innerWidth-32, 48, function(){});

			ui.button('IG MODE ( BROKEN )', '2', '1.0-8', 120, 48, function(){
			
				let w = ( window.innerWidth < 360 ) ? window.innerWidth : 360;
				resize( w, w );

				let x = window.innerWidth/2-w/2
				let y = window.innerHeight/2-w/2

				let canvas = document.getElementById('UI');

				renderer.domElement.style.top = y + 'px'
				renderer.domElement.style.left = x + 'px'

				canvas.style.top = y + 'px'
				canvas.style.left = x + 'px'

			} );

// 		fft.connect();
		resize();
		main();

	}

}


function pleaseClick( id ) {

   var element = document.getElementById( id );

   if( element && document.createEvent ) {

      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, false);
      element.dispatchEvent( event );

		let link = document.getElementById( 'audio_link' );
		document.body.removeChild( link );
   }

}

function resize( _width = window.innerWidth, _height = window.innerHeight){
	
	let width	= _width;
	let height	= _height;

	renderer.clear();
	renderer.setSize( width, height );

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	
	ui.resize( width, height, 1 );

}

function main(){

	window.requestAnimationFrame( main );


	if( fft.active ){

		ui.clear();

		ui.preventRedraw();

		ui.print( '_', '1', '2' );

		ui.print('新 事 業 _', '1', '1.0-2', 1 );

		visuals();

	}

	ui.update( control.touches );

		moon.position.applyAxisAngle( camera.up, 0.02 );
		moon.position.applyAxisAngle( orbit, 0.02 );

		wireframe.position.copy( moon.position );

		camera.position.applyAxisAngle( camera.up, 0.01 );
		camera.lookAt( mesh.position );
				
		renderer.render( scene, camera );


}

function visuals(){

	if( fft.active ){

		fft.update();

		for( let i = 0; i < master.vertices.length; i++ ){

			let v = master.vertices[i].clone();
			v.multiplyScalar( 1+fft.channel[i]/128 );
			mesh.geometry.vertices[i].copy( v );

// 			ui.print( String.fromCharCode(

// 				Math.floor( 1+fft.channel[0]  + 650+i*20),

// 			), '2+' + i*16 + 'p', '0.25');

		}

// 		wireframe.geometry.copy( moon.geometry );
		let s = Math.floor( fft.channel[11]/20 );
		wireframe.scale.set( s, s, s );

		wireframe.rotateX( 0.1 );
		let l = Math.floor( fft.channel[1] / 20 );

		for( let i = 0; i < l; i++ ){

			ui.print( '♥', 16+i*16, '1' );

		}

		ui.print( String.fromCharCode(

			Math.floor( 1+fft.channel[0] / 10  + 650),
			Math.floor( 1+fft.channel[5] / 20 + 650+90),
			Math.floor( 1+fft.channel[8] /20 + 650+20 ),

		), '2', '4');

		let string = '❄';
		let code = string.charCodeAt( 0 );

		ui.print( String.fromCharCode( code + Math.floor( fft.channel[5] / 10 ) ), '1.0-3', '1.0-3', 2);

		ui.style = 1;

		ui.print( '手 続 き 型', '1', '0.66', 2 );

		code = ('☿').charCodeAt( 0 );
		
		ui.print( String.fromCharCode( code + Math.floor( fft.channel[11] / 10 ) ) , '1.0-6', '1', 6 );
		
		ui.style = 0;

		mesh.geometry.verticesNeedUpdate = true;

	}
	

}