//Source of code: https://www.youtube.com/embed/3yLL9ADo-ko
// Vertex shader program
var VSHADER_SOURCE =
[
'precision mediump float;',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main() {',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

// Fragment shader program
var FSHADER_SOURCE =
[
'precision mediump float;',
'varying vec3 fragColor;',
'void main() {',
'  gl_FragColor = vec4(fragColor,1.0);',
'}'
].join('\n');


var canvas = document.getElementById('myCanvas');
//var gl = getWebGLContext(canvas);
//var gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true});
var gl = canvas.getContext('webgl');

function main()
{
	console.log("this is working");	
	if(!gl)
	{
		console.log("WebGl not supported, falling back on experimental-webgl");
		gl = canvas.getContext('experimental-webgl');
	}
	
	if(!gl)
	{
		alert("Your browser does not support WebGl");
	}
	
	gl.clearColor(0.75,0.85,0.8,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	
	gl.validateProgram(program);
	if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	
	//
	//Create buffer
	//
	
	/*
	var triangleVertices = 
	[//X,Y,Z              R,G,B
		0.0,0.5,0.0,      1.0,1.0,0.0,
		-0.5,-0.5,0.0,    0.7,0.0,1.0,
		0.5,-0.5,0.0,     0.1,1.0,0.6
	];
	*/
	
	var boxVertices = 
	[//X,Y,Z             R,G,B
		//Top
		-1.0,1.0,-1.0,   0.5,0.5,0.5,
		-1.0,1.0,1.0,    0.5,0.5,0.5,
		1.0,1.0,1.0,     0.5,0.5,0.5,
		1.0,1.0,-1.0,    0.5,0.5,0.5,
		
		//Left
		-1.0,1.0,1.0,    0.75,0.25,0.5,
		-1.0,-1.0,1.0,   0.75,0.25,0.5,
		-1.0,-1.0,-1.0,  0.75,0.25,0.5,
		-1.0,1.0,-1.0,   0.75,0.25,0.5,
		
		//Right
		1.0,1.0,1.0,     0.25,0.25,0.75,
		1.0,-1.0,1.0,    0.25,0.25,0.75,
		1.0,-1.0,-1.0,   0.25,0.25,0.75,
		1.0,1.0,-1.0,    0.25,0.25,0.75,
		
		//Front
		1.0,1.0,1.0,     1.0,0.0,0.15,
		1.0,-1.0,1.0,    1.0,0.0,0.15,
		-1.0,-1.0,1.0,   1.0,0.0,0.15,
		-1.0,1.0,1.0,    1.0,0.0,0.15,
		
		//Back
		1.0,1.0,-1.0,    0.0,1.0,0.15,
		1.0,-1.0,-1.0,   0.0,1.0,0.15,
		-1.0,-1.0,-1.0,  0.0,1.0,0.15,
		-1.0,1.0,-1.0,   0.0,1.0,0.15,
		
		//Bottom
		-1.0,-1.0,-1.0,  0.5,0.5,1.0,
		-1.0,-1.0,1.0,   0.5,0.5,1.0,
		1.0,-1.0,1.0,    0.5,0.5,1.0,
		1.0,-1.0,-1.0,   0.5,0.5,1.0
	];
	
	var boxIndices = 
	[
		//Top
		0,1,2,
		0,2,3,
		
		//Left
		5,4,6,
		6,4,7,
		
		//Right
		8,9,10,
		8,10,11,
		
		//Front
		13,12,14,
		15,14,12,
		
		//Back
		16,17,18,
		16,18,19,
		
		//Bottom
		21,20,22,
		22,20,23
	];
	
	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(boxVertices), gl.STATIC_DRAW);
	
	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(boxIndices),gl.STATIC_DRAW);
	
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, //Attribute location
		3, //Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
		0 //offset from the beginning of a single vertex to this attribute
	);
	
	gl.vertexAttribPointer(
		colorAttribLocation, //Attribute color location
		3, //Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
		3*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
	);
	
	
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);	
	
	gl.useProgram(program);
	
	var matWorldUniformLocation = gl.getUniformLocation(program,'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program,'mView');
	var matProjUniformLocation = gl.getUniformLocation(program,'mProj');
	
	var worldMatrix = new Matrix4();
	var viewMatrix = new Matrix4();
	var projMatrix = new Matrix4();
	
	worldMatrix.setIdentity();
	viewMatrix.lookAt(0,0,-8,0,0,0,0,1,0);
	projMatrix.setPerspective(45,canvas.width/canvas.height,1, 100);

	gl.uniformMatrix4fv(matWorldUniformLocation,gl.FALSE, worldMatrix.elements);
	gl.uniformMatrix4fv(matViewUniformLocation,gl.FALSE, viewMatrix.elements);
	gl.uniformMatrix4fv(matProjUniformLocation,gl.FALSE, projMatrix.elements);
	
	
	//
	// Main render loop
	//
	
	var identityMatrix = new Matrix4();
	identityMatrix.setIdentity();
	var angle = 0;
	var loop = function()
	{
		angle = performance.now()/12;
		worldMatrix.setRotate(angle,0,1,0);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE,worldMatrix.elements);
		gl.clearColor(0.75,0.85, 0.8,1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

}