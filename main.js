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
        const defaultview = [-1,-1,1,1];
        viewbox = xmlGetViewbox(xml, defaultview);
        setup();
    }
}
function setup(){

    gl = WebGLUtils.setupWebGL(canvas, undefined);

    gl.clearColor(255, 255, 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

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
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines[1]), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    //This is how we handle extents
    if(Math.max(viewbox[2],viewbox[3]) ===viewbox[2]){
        gl.viewport(0, 0, canvas.width, ((viewbox[3]*canvas.height)/viewbox[2]));
        console.log(((viewbox[3]*canvas.height)/viewbox[2]));

    }
    else {
        gl.viewport(0, 0, ((viewbox[2] * canvas.width) / viewbox[3]), canvas.height);
        console.log(((viewbox[2] * canvas.width) / viewbox[3]));

    }
    var translatemat = translate( 0, 0, 0);
    var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrix,false, flatten(translatemat));



    render();

}

function render() {

    var thisProj = ortho(viewbox[0], viewbox[2]+viewbox[0], viewbox[1]+viewbox[3], viewbox[1], -1, 1);
    var projMatrix = gl.getUniformLocation(program, 'projMatrix');
    gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));

    gl.drawArrays(gl.LINES, 0, lines[0].length);
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
