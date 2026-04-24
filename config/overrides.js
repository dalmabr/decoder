import { deConfig } from "../config/de-config.js";
import { NETWORK_OVERRIDES } from "../config/network.js";

export function buildFieldConfig(network) {
    const BASE_DE_CONFIG = deConfig;
    const overrides = NETWORK_OVERRIDES?.[network] || {};

    const merged = { ...BASE_DE_CONFIG };

    for (const de in overrides) {
        // Sempre mescla base + override para permitir ajuste de layout por rede.
        merged[de] = {
            ...(BASE_DE_CONFIG[de] || {}),
            ...overrides[de]
        };
    }

    return merged;
}
