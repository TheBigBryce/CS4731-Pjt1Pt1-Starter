var viewbox;
let lines;
var canvas;
var xml;
let gl;
var program;
function main() {
    canvas = document.getElementById('webgl');
    // Retrieve <canvas> element
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("wheel", mouseScroll, false);
    const fileID = document.getElementById("fileupload");
    fileID.addEventListener("change", getxml, false);


}

function getxml(event){
    let reader = readTextFile(event);
    //Reading svg input when it is loaded
    reader.onload = function () {
        xml = new DOMParser().parseFromString(reader.result.toString(), "image/svg+xml");
        lines = xmlGetLines(xml, hexToRgb("#000000"));
        viewbox = (xmlGetViewbox(xml, (0, 0, canvas.width, canvas.height)));
        setup();
    }
}
function setup(){

    gl = WebGLUtils.setupWebGL(canvas, undefined);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines[0]), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines[1]), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.LINES, 0, lines[0].length);

    //This is how we handle extents
    var thisProj = ortho(-1, 400, -1, 1, 0.1, 100);

    var projMatrix = gl.getUniformLocation(program, 'projMatrix');
    gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Necessary for animation
    render();

}

function render() {
   // var rotMatrix = rotate(0, vec3(1.0, 1.0, 1.0));
   // var translateMatrix = translate(0, 0, 0);
   // var ctMatrix = mult(translateMatrix, rotMatrix);

    var eye = vec3(0.0, 0.0, 2.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    var cameraMatrix = lookAt(eye, at, up);

  //  var ctMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
  //  gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

    var cameraMatrixLoc = gl.getUniformLocation(program, "cameraMatrix");
    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix));


    gl.clear( gl.COLOR_BUFFER_BIT);

    // create the buffer
    var indexBuffer = gl.createBuffer();

    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Fill the current element array buffer with data
    var indices = [0,1,3,2];

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );



    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT,0);

}

/**
 * Handles what happens when the mouse moves
 * @param event the mouse moving event
 */
function mouseMove(event){
    console.log(event);
}
/**
 * Handles what happens when the mouse clicks
 * @param event the mouse clicking event
 */
function mouseDown(event){
    console.log(event);

}
/**
 * Handles what happens when the mouse scrolls
 * @param event the mouse scrolling event
 */
function mouseScroll(event){
    console.log(event);
}
