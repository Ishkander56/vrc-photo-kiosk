import { state } from "../scene/state.js";
import { Layer } from "../scene/Layer.js";
import { reorderLayers } from "../scene/layerOrder.js";
import { syncUIToLayer, requestLayersPanelRefresh } from "../scene/layersPanel.js";

export function initUploader() {
	requestLayersPanelRefresh();
	
    const input = document.getElementById("upload");

    input.onchange = (e) => {
        const files = [...e.target.files].slice(0, 3);

		for (const layer of state.layers) {
			if (layer.texture) gl.deleteTexture(layer.texture);
			if (layer.processedTex) gl.deleteTexture(layer.processedTex);
			if (layer.transformTex) gl.deleteTexture(layer.transformTex);
			if (layer.processedFbo) gl.deleteFramebuffer(layer.processedFbo);
			if (layer.transformFbo) gl.deleteFramebuffer(layer.transformFbo);
		}

        state.layers = [];

        let loaded = 0;

        let maxW = 0;
        let maxH = 0;

        files.forEach(file => {
            const img = new Image();

            img.onload = () => {
                maxW = Math.max(maxW, img.width);
                maxH = Math.max(maxH, img.height);

                const layer = new Layer(img, file.name);
				layer.img = img;
				layer.thumbnail = null;
                layer.texture = state.renderer.createTexture(img);
				layer.uiImage = canvas;

                state.layers.push(layer);

                loaded++;

                if (loaded === files.length) {
                    state.renderer.canvas.width = maxW;
                    state.renderer.canvas.height = maxH;

                    state.layers = reorderLayers(state.layers);
					
					for (const layer of state.layers) {
						layer.x = state.renderer.canvas.width / 2;
						layer.y = state.renderer.canvas.height / 2;
					}
					
					state.activeLayer = state.layers[state.layers.length - 1]; // Activate the topmost layer (UI > players > environment.)
					syncUIToLayer(state.activeLayer);
                    requestLayersPanelRefresh();
					state.renderer.resizeTargets();
                    state.renderer.render();
                }
            };

            img.src = URL.createObjectURL(file);
        });
    };
}