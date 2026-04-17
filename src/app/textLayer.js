import { Layer } from "../scene/Layer.js";
import { createTextTexture } from "../gl/textures.js";
import { state } from "../scene/state.js";

export function createTextLayer(text, options = {}) {
    const {
        color = "#ffffff",
        font = "48px sans-serif",
        name = "Text (" + text + ")"
    } = options;

    const { canvas, texture, width, height } =
        createTextTexture(state.renderer.gl, text, color, font);

    const layer = new Layer(canvas, name);

    layer.texture = texture;
    layer.width = width;
    layer.height = height;

    layer.type = "text";
    layer.text = text;
    layer.font = font;
    layer.color = color;

    const canvasRef = state.renderer.canvas;
    layer.x = canvasRef.width / 2;
    layer.y = canvasRef.height / 2;

    return layer;
}

export function updateTextLayer(layer, updates) {
    if (layer.type !== "text") return;

    Object.assign(layer, updates);

    const { canvas, texture, width, height } =
        createTextTexture(
            state.renderer.gl,
            layer.text,
            layer.color,
            layer.font
        );

    if (layer.texture) {
        state.renderer.gl.deleteTexture(layer.texture);
    }

    layer.texture = texture;
    layer.width = width;
    layer.height = height;

    layer.dirty = true;

    state.renderer.render();
}