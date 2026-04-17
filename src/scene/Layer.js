import { detectRole, layerOrder } from "./layerOrder.js";

export class Layer {
    constructor(img, name, type = "unknown") {
        this.id = crypto.randomUUID();

        this.img = img;
        this.thumbnail = null;
        this.name = name;
        this.role = detectRole(name);
        this.zIndex = layerOrder[this.role] ?? layerOrder.unknown;

        this.texture = null;
		this.processedTex = null;
		this.processedFbo = null
		
		this.dirty = true; // forces rebuild for in-layer color edits
		this.lastHash = "";

        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
		this.scaleY = 1;
		this.scale = 1;
        this.rotation = 0;
		this.aspect = 1;

        this.width = img.width;
        this.height = img.height;

        this.brightness = 100;
        this.contrast = 100;
        this.saturation = 100;
        this.opacity = 100;

        this.red = 100;
        this.green = 100;
        this.blue = 100;
		
		this.gblur = 0;

        this.blend = "source-over";
        this.visible = true;

        this.text = "";
        this.color = "#ffffff";
        this.font = "256px Arial";
    }
}