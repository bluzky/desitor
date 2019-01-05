import paper from 'paper';

function initTools(){
  return {
    line: createLineTool(),
    rectangle: createRectangleTool(),
    circle: createCircleTool(),
    selection: new SelectionTool()
  }
}

function createLineTool(){
  var currentItem = null;
  var lineTool = new Tool();

  lineTool.onMouseDown = function(event){
    var path = new Path();
    path.strokeColor = 'rebeccaPurple';
    path.strokeWidth = 3;
	  path.add(event.point);
    currentItem = path;
  }

  lineTool.onMouseDrag = function(event){
    if(currentItem.segments.length >= 2){
      currentItem.removeSegment(1);
    }

    currentItem.add(event.point);
  }

  lineTool.onMouseUp = function(event){
    if(currentItem.segments.length >= 2){
      currentItem.removeSegment(1);
    }

    currentItem.add(event.point);

    var length = currentItem.segments[0].point.subtract(currentItem.segments[1].point).length
    if(length < 5){
      currentItem.remove();
    }
    paper.project.deselectAll();
    currentItem.selected = true;
    currentItem = null;
  }

  return lineTool;
}

function createRectangleTool(){
  var currentItem = null;
  var tool = new Tool();
  var startPoint = null;
  var lastPoint = null;

  tool.onMouseDown = function(event){
    startPoint = event.point;
  }

  tool.onMouseDrag = function(event){
    var point;
    if(Key.isDown('shift')){
      point = squarePoint(startPoint, event.point);
    }else{
      point = event.point;
    }

    if(currentItem){
      var initialWidth = lastPoint.x - startPoint.x;
      var initialHeight = lastPoint.y - startPoint.y;
      var newWidth = point.x - startPoint.x;
      var newHeight = point.y - startPoint.y;
      var xFactor = newWidth/initialWidth;
      var yFactor = newHeight/initialHeight;

      if(Math.abs(newWidth - initialWidth) >= 2 || Math.abs(newHeight - initialHeight) >= 2 ){
        currentItem.scale(xFactor, yFactor, startPoint);
        lastPoint = point;
      }
    }
    else if(event.point.x != startPoint.x && event.point.y != startPoint.y){
      var shape = new Path.Rectangle(startPoint, point)
      shape.strokeColor = 'rebeccaPurple';
      shape.strokeWidth = 1;
      currentItem = shape;
      currentItem.selected = true;
      lastPoint = point;
    }
  }

  tool.onMouseUp = function(event){
    paper.project.deselectAll();
    currentItem.selected = true
    currentItem = null;
  }

  return tool;
}

function createCircleTool(){
  var currentItem = null;
  var tool = new Tool();
  var startPoint = null;
  var lastPoint = null;

  tool.onMouseDown = function(event){
    startPoint = event.point;
  }

  tool.onMouseDrag = function(event){
    var point;
    if(Key.isDown('shift')){
      point = squarePoint(startPoint, event.point);
    }else{
      point = event.point;
    }

    if(currentItem){
      var initialWidth = lastPoint.x - startPoint.x;
      var initialHeight = lastPoint.y - startPoint.y;
      var newWidth = point.x - startPoint.x;
      var newHeight = point.y - startPoint.y;
      var xFactor = newWidth/initialWidth;
      var yFactor = newHeight/initialHeight;

      if(Math.abs(newWidth - initialWidth) >= 2 || Math.abs(newHeight - initialHeight) >= 2 ){
        currentItem.scale(xFactor, yFactor, startPoint);
        lastPoint = point;
      }
    }
    else if(event.point.x != startPoint.x && event.point.y != startPoint.y){
      var shape = new Path.Ellipse(new Rectangle(startPoint, point))
      shape.strokeColor = 'rebeccaPurple';
      shape.strokeWidth = 1;
      shape.fillColor = 'orange';
      currentItem = shape;
      currentItem.selected = true;
      lastPoint = point;
    }
  }

  tool.onMouseUp = function(event){
    paper.project.deselectAll();
    currentItem.selected = true;
    currentItem = null;
  }

  return tool;
}

function squarePoint(anchor, point){
  var diffX = point.x - anchor.x;
  var diffY = point.y - anchor.y;
  var diff = Math.max(Math.abs(diffX), Math.abs(diffY))
  point.x = anchor.x + diff * diffX / Math.abs(diffX);
  point.y = anchor.y + diff * diffY / Math.abs(diffY);
  return point;
}

function SelectionTool(){
  this.tool = new Tool();
  this.bindEvent();
  this.state = 'idle'; // idle, select, resize, move
  this.selectedItem = null;
  return this.tool;
}


SelectionTool.prototype = {
  bindEvent: function(){
    this.tool.onMouseDown = this.onMouseDown.bind(this)
    this.tool.onMouseDrag = this.onMouseDrag.bind(this)
    this.tool.onMouseUp = this.onMouseUp.bind(this)
  },
  onMouseDown: function(event){
    // var hitItem = paper.project.getItems({
    //   match: function(item) {
    //     return item.strokeBounds.contains(event.point);
    //   }
    // }).pop();

    // this.setSelected(hitItem);
    var hitOptions = {
		  segments: true,
		  stroke: true,
		  fill: true,
		  tolerance: 5
	  };
	  var hitResult = paper.project.hitTest(event.point, hitOptions);
	  if (hitResult) {
		  this.setSelected(hitResult.item)
    }
  },
  onMouseDrag: function(event){

  },
  onMouseUp: function(event){
    
  },
  setSelected: function(item){
    paper.project.deselectAll();
    this.selectedItem = item;
    item.selected = true;
  }
}


export default {
  initTools
}
