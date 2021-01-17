import { ConnectTwoElements } from "../connectTwoElements";
import { D3LineDrawer } from "../d3LineDrawer";

const elem1 = document.querySelector('.elem1');
const elem2 = document.querySelector('.elem2');
const lineDrawer = new D3LineDrawer();
const connectEx = new ConnectTwoElements(
    elem2,
    elem1,
    lineDrawer.draw.bind(lineDrawer),
    undefined,
    lineDrawer.remove.bind(lineDrawer)
);

connectEx.connect();
