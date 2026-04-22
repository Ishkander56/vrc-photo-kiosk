import { createGL, createRenderer } from "./src/gl/createRenderer.js";
import { initUploader } from "./src/app/initUploader.js";
import { attachDrag } from "./src/app/drag.js";
import { state } from "./src/scene/state.js";
import { BLEND_MODES } from "./src/assets/blendModes.js";
import { PRESETS } from "./src/assets/presets.js";
import { createTextLayer } from "./src/app/textLayer.js";
import { requestLayersPanelRefresh } from "./src/scene/layersPanel.js";

function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    const defaults = PRESETS["default"]?.roles || {};
	
	const randomizePreset = (presetKey == "random");
	const neverRandomizeKeys = new Set(["gblur", "opacity"]);

    if (!preset) return;

    state.layers.forEach((layer) => {
        const role = layer.role;

        const roleDefaults = defaults[role] || {};
        const roleOverrides = preset.roles?.[role] || {};

        const roleSettings = {
            ...roleDefaults,
            ...roleOverrides
        };

        for (const key in roleSettings) {
			if (randomizePreset & !(neverRandomizeKeys.has(key))) {
				const u = 1 - Math.random();
				const v = Math.random();
				const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
				
				layer[key] = Math.max(0, Math.min(200, Math.round(z * 20 + 100)));
			} else {
				layer[key] = roleSettings[key];
			}
        }

        layer.dirty = true;
    });

    state.renderer.render();
    requestLayersPanelRefresh();
}

function downloadImage(dataURL, filename) {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    a.click();
}

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");

    const gl = createGL(canvas);

    const renderer = createRenderer(gl, state, canvas);
	
	const bindings = [];
	
	state.renderer = renderer;

    initUploader();
    attachDrag(canvas);
	
	canvas.addEventListener('wheel',function(event){
		var newScale = state.activeLayer.scale + ((event.deltaY >= 0) ? -0.1 : 0.1);
		newScale = Math.round(newScale * 100)/100
		state.activeLayer.scale = Math.max(Math.min(newScale, 4), 0);
		state.renderer.render();
		syncControlsFromLayer();
		
		event.preventDefault();
	}, false);
	
	const scaleSlider = document.getElementById("scale");

	scaleSlider.addEventListener("input", (e) => {
		const layer = state.activeLayer;
		if (!layer) return;

		layer.scale = parseFloat(e.target.value);

		state.renderer.render();
	});
	
	const rotationSlider = document.getElementById("rotation");

	rotationSlider.addEventListener("input", (e) => {
		const layer = state.activeLayer;
		if (!layer) return;

		// degrees → radians
		layer.rotation = (parseFloat(e.target.value) * Math.PI) / 180;

		state.renderer.render();
	});
	
	window.centerLayer = function () {
		const layer = state.activeLayer;
		if (!layer) return;

		const canvas = state.renderer.canvas;

		layer.x = canvas.width / 2;
		layer.y = canvas.height / 2;

		state.renderer.render();
	};
	
	window.fitToCanvas = function () {
		const layer = state.activeLayer;
		if (!layer) return;

		const canvas = state.renderer.canvas;

		const scaleX = canvas.width / layer.width;
		const scaleY = canvas.height / layer.height;

		layer.scaleX = 1;
		layer.scaleY = 1;
		layer.scale = Math.min(scaleX, scaleY);

		layer.x = canvas.width / 2;
		layer.y = canvas.height / 2;

		state.renderer.render();
		requestLayersPanelRefresh();
	};
	
	function bindPair(id, key, transform = v => v, inverse = v => v) {
		const slider = document.getElementById(id);
		const number = document.getElementById(id + "_num");
		
		const PASS1_KEYS = new Set([
			"brightness",
			"contrast",
			"saturation",
			"red",
			"green",
			"blue",
			"gblur"
		]);

		function update(value) {
			if (isNaN(value)) return;
			
			const layer = state.activeLayer;
			if (!layer) return;

			const v = transform(value);
			layer[key] = v;

			slider.value = value;
			number.value = value;

			if (PASS1_KEYS.has(key)) {
				layer.dirty = true;
			}

			state.renderer.render();
		}

		slider.addEventListener("input", (e) => {
			update(parseFloat(e.target.value));
		});

		number.addEventListener("input", (e) => {
			update(parseFloat(e.target.value));
		});
		
		bindings.push({ id, key, inverse });
	}
	
	function syncControlsFromLayer() {
		const layer = state.activeLayer;
		if (!layer) return;

		bindings.forEach(({ id, key, inverse }) => {
			const slider = document.getElementById(id);
			const number = document.getElementById(id + "_num");

			if (!slider || !number) return;

			const value = layer[key];
			if (value === undefined) return;

			const v = inverse(value);

			slider.value = v;
			number.value = v;
		});

		const blendSelect = document.getElementById("blend");
		if (blendSelect) {
			blendSelect.value = layer.blend || "source-over";
		}
	}

	bindPair("scaleX", "scaleX");
	bindPair("scaleY", "scaleY");
	bindPair("scale", "scale");

	bindPair(
	  "rotation",
	  "rotation",
	  v => (v * Math.PI) / 180,
	  v => (v * 180) / Math.PI
	);

	bindPair("brightness", "brightness");
	bindPair("contrast", "contrast");
	bindPair("saturation", "saturation");

	bindPair("red", "red");
	bindPair("green", "green");
	bindPair("blue", "blue");

	bindPair("opacity", "opacity");
	bindPair("blur", "gblur");
	
	const select = document.getElementById("blend");

	for (const key in BLEND_MODES) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.textContent = BLEND_MODES[key].label;
		select.appendChild(opt);
	}

	select.addEventListener("change", () => {
		const layer = state.activeLayer;
		if (!layer) return;

		layer.blend = select.value;
		state.renderer.render();
	});

	syncControlsFromLayer();

	const addTextBtn = document.getElementById("addTextBtn");
	const addTextInput = document.getElementById("addTextInput");
	const addTextFont = document.getElementById("addTextFont");
	const addTextColor = document.getElementById("addTextColor");

	addTextBtn.addEventListener("click", () => {
		const layer = createTextLayer(addTextInput.value, {
			font: "256px " + addTextFont.value,
			color: addTextColor.value
		});

		state.layers.push(layer);
		state.activeLayer = layer;

		state.renderer.render();
		requestLayersPanelRefresh();
	});
	
	const exportBtn = document.getElementById("exportBtn");

	exportBtn.addEventListener("click", () => {
		const canvas = state.renderer.canvas;

		state.renderer.render();

		const dataURL = canvas.toDataURL("image/png");

		downloadImage(dataURL, "vrcphotokiosk.png");
	});
	
	const presetSelect = document.getElementById("preset");

	for (const key in PRESETS) {
		const opt = document.createElement("option");
		opt.value = key;
		opt.textContent = PRESETS[key].label;
		presetSelect.appendChild(opt);
	}
	
	presetSelect.addEventListener("change", (e) => {
		const value = e.target.value;
		if (!value) return;

		applyPreset(value);
		syncControlsFromLayer();
	});

    console.log("App initialized");
});
