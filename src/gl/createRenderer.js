import * as shader from "../assets/shaderSrc.js";
import { createTextureFromImage } from "../gl/textures.js";
import { BLEND_MODES, BLEND_MODE_INDEX } from "../assets/blendModes.js";
import { syncUIToLayer, requestLayersPanelRefresh } from "../scene/layersPanel.js";

function applyBlendMode(gl, mode) {
    const blend = BLEND_MODES[mode] || BLEND_MODES["source-over"];
    blend.func(gl);
}

export function createGL(canvas) {
    const gl = canvas.getContext("webgl2", {
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
    });

    if (!gl) throw new Error("WebGL2 not supported");

    return gl;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) {
        throw new Error("Shader compilation failed");
    }

    const program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }

    return program;
}

function createQuadBuffer(gl) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        //Centered unit quad.
        -0.5, -0.5, 0, 0,
        0.5, -0.5, 1, 0,
        -0.5, 0.5, 0, 1,

        -0.5, 0.5, 0, 1,
        0.5, -0.5, 1, 0,
        0.5, 0.5, 1, 1,
    ]), gl.STATIC_DRAW);

    return buffer;
}

export function createRenderer(gl, state, canvas) {
    // ===== GL PROGRAMS =====
    const pass1Program = createProgram(gl, shader.fullscreenVertex, shader.pass1Fragment);
    const pass1Uniforms = getUniforms(gl, pass1Program, [
        "u_image",
        "u_brightness",
        "u_contrast",
        "u_saturation",
        "u_rgb",
        "u_blur",
        "u_texelSize",
    ]);

    const pass2Program = createProgram(gl, shader.pass2Vertex, shader.pass2Fragment);
    const pass2Uniforms = getUniforms(gl, pass2Program, [
        "u_layer",
        "u_backbuffer",
        "u_translation",
        "u_rotation",
        "u_scale",
        "u_resolution",
        "u_imageSize",
    ]);

    const pass3Program = createProgram(gl, shader.fullscreenVertex, shader.pass3Fragment);
    const pass3Uniforms = getUniforms(gl, pass3Program, [
        "u_blendMode",
        "u_opacity",
    ]);

    const screenProgram = createProgram(gl, shader.fullscreenVertex, shader.fullscreenFragment);
    const screenUniforms = getUniforms(gl, screenProgram, [
        "u_image",
    ]);

    // ===== BUFFERS =====
    const buffer = createQuadBuffer(gl);
    const pass1VAO = createVAO(gl, buffer);
    const pass2VAO = createVAO(gl, buffer);
    const pass3VAO = createVAO(gl, buffer);

    // ===== FRAMEBUFFERS =====
    const fboA = gl.createFramebuffer();
    const fboB = gl.createFramebuffer();

    const texA = createTextureTarget(gl);
    const texB = createTextureTarget(gl);

    attach(texA, fboA);
    attach(texB, fboB);

    // ===== THUMBNAIL BUFFER =====
    const THUMB_SIZE = 64;
    const thumbFBO = gl.createFramebuffer();
    const thumbTex = createTextureTarget(gl, THUMB_SIZE, THUMB_SIZE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, thumbFBO);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        thumbTex,
        0
    );
    attach(thumbTex, thumbFBO);

    // ===== RESOURCE HELPERS =====
    function attach(tex, fbo) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            tex,
            0
        );
    }

    function createTexture(img) {
        return createTextureFromImage(gl, img);
    }

    function createTextureTarget(gl, w = 1, h = 1) {
        const tex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            w,
            h,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return tex;
    }

    function createVAO(gl, buffer) {
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vao;
    }

    function ensureLayerResources(layer) {
        layer.processedTex = gl.createTexture();
        layer.processedFbo = gl.createFramebuffer();

        gl.bindTexture(gl.TEXTURE_2D, layer.processedTex);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            layer.width,
            layer.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.processedFbo);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            layer.processedTex,
            0
        );

        layer.transformTex = gl.createTexture();
        layer.transformFbo = gl.createFramebuffer();

        gl.bindTexture(gl.TEXTURE_2D, layer.transformTex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            canvas.width,
            canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.transformFbo);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            layer.transformTex,
            0
        );
    }

    // ===== RENDERING =====	
    function runPass1(layer) {
        if (!layer.processedTex || !layer.processedFbo) {
            ensureLayerResources(layer);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.processedFbo);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error("Framebuffer incomplete:", status);
            return;
        }

        gl.viewport(0, 0, layer.width, layer.height);

        gl.useProgram(pass1Program);
        gl.bindVertexArray(pass1VAO);

        gl.disable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, layer.texture);
        gl.uniform1i(pass1Uniforms.u_image, 0);

        gl.uniform1f(pass1Uniforms.u_brightness, layer.brightness / 100);
        gl.uniform1f(pass1Uniforms.u_contrast, layer.contrast / 100);
        gl.uniform1f(pass1Uniforms.u_saturation, layer.saturation / 100);

        gl.uniform3f(
            pass1Uniforms.u_rgb,
            layer.red / 100,
            layer.green / 100,
            layer.blue / 100
        );

        gl.uniform1f(pass1Uniforms.u_blur, layer.gblur || 0);
        gl.uniform2f(pass1Uniforms.u_texelSize, 1 / layer.width, 1 / layer.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        layer.dirty = false;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function runPass2(layer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.transformFbo);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(pass2Program);
        gl.bindVertexArray(pass2VAO);

        gl.disable(gl.BLEND);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, layer.processedTex);
        gl.uniform1i(pass2Uniforms.u_layer, 0);

        gl.uniform2f(pass2Uniforms.u_translation, layer.x, layer.y);
        gl.uniform1f(pass2Uniforms.u_rotation, layer.rotation);
        gl.uniform2f(pass2Uniforms.u_scale, (layer.scale * layer.scaleX), (layer.scale * layer.scaleY));

        gl.uniform2f(pass2Uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform2f(pass2Uniforms.u_imageSize, layer.width, layer.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function runPass3() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(pass3Program);
        gl.bindVertexArray(pass3VAO);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (const layer of state.layers) {
            if (!layer.transformTex) continue;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, layer.transformTex);
            gl.uniform1i(pass3Uniforms.u_layer, 0);

            gl.uniform1f(pass3Uniforms.u_opacity, layer.opacity / 100);

            const mode = layer.blend || "source-over";
            switch (mode) {

                case "source-over":
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                case "multiply":
                    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                case "screen":
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
                    break;

                case "add":
                    gl.blendFunc(gl.ONE, gl.ONE);
                    break;

                case "subtract":
                    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
                    break;

                default:
                    console.warn("Unknown blend mode:", mode);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        gl.disable(gl.BLEND);
    }

    function renderThumbnail(layer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, thumbFBO);
        gl.viewport(0, 0, THUMB_SIZE, THUMB_SIZE);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(pass1Program);
        gl.bindVertexArray(pass1VAO);

        if (!layer.processedTex) {
            ensureLayerResources(layer);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, layer.texture);
        gl.uniform1i(pass1Uniforms.u_image, 0);

        gl.uniform1f(pass1Uniforms.u_brightness, layer.brightness / 100);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const pixels = new Uint8Array(THUMB_SIZE * THUMB_SIZE * 4);

        gl.readPixels(
            0, 0,
            THUMB_SIZE, THUMB_SIZE,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );

        layer.uiImage = pixelsToCanvas(pixels, THUMB_SIZE, THUMB_SIZE);

        layer.uiImage.width = THUMB_SIZE;
        layer.uiImage.height = THUMB_SIZE;

        const ctx = layer.uiImage.getContext("2d");

        const imageData = ctx.createImageData(THUMB_SIZE, THUMB_SIZE);
        imageData.data.set(pixels);

        ctx.putImageData(imageData, 0, 0);
    }

    function resizeLayerTargets(layer) {
        if (!layer.transformTex) return;

        gl.bindTexture(gl.TEXTURE_2D, layer.transformTex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            canvas.width,
            canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
    }

    function resizeTargets() {
        for (const tex of [texA, texB]) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                canvas.width,
                canvas.height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
            );
        }

        for (const layer of state.layers) {
            resizeLayerTargets(layer);
        }
    }

    function render() {
        for (const layer of state.layers) {
            if (layer.dirty) {
                runPass1(layer);
                renderThumbnail(layer);
            }
            runPass2(layer);
        }

        requestLayersPanelRefresh();

        runPass3();
    }

    return {
        gl,
        canvas,
        render,
        createTexture,
        resizeTargets,
    };
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function getUniforms(gl, program, names) {
    const out = {};
    for (const name of names) {
        out[name] = gl.getUniformLocation(program, name);
    }
    return out;
}

function pixelsToCanvas(pixels, w, h) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = w;
    canvas.height = h;

    const imageData = ctx.createImageData(w, h);
    imageData.data.set(pixels);

    ctx.putImageData(imageData, 0, 0);

    return canvas;
}