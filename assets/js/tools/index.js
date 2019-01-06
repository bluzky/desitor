import LineTool from './line.js';
import RectangleTool from './rectangle.js';
import CircleTool from './circle.js';
import SelectionTool from './selection.js';

function initTools(){
  return {
    line: new LineTool(),
    rectangle: new RectangleTool(),
    circle: new CircleTool(),
    selection: new SelectionTool()
  }
};

export default {
  initTools
}
