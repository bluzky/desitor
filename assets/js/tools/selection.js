import paper from 'paper';
import Selection from '../selection.js';

var SELECTION_STATE = {
  DEFAULT: 'default',
  SELECT: 'select',
  RESIZE: 'resize',
  MOVE: 'move',
  RECTANGLE_SELECT: 'rectangle_select'
};

function SelectionTool(){
  this.state = 'default'; // default, select, resize, move
  this.selectedItems = [];
  this.tool = new Tool();
  this.bindEvent();

  this.selectionRect = null;
  this.startPoint = null;
  this.lastPoint = null;

  return this;
}

SelectionTool.prototype = {
  reset: function(){
    if(this.selectionRect){
      this.selectionRect.remove();
    }

    this.selectionRect = null;
    this.startPoint = null;
    this.lastPoint = null;
  },

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
	    if (!Selection.selectionManager.isSelected(hitResult.item) && hitResult.item.data.type != 'handle'){
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
      this.state = SELECTION_STATE.RECTANGLE_SELECT;
      this.startPoint = event.point;
    }
  },

  onMouseDrag: function(event){
    if(this.selectedItems.length > 0){
      if(this.state == SELECTION_STATE.SELECT){
        this.translateSelected(event.delta);
      }
    }else if(this.state == SELECTION_STATE.RECTANGLE_SELECT){
      this.updateSelectRectangle(event);
    }
  },

  onMouseUp: function(event){
    if(this.state == SELECTION_STATE.RECTANGLE_SELECT && this.selectionRect){
      this.selectItemInRect(this.selectionRect.bounds.clone());
    }
    this.reset();
  },

  updateSelectRectangle: function(event){
    var point = event.point.clone();

    if(this.selectionRect){
      var initialWidth = this.lastPoint.x - this.startPoint.x;
      var initialHeight = this.lastPoint.y - this.startPoint.y;
      var newWidth = point.x - this.startPoint.x;
      var newHeight = point.y - this.startPoint.y;
      var xFactor = newWidth/initialWidth;
      var yFactor = newHeight/initialHeight;

      if((Math.abs(newWidth - initialWidth) >= 2 || Math.abs(newHeight - initialHeight) >= 2 ) && xFactor != 0 && yFactor != 0){
        this.selectionRect.scale(xFactor, yFactor, this.startPoint);
        this.lastPoint = point;
      }
    }
    else if(this.startPoint && point.x != this.startPoint.x && point.y != this.startPoint.y){
      var shape = new Path.Rectangle(this.startPoint, point);
      shape.strokeColor = 'rgba(50, 123, 241, 0.85)';
      shape.strokeWidth = 1;
      shape.fillColor = 'rgba(50, 123, 241, 0.45)';
      shape.data.type = 'handle';
      this.selectionRect = shape;
      this.lastPoint = point;
    }
  },

  addSelectedItem: function(item){
    if(item && !Selection.selectionManager.isSelected(item)){
      this.selectedItems.push(item);
      Selection.selectionManager.addItem(item);
    }
  },

  addSelectedItems: function(items){
    for(var i in items){
      this.addSelectedItem(items[i]);
    }
  },

  selectItemInRect: function(rect){
    var items = paper.project.getItems({
      match: function(item){
        return item.data.type != 'handle' && item.isInside(rect) && item.className != 'Layer';
      }
    });
    this.addSelectedItems(items);
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
