function UI( url, unit = 16, offx = 0, offy = 0 ) {

// 	let url = './img/stagetype.png'
	const scope = this;

	this.renderer = document.createElement('canvas');
	this.renderer.id = 'UI';

	document.body.appendChild(this.renderer);

	const context = this.renderer.getContext('2d');
	this.context = context;

	const bitmap = document.createElement('img');
	bitmap.src = url;

	bitmap.onload = function() {

		scope.connect();
		scope.onload();

	};

	const buffer = document.createElement('canvas');

	this.onload = function() {}

	const font   = [];
	const filter = [];

	font[0] = document.createElement('canvas');
	filter[0] = font[0].getContext('2d');

	font[1] = document.createElement('canvas');
	filter[1] = font[1].getContext('2d');

	// Renderer parameters.

	this.scale = 1;
	this.style = 0;
	
	// Navigation parameters.

	this.col = 16;
	this.row = 16;

	this.width;
	this.height;

	this.color = palette[4];

	const sheet = {

		unit: unit,
		offset: { x: offx, y: offy } 


	}

	// Redrawing variables

	let redraw = false;
	let redrawBuffer = [];
	let buttons = [];

	// Controls

	this.connect = function() {

		context.imageSmoothingEnabled = false;
		context.globalCompositeOperation = 'overlay';
		
		// Set sizes

		let w = bitmap.width - sheet.offset.x;
		let h = bitmap.height - sheet.offset.y

		for( let i in font ){

			font[ i ].width	= w;
			font[ i ].height = h;

		}

		sheet.width	 = w;
		sheet.height = h;

		sheet.cols = Math.floor( w / sheet.unit );
		sheet.rows = Math.floor( h / sheet.unit );

		// Copy font image to new canvas.

		scope.format( 0, '#ff2e62' );
		scope.format( 1, '#0066dd' );

	}

	this.format = function( style = 0, color = '#ffffff' ){

		filter[ style ].beginPath();

		filter[ style ].drawImage(
		bitmap, sheet.offset.x, sheet.offset.y,
		sheet.width, sheet.height, 0, 0, sheet.width, sheet.height
		);

		// Fill text by overlaying a color.

		filter[ style ].globalCompositeOperation = 'source-atop';

		filter[ style ].fillStyle = color;
		filter[ style ].fillRect( 0, 0, sheet.width, sheet.height );
		filter[ style ].globalCompositeOperation = 'source-out';
				
	}

	this.resize = function( width, height, scale ) {

		// Round the devicePixelRatio and resize the viewport
		// to prevent sub-pixel rendering.

		let meta = document.querySelector("meta[name=viewport]")
		let viewport = (1 / window.devicePixelRatio) * Math.round(window.devicePixelRatio);

		let w = Math.floor( window.innerWidth * viewport );

		meta.setAttribute( 

			'content',
			'width=' + w + ', initial-scale=' +
			 viewport + ',maximum-scale=' + '4.0' + ', user-scalable=0');

		// Create scaled width & height targets.

		scope.scale = scale;
		this.width = width;
		this.height = height;

		this.renderer.width = width;
		this.renderer.height = height;

		// Scale the context & disable smoothing.
		this.renderer.style.zoom = scale;
		context.imageSmoothingEnabled = false;

		this.redraw();

	}
	
	this.update = function( inputs ){

		for( let i in inputs ){

		for( let b in buttons ){

			if( inputs[i].x > buttons[b].x * scope.scale &&
			inputs[i].y > buttons[b].y * scope.scale &&
			inputs[i].x < buttons[b].w * scope.scale &&
			inputs[i].y < buttons[b].h * scope.scale &&
			inputs[i].start == true
			){

				buttons[b].funct();
				inputs[i].start = false;
				break;

			}

		}


		}


	}

	this.print = function( str, _x, _y, scale=1 ) {

		let i = 0;

		let x = scope.compile(_x, scope.width, scope.col);
		let y = scope.compile(_y, scope.height, scope.row);

		while (i < str.length) {

			scope.encode(str.charAt(i), x + (i * scope.col * scale), y, scale);
			i++;

		}

		if ( !redraw ) {

			redrawBuffer.push( function() {

				scope.print(str, _x, _y, scale);

			});

		}

	}

	this.text = function( str, _x, _y,  scale=1, length = 0 ){

// 		this.clear( _x, _y, str.length * scope.col, scope.row );

		let i = 0;
		while (i < str.length) {

			scope.encode( str.charAt(i), _x + (i * scope.col * scale), _y, scale );
			i++;

		}

	}

	this.button = function( str, _x, _y, _w, _h, funct, border=true, scale=1 ) {

		let x = scope.compile(_x, scope.width, scope.col);
		let y = scope.compile(_y, scope.height, scope.row);

		let w = scope.compile(_w, scope.width, scope.col);
		let h = scope.compile(_h, scope.height, scope.row);

		if (border) {

			context.drawImage(font[ scope.style ], 0, 0, 1, 1, x, y+h/2, w+1, 1);
			context.drawImage(font[ scope.style ], 0, 0, 1, 1, x, y-h/2, w+1, 1);
			context.drawImage(font[ scope.style ], 0, 0, 1, 1, x, y-h/2, 1, h);
			context.drawImage(font[ scope.style ], 0, 0, 1, 1, x+w, y-h/2, 1, h);

		}

		let i = 0;

		let center = w/2

		while (i < str.length) {

			scope.encode( 

				str.charAt(i),
				x + (i * scope.col ) + w/2 - Math.round( str.length * scope.col )/2 + 2,
				y - scope.row/2,
				scale

			);
			
			i++;

		}

		buttons.push( { x: x, y: y-h/2, w: x+w, h: y+h/2, funct: function(){ funct() } } );

		if ( !redraw ) {

			redrawBuffer.push( function() {

				scope.button(str, _x, _y, _w, _h, funct, border, scale );

			});

		}

	}

	this.line = function( x, y, w, h,) {

		scope.sprite( 0, 0, 1, 1, x, y, w, h );

	}

	this.sprite = function( sx, sy, sw, sh, _x, _y, _w, _h ) {

		let x = scope.compile(_x, scope.width, scope.col);
		let y = scope.compile(_y, scope.height, scope.row);

		let w = scope.compile(_w, scope.width, scope.col);
		let h = scope.compile(_h, scope.height, scope.row);

// 		context.clearRect(x, y, w, h);
		context.drawImage(font[ scope.style ], sx, sy, sw, sh, x, y, w, h);

		if (!redraw) {

			redrawBuffer.push( function() {

				scope.sprite(sx, sy, sw, sh, _x, _y, _w, _h);

			});

		}

	}

	this.backdrop = function(

		c = '#10101099',
		x = 0,
		y = 0,
		w = scope.width,
		h = scope.height

	){

		if( c === false ){

			ui.clear();
			scope.renderer.style.background = 'transparent';

		}
		else{

		ui.clear();
		scope.renderer.style.background = c;

		}
	}

	this.preventRedraw = function(){

		redraw = false;
		
	}

	this.redraw = function() {

		redraw = true;

		scope.clear();

		for (let i = 0; i < redrawBuffer.length; i++) {

			redrawBuffer[i]();

		}

		redraw = false;

	}

	this.pad = function( c, x, y, w, h, hold, release ){

		let i = 0;

		release();

		while( i < control.touches.length ){;

			if( control.touches[i].x > x * scope.scale &&
			control.touches[i].y > y * scope.scale &&
			control.touches[i].x < (x+w) * scope.scale &&
			control.touches[i].y < (y+h) * scope.scale
			){

				hold();

			}

		i++;

		}

// 		PAD HITBOX DEBUG
			
			context.drawImage( font[ scope.style ], 0, 0, 1, 1, x+1, y, w-1, 1 );
			context.drawImage( font[ scope.style ], 0, 0, 1, 1, x+1, y+h, w-1, 1 );

			context.drawImage( font[ scope.style ], 0, 0, 1, 1, x+1, y, 1, h );
			context.drawImage( font[ scope.style ], 0, 0, 1, 1, x+w-1, y, 1, h );

		scope.encode( c, x + w/2 - scope.col/2, y+h/2 - scope.row/2 );


	}

	this.clear = function() {

		if ( !redraw ){ redrawBuffer = []; }

		buttons = []; 

		context.clearRect(0, 0, scope.width, scope.height);
		context.beginPath();

	}

	this.delete = function( _x=0, _y=0, _w=renderer.width, _h=renderer.height) {

		let x = scope.compile(_x, scope.width, scope.col);
		let y = scope.compile(_y, scope.height, scope.row);
		let w = scope.compile(_w, scope.width, scope.col);
		let h = scope.compile(_h, scope.height, scope.row);
				
		context.clearRect(x, y, w, h);

	}

	this.encode = function(char, x, y, scale=1) {

		let n = char.charCodeAt(0);

		let sx = (n * sheet.unit) % sheet.width;
		let sy = Math.floor(n / sheet.cols) * sheet.unit;

// 		context.clearRect(x, y, sheet.unit, sheet.unit);
		context.drawImage(

			font[ scope.style ],
			sx, 
			sy,
			sheet.unit,
			sheet.unit,
			x,
			y,
			sheet.unit * scale,
			sheet.unit * scale

			);

	}

	this.float = function( input, sign ){

		let text = Math.floor( Math.abs( input * 100 ) )
		text = text.toString()

		let integer = text.slice( 0,text.length-2 )
		let float 	= text.slice( text.length-2,text.length )

		if( input == 0 ){

			return( '0.00' )

		}
		else{

			if( integer.length == 0 ){
				integer = '0'
			}
			if( float.length < 2 ){
				float += '0'
			}

			if( sign && input > 0 ){
				integer = '+' + integer
			}
			else if( input < 0 ){
				integer = '-' + integer
			}

			text = integer + '.' + float

			return text

		}
	}

	this.compile = function(input, range, unit) {

		let out = 0;

		switch (typeof input) {

		case ('number'):

			out = input;

			break;

		case ('function'):

			out = input();

			break;

		case ('string'):

			let float = false;
			let sign = 1.0;
			let i = 0;
			let n = '';

			while (i < input.length) {

				let c = input.charAt(i);

				if (c === '.') {

					n += c;
					float = true;

				} else if (c === '+') {

					n = (float) ? Number(n) * range : Number(n) * unit;
					n *= sign;
					sign = 1.0;
					out += n;
					float = false;
					n = ''

				} else if (c === '-') {

					n = (float) ? Number(n) * range : Number(n) * unit;
					n *= sign;
					sign = -1.0
					out += n;
					float = false;
					n = ''

				} else if (c === 'p') {

					n = Number(n)
					n *= sign;
					out += n;
					n = ''

				} else if (i === input.length - 1) {

					n += c;
					n = (float) ? Number(n) * range : Number(n) * unit;
					n *= sign;
					out += n;
					n = ''

				} else {

					n += c;

				}

				i++;

			}

			break;

		}

		return out;

	}
}
