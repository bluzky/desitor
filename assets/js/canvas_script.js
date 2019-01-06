import paper from 'paper';
import Tools from './tools';

import u from 'umbrellajs';

paper.install(window);
// Keep global references to both tools, so the HTML
// links below can access them.
var tools, reset;

window.onload = function() {
	paper.setup('drawing-board');
  tools = Tools.initTools();
  bindToolbarEvent();
  activateTool('line');
}

function bindToolbarEvent(){
  u(".left-toolbar .item").on('click', function(event){
    var key = u(this).attr('tool');
    activateTool(key);
  });
}

function activateTool(key){
  if(tools[key]){
    tools[key].tool.activate();
  }
  u('.left-toolbar .item.active').removeClass('active');
  u('.left-toolbar .item[tool=' + key + ']').addClass('active');
}

paper.view.draw();

