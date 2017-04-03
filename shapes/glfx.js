
var container, stats;
var camera, scene, group, renderer;
var parts;
var mat;

var startTime=Date.now();
var startIdx=0;

var ww=window.innerWidth;
var wh=window.innerHeight;

// % of vertical height to cover
var cover=0.75;

var active;

var Circles={

	name:"circles",

	prepare:function() {

		group = new THREE.Object3D();
		group.rotation.set(0,0,0.15);

		var tex = THREE.ImageUtils.loadTexture('circle.png');

    		mat=new THREE.MeshBasicMaterial({ transparent: true, map: tex });

		var pw=36;

		var rw=Math.round(ww/pw)*1.8&~0x1;
		var rh=wh/pw*cover*1.2;

		var rt=rw*rh;

		var rowHeight=pw-3;
		var colWidth=pw-6;

		var sx=(rw*colWidth)/2;
		var sy=wh/2;

		// Compensate for the 15' tilt
		sy+=ww/2*Math.tan(15*Math.PI/180);

		parts=[];
		for (var i=0;i<rt;i++) {

			var row=Math.floor(i/rw);
			var col=i%rw;

			// Offset row to straighten
			row+=Math.floor(col/8);

			var cx=col*colWidth;
			var cy=row*rowHeight;
			var oy=(i%2)*pw/2;

			var pg=new THREE.PlaneGeometry(pw,pw);

			parts[i]=new THREE.Mesh(pg,mat)
			parts[i].tx=-sx+cx;
			parts[i].ty=sy-(cy+oy);

			parts[i].position.x=parts[i].tx;
			parts[i].position.y=parts[i].ty-(wh*2);

			parts[i].st=row*50+col*15;

			group.add( parts[i] );
		}

		scene.add(group);
	},

	animate:function(now) {

		for (var i=startIdx;i<parts.length;i++) {

			var st=Math.max(0,now-(startTime+parts[i].st));
			var t=Math.min(1.0,st/5000);

			parts[i].position.set(
				parts[i].position.x*(1-t)+parts[i].tx*t,
				parts[i].position.y*(1-t)+parts[i].ty*t,
				0);
		}
	}

};

var Squares={

	name:"squares",

	prepare:function() {

		group = new THREE.Object3D();

		var tex = THREE.ImageUtils.loadTexture('square64.png');

    		mat=new THREE.MeshBasicMaterial({ transparent: true, map: tex });

		var pw=32;

		var rw=Math.round(ww/pw)*1.4&~0x1;
		var rh=wh/pw*cover;
		var rt=rw*rh;

		var colWidth=pw-3;
		var rowHeight=pw-3;

		var sx=(rw*colWidth)/2;
		var sy=wh/2;

		parts=[];
		for (var i=0;i<rt;i++) {

			var row=Math.floor(i/rw);
			var col=i%rw;

			var timingRow=row;

			// Offset row/col to straighten
			row+=Math.floor(col/2.5);
			col-=Math.floor(row/2);

			var cx=col*colWidth;
			var cy=row*rowHeight;
			var ox=row*colWidth/2;
			var oy=col*-rowHeight/2;

			var pg=new THREE.PlaneGeometry(pw,pw);

			parts[i]=new THREE.Mesh(pg,mat)
			parts[i].tx=-sx+cx+ox;
			parts[i].ty=sy-(cy+oy);

			parts[i].position.x=ww*(row%2?-1:+1);
			parts[i].position.y=parts[i].ty;

			parts[i].st=timingRow*30;

			group.add( parts[i] );
		}

		scene.add(group);
	},

	animate:function(now) {

		for (var i=startIdx;i<parts.length;i++) {

			var st=Math.max(0,now-(startTime+parts[i].st));
			var t=Math.min(1.0,st/5000);

			parts[i].position.set(
				parts[i].position.x*(1-t)+parts[i].tx*t,
				parts[i].position.y*(1-t)+parts[i].ty*t,
				0);
		}
	}

};

function init() {

	canvas = document.querySelector( '.background-canvas' );

	camera = new THREE.OrthographicCamera(
		Math.round(ww / - 2),
		Math.round(ww / 2),
		Math.round(wh / 2),
		Math.round(wh / - 2),
		- 500,
		1000 );
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 0;

	scene = new THREE.Scene();

	var fx=[Circles,Squares];

	active=fx[Math.floor(Math.random()*2)];
	active.prepare();

	// Grid
	THREE.ImageUtils.crossOrigin = '';

	// Renderer
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias:false });
	renderer.setClearColor( 0xffffff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( ww, wh );

	window.addEventListener( 'resize', onWindowResize, false );

	document.querySelector('#fxActive').innerHTML=active.name;
}

function debugMode() {
	ww*=0.8;
	wh*=0.8;
	debugExtents();
	document.querySelector('.copy').style="display:none"
}

function debugExtents() {

	var x=-Math.round(ww/2);
	var y=-Math.round(wh/2);

	var r = new THREE.Shape();

	r.moveTo( x, y );
	r.lineTo( x+ww, y );
	r.lineTo( x+ww, y+wh );
	r.lineTo( x, y+wh );
	r.lineTo( x, y );

	r.autoClose = true;
	var line = new THREE.Line( r.createPointsGeometry(), new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
	scene.add( line );
}

function onWindowResize() {

	camera.left = window.innerWidth / - 2;
	camera.right = window.innerWidth / 2;
	camera.top = window.innerHeight / 2;
	camera.bottom = window.innerHeight / - 2;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function animate() {

	// Parallax scrolling
	group.position.setY(Math.max(0,window.pageYOffset)*0.3);

	requestAnimationFrame( animate );
	render();
}

function snap() {
	for (var i=0;i<parts.length;i++) {
		parts[i].position.set(parts[i].tx,parts[i].ty,0);
	}
}

function render() {
	var now=Date.now();
	mat.opacity=Math.min(1.0,mat.opacity+0.02);
	active.animate(now);
	renderer.render( scene, camera );
}

// Use marker class 'intro' to trigger animation
var introAnimation=document.querySelector('body.intro');

init();
if (introAnimation)
{
	animate();
}
else
{
	snap();
	mat.opacity=0.0;
	animate();
}
