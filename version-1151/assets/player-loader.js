import { H as Hls } from "./hls-vendor-dru42stk.js";

window.Hls = Hls;
window.dispatchEvent(new Event("hls-ready"));
