import paper from 'paper';
import Selection from '../selection.js';

var SELECTION_STATE = {
  DEFAULT: 'default',
  SELECT: 'select',
  RESIZE: 'resize',
  MOVE: 'move'
};

function SelectionTool(){
  this.state = 'default'; // default, select, resize, move
  this.selectedItems = [];
  this.tool = new Tool();
  this.bindEvent();
  return this;
}

SelectionTool.prototype = {
  bindEvent: function(){
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  },

  onMouseDown: function(event){
    this.state = SELECTION_STATE.SELECT;

    var hitOptions = {
		  segments: true,
		  stroke: true,
		  fill: true,
		  tolerance: 5
	  };
	  var hitResult = paper.project.hitTest(event.point, hitOptions);

    if(hitResult){
	    if (!hitResult.item.selected && hitResult.item.data.type != 'handle'){
        if(Key.isDown('control')){
		      this.addSelectedItem(hitResult.item);
        }else{
          this.deselectAll();
          this.addSelectedItem(hitResult.item);
        }
      }

      if(hitResult.item.data.type == 'handle'){
        this.state = SELECTION_STATE.RESIZE;
      }
    }
    if(!hitResult){
      this.deselectAll();
    }
  },

  onMouseDrag: function(event){
    if(this.selectedItems.length > 0){
      if(this.state == SELECTION_STATE.SELECT){
        this.translateSelected(event.delta);
      }
    }
  },

  onMouseUp: function(event){
    this.state = SELECTION_STATE.DEFAULT;
  },

  addSelectedItem: function(item){
    if(item){
      this.selectedItems.push(item);
      Selection.selectionManager.addItem(item);
      // item.selected = true;
    }
  },

  translateSelected: function(delta){
    // for(var i = 0, len = this.selectedItems.length; i < len; i++){
    //   this.selectedItems[i].translate(delta);
    // }
    Selection.selectionManager.translateAll(delta);
  },

  deselectAll: function(){
    // paper.project.deselectAll();
    Selection.selectionManager.removeAll();
    this.selectedItems = [];
  }
};

export default SelectionTool;
