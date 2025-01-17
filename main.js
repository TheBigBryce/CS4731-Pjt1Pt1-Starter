var viewbox;
let lines;
var canvas;
var xml;
let gl;
var program;
let shiftDown=false;
var xCenter;
var yCenter;
var xAvg=0;
var yAvg=0;
let translateX=0;
var translateY=0;
var scaleBy=0;
var rotateBy = 0;
var mouseClicked = false;
var translateMatrix = translate(0,0,0);
function main() {
    canvas = document.getElementById('webgl');
    const fileID = document.getElementById("fileupload");
    fileID.addEventListener("change", getxml, false);


}

function getxml(event) {
    let reader = readTextFile(event);
    //Reading svg input when it is loaded
    reader.onload = function () {
        xml = new DOMParser().parseFromString(reader.result.toString(), "image/svg+xml");
        lines = xmlGetLines(xml, hexToRgb("#000000"));
        const defaultview = [-1, -1, 1, 1];
        viewbox = xmlGetViewbox(xml, defaultview);

        canvas.addEventListener("mousemove", mouseMove, false);
        canvas.addEventListener("mousedown", mouseClick, false);
        canvas.addEventListener("mouseup", mouseUp, false);
        window.addEventListener("wheel", mouseScroll, false);
        window.addEventListener("keydown", keyDown, false);
        window.addEventListener("keyup", keyUp, false);
        setup();
    }
    function  keyDown(event){
        if(event.key==="Shift"){
            shiftDown=true;
        }
        else if (event.key === "r"){
            resetTransformations();
        }
    }
    function keyUp(event){
        if(event.key==="Shift"){
            shiftDown=false;
        }
    }

    function resetTransformations(){
        translateX=0;
        translateY=0;
        scaleBy=1;
        rotateBy=0;
        var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
        let returnToSender = translate(-xAvg/lines[0].length,-yAvg/lines[0].length,0);
        let translateToOrigin = translate(xAvg/lines[0].length,yAvg/lines[0].length,0);
        let resetMatrix=mult(translate(translateX*xCenter/260.0,translateY*yCenter/260.0,0),mult(mult(mult(translateToOrigin, rotateZ(rotateBy)), scalem(scaleBy, scaleBy, 0)),returnToSender));

        gl.uniformMatrix4fv(modelMatrix, false, flatten(resetMatrix));

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, lines[0].length);
    }

    function setup() {

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
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lines[1]), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        //This is how we handle extents
        if (Math.max(viewbox[2], viewbox[3]) === viewbox[2]) {
            gl.viewport(0, 0, canvas.width, ((viewbox[3] * canvas.height) / viewbox[2]));

        } else {
            gl.viewport(0, 0, ((viewbox[2] * canvas.width) / viewbox[3]), canvas.height);

        }


        render();

    }
    function render() {
        var thisProj = ortho(viewbox[0], viewbox[2] + viewbox[0], viewbox[1] + viewbox[3], viewbox[1], -1, 1);
        var projMatrix = gl.getUniformLocation(program, 'projMatrix');
        gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));
        translateX=0;
        translateY=0;
        scaleBy=1;
        rotateBy=0;

        let modelMatrix = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrix, false, flatten(rotateZ(0)));
        xCenter=viewbox[2]/2;
        yCenter=viewbox[3]/2;
        xAvg=0;
        yAvg=0;
        for(var i=0; i<lines[0].length;i++){
           let currentLine = lines[0][i];
           xAvg+=currentLine[0];
           yAvg+=currentLine[1];
        }
        gl.drawArrays(gl.LINES, 0, lines[0].length);
    }

    /**
     * Handles what happens when the mouse moves
     * @param event the mouse moving event
     */
    function mouseMove(event) {

        if (mouseClicked) {
            var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
            translateX += event.movementX;
            translateY += event.movementY;
            translateMatrix = translate((translateX*xCenter)/260,(translateY*yCenter)/260,0);
            let returnToSender = translate(-xAvg/lines[0].length,-yAvg/lines[0].length,0);
            let translateToOrigin = translate(xAvg/lines[0].length,yAvg/lines[0].length,0);
            let fullMatrix=mult(translate(translateX*xCenter/260.0,translateY*yCenter/260.0,0),mult(mult(mult(translateToOrigin, rotateZ(rotateBy)), scalem(scaleBy, scaleBy, 0)),returnToSender));
            gl.uniformMatrix4fv(modelMatrix, false, flatten(fullMatrix));
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.LINES, 0, lines[0].length);
        }
    }

    /**
     * Handles what happens when the mouse releasing
     * @param event the mouse releasing event
     */
    function mouseUp(event) {
        mouseClicked = false;

    }

    /**
     * Handles what happens when the mouse scrolls
     * @param event the mouse scrolling event
     */
    function mouseScroll(event) {
        var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
        let returnToSender = translate(-xAvg/lines[0].length,-yAvg/lines[0].length,0);
        let translateToOrigin = translate(xAvg/lines[0].length,yAvg/lines[0].length,0);
        translateMatrix = translate((translateX*xCenter)/260,(translateY*yCenter)/260,0);
        if(!shiftDown){
            if(event.deltaY>0){
                rotateBy+=1;
            }
            else if(event.deltaY<0){
                rotateBy-=1;
            }
        }
        else{
            if(event.deltaY>0 && scaleBy > 0){
            scaleBy+=.05;
            }
            else if(event.deltaY<0 && scaleBy < 12){
                scaleBy-=.05;
            }
        }
        let fullMatrix=mult(translate(translateX*xCenter/260.0,translateY*yCenter/260.0,0),mult(mult(mult(translateToOrigin, rotateZ(rotateBy)), scalem(scaleBy, scaleBy, 0)),returnToSender));
        gl.uniformMatrix4fv(modelMatrix, false, flatten(fullMatrix));
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, lines[0].length);
    }

    /**
     * Sets the mouseclicked variable to true
     * @param event the mouse clicking event
     */
    function mouseClick(event){
        mouseClicked = true;
    }
}

