import { PortraitState } from "./types";

export const LOW_THRESHOLD = -20;
export const GLOAT_THRESHOLD =20;

export function getPortraitState(changePct: number): PortraitState {
    if (changePct <= LOW_THRESHOLD) return "low";
    if (changePct >= GLOAT_THRESHOLD) return "gloat";
    return "normal";
}

export function pickPortraitUrl(
    state: PortraitState,
    urls : { image_url: string, image_url_low:string, image_url_gloat: string}
): string {
    if (state == "low" && urls.image_url_low) return urls.image_url_low;
    if (state == "gloat" && urls.image_url_gloat) return urls.image_url_gloat;
    return urls.image_url;
}