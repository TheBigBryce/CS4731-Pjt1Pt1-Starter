var viewbox;
var lines;
var canvas;
function main()
{
    canvas=document.getElementById('webgl');;
    // Retrieve <canvas> element
    canvas.addEventListener("mousemove",mouseMove, false);
    canvas.addEventListener("mousedown",mouseDown, false);
    canvas.addEventListener("wheel",mouseScroll, false);
    const fileID = document.getElementById("fileupload");
    fileID.addEventListener("change",handleNextFile, false);
}
function handleNextFile(event){
    let reader = readTextFile(event);
    reader.onload = function(){
        const gigaParse = new DOMParser();
        const xml = gigaParse.parseFromString(reader.result.toString(), "image/svg+xml");
        lines = xmlGetLines(xml, (0,0,0));
        //viewbox = (xmlGetViewbox(xml,(0, 0, canvas.width, canvas.height)));
    }
    let gl = WebGLUtils.setupWebGL(canvas, undefined);
    gl = WebGLUtils.setupWebGL(canvas, undefined);
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    let program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    console.log(lines.length);
    for(let i=0; i<lines.length; i++){
        for(let j=0; j<lines[0].length; j++){
            console.log(lines[i][j]);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines[0]), gl.STATIC_DRAW);
}
function mouseMove(event){
    console.log(event);
}
function mouseDown(event){
    console.log(event);

}
function mouseScroll(event){
    console.log(event);
}
