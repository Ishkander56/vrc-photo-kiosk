import { state } from "../scene/state.js";

export function attachDrag(canvas) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function getActiveLayer() {
        return state.layers.find(l => l === state.activeLayer);
    }

    canvas.addEventListener("mousedown", (e) => {
        const layer = state.activeLayer;
        if (!layer) return;

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = canvas.height - (e.clientY - rect.top) * scaleY;

        offsetX = mouseX - layer.x;
        offsetY = mouseY - layer.y;

        isDragging = true;
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
    });

    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const layer = getActiveLayer();
        if (!layer) return;

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = canvas.height - (e.clientY - rect.top) * scaleY;

        layer.x = mouseX - offsetX;
        layer.y = mouseY - offsetY;

        state.renderer.render();
    });
}