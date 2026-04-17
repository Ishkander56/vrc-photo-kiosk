export const layerOrder = {
    unknown: 4,
    text: 3,
    ui: 2,
    player: 1,
    environment: 0,
};

export function detectRole(filename) {
    const f = filename.toLowerCase();

    if (f.endsWith("_environment.png")) return "environment";
    if (f.endsWith("_player.png")) return "player";
    if (f.endsWith("_ui.png")) return "ui";

    return "unknown";
}

export function sortLayers(layers) {
    layers.sort((a, b) => {
        const aOrder = layerOrder[a.type] ?? layerOrder.unknown;
        const bOrder = layerOrder[b.type] ?? layerOrder.unknown;

        if (aOrder === bOrder) {
            return (a.id ?? 0) - (b.id ?? 0);
        }

        return aOrder - bOrder;
    });
}

export function reorderLayers(layers) {
    const buckets = {
        environment: [],
        player: [],
        ui: [],
        text: [],
        unknown: [],
    };

    for (const layer of layers) {
        const role = layer.role || "unknown";

        if (!buckets[role]) {
            buckets.unknown.push(layer);
        } else {
            buckets[role].push(layer);
        }
    }
	
    return [
        ...buckets.environment,
        ...buckets.player,
        ...buckets.ui,
        ...buckets.text,
        ...buckets.unknown,
    ];
}