import { state } from "../scene/state.js";
import { layerOrder } from "../scene/layerOrder.js";

function createThumbnail(img, size = 48) {
    const canvas = document.createElement("canvas");

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, size, size);

    if (!img) {
        return canvas;
    }

    try {
        ctx.drawImage(img, 0, 0, size, size);
    } catch (e) {
        console.warn("Thumbnail drawImage failed:", img, e);
    }

    return canvas;
}

function moveLayer(from, to) {
    if (from === to) return;

    const layers = state.layers;

    const [moved] = layers.splice(from, 1);
    layers.splice(to, 0, moved);

    layers.forEach((layer, i) => {
        layer.zIndex = i;
    });
	
	state.activeLayer = moved.id;
}

export function refreshLayersPanel() {
    const panel = document.getElementById("layersPanel");

    panel.innerHTML = "";

    state.layers.forEach((l, index) => {
        const row = document.createElement("div");

        row.className = "layer";
        const thumb = l.uiImage || createThumbnail(l.img || l.canvas);
		
		if (l.type === "text") {
			l.uiImage = createThumbnail(l.canvas);
		}

		const label = document.createElement("span");
		label.textContent = l.name;

		label.style.marginLeft = "8px";

		row.appendChild(thumb);
		row.appendChild(label);

        row.draggable = true;
        row.dataset.index = index;

        row.onclick = () => {
			state.activeLayer = l;

			syncUIToLayer(l);
			requestLayersPanelRefresh();
		};

        if (l === state.activeLayer) {
            row.classList.add("active");
        }

        row.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", index);
        };

        row.ondragover = (e) => {
            e.preventDefault();
			row.style.border = "1px solid #aaa";
        };
		
		row.ondragleave = (e) => {
            row.style.border = "1px solid #444";
        };

        row.ondrop = (e) => {
			row.style.border = "1px solid #444";
            e.preventDefault();

            const fromIndex = Number(e.dataTransfer.getData("text/plain"));
            const toIndex = Number(row.dataset.index);

            moveLayer(fromIndex, toIndex);

            requestLayersPanelRefresh();
            state.renderer.render();
        };

        panel.appendChild(row);
    });
}

export function requestLayersPanelRefresh() {
    if (refreshLayersPanel._queued) return;

    refreshLayersPanel._queued = true;

    requestAnimationFrame(() => {
        refreshLayersPanel._queued = false;
        refreshLayersPanel();
    });
}

export function syncUIToLayer(layer) {
    if (!layer) return;

    function set(id, value) {
        document.getElementById(id).value = value;
        document.getElementById(id + "_num").value = value;
    }

	set("scaleX", layer.scaleX);
	set("scaleY", layer.scaleY);
    set("scale", layer.scale);
    set("rotation", (layer.rotation * 180) / Math.PI);

    set("brightness", layer.brightness);
    set("contrast", layer.contrast);
    set("saturation", layer.saturation);

    set("red", layer.red);
    set("green", layer.green);
    set("blue", layer.blue);

    set("opacity", layer.opacity);
    set("blur", layer.gblur ?? 0);
	
	document.getElementById("blend").value = layer.blend;
}

export function toggleLayerVisibility(layerId) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.visible = !layer.visible;
}
