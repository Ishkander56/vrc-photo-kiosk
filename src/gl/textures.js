export function createTextureFromImage(gl, img) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
    );

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return tex;
}

export function createTextTexture(gl, text, color, font) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = font;
    const metrics = ctx.measureText(text);

    const ascent = metrics.actualBoundingBoxAscent || 200;
    const descent = metrics.actualBoundingBoxDescent || 50;

    const width = Math.ceil(metrics.width);
    const height = Math.ceil(ascent + descent);

    canvas.width = width;
    canvas.height = height;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "alphabetic";

    ctx.fillText(text, 0, ascent);

    return {
        canvas,
        texture: createTextureFromImage(gl, canvas),
        width,
        height,
    };
}