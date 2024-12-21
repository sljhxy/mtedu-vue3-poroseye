import './global';
import "./Init";
import { ComponentsApi } from "./components";
import { createSkt } from '../tools';
interface TinymcePlugin {
    componentsApi: ComponentsApi;
    global$1: any;
    global$7: any;
    createSkt: any;
    setDev: Function;
}
declare const tinymcePlugin: TinymcePlugin;
export { createSkt, TinymcePlugin, tinymcePlugin };
