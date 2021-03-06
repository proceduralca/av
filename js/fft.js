function FFT(){

const scope = this;

let audio;
this.analyser;
let stream;
let source;
let distortion;
let data;
let connected = false;

this.gain;
this.clip = 1;

let size = 512;

this.size = size;
this.length;
this.data;

this.channel	= [];
this.channel.length = 12;
this.channel.fill( 0 );
this.averages	= []

this.active  = false;
this.console = 'WAITING FOR INPUT'

this.player;

	this.connect = function( _size = size ){

		scope.size = _size;

		if( navigator.mediaDevices ){

			navigator.mediaDevices.getUserMedia({ audio: true, video: false })
			.then(function(stream) {

					audio = new ( window.AudioContext || window.webkitAudioContext )();

					distortion = audio.createWaveShaper();

					scope.analyser = audio.createAnalyser( source )

					source = audio.createMediaStreamSource( stream );

					source.connect( scope.analyser );

					scope.analyser.fftSize = scope.size;

					scope.length = scope.analyser.frequencyBinCount;

					data = new Uint8Array( scope.analyser.frequencyBinCount );

					scope.active = true;

					scope.console = 'LISTENING :)'

					connected = true;

			})
			.catch(function(err) {

					scope.console = 'INPUT ERROR :('

			});

		}
		else{

			scope.console = 'FEATURE NOT SUPPORTED'

		}

	}

	this.load = function( _size = scope.size ){

			scope.size = _size;

			audio = new ( window.AudioContext || window.webkitAudioContext )();

			scope.player = document.getElementById("audio_player");
			var source = audio.createMediaElementSource( scope.player );

			scope.gain = audio.createGain();
			source.connect( scope.gain );
// 			scope.gain.connect(audio.destination);
			scope.gain.gain.value = 0.7
			source.connect( audio.destination );

// 			distortion = audio.createWaveShaper();

			scope.analyser = audio.createAnalyser( scope.gain )
			
			scope.gain.connect( scope.analyser );

			scope.analyser.fftSize = scope.size;

			scope.length = scope.analyser.frequencyBinCount;

			data = new Uint8Array( scope.analyser.frequencyBinCount );

			scope.active = true;
			scope.console = 'LISTENING :)'
			connected = true;
		
	}

	this.autoClip = function( i, n ){

		if( n > 0.1 && i > scope.clip ){

			scope.clip = i;

		}	

	}

	this.bucket = function( i ){

		// Returns a channel position based on the channel length.

		let x = i / scope.clip;

		// The position is eased exponetially in order to capture low frequency details.

		x = x === 1 ? 1 : 1 - Math.pow(4, -10 * x)

		return Math.floor( x * scope.channel.length );

	}

	this.update = function(){

		scope.data = [];

		scope.channel.fill( 0 );

		let averages = scope.channel.slice();

		if( connected ){

      		scope.analyser.getByteFrequencyData( data );

			scope.data = data;

			scope.analyser.smoothingTimeConstant = 0.8;

			ui.preventRedraw();

			// Raw data

			for( let i = 0; i < scope.length; i++ ){

				scope.autoClip( i, data[i] );

				if( i < scope.clip ){

					scope.data[i] = data[i];

					let channel = scope.bucket( i );

					scope.channel[ channel ] += scope.data[i];
					averages[ channel ] ++;

				}

				let x =  ( i ) + 'p'

// 				ui.style = 1;

// 				ui.sprite( 0,0, 1,1, x, '1.0-2-2p', 1, -data[i] );

// 				ui.sprite( 0,0, 1,1, x, '1.0-2', 1, 2 );

// 				ui.sprite( 0,0, 1,1, '2', '1.0-1', scope.clip, 1 )

// 				ui.style = 0;

			}

			for( let i = 0; i < scope.channel.length; i++ ){
				
				let average = ( averages[i] === 0 ) ? 1 : averages[i];
				
				scope.channel[i] /= average;

				ui.sprite( 0,0, 1,1, '2+' + i*12 + 'p', '1.0-3-2p', 3, -scope.channel[i] );
				ui.sprite( 0,0, 1,1, '2+' + i*12 + 'p', '1.0-3+2p', 3, 2 );


			}

		}

	}

}