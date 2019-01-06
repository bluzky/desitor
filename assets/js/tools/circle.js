import paper from 'paper';

function CircleTool(){
  this.tool = new Tool();
  this.currentItem = null;
  this.startPoint = null;
  this.lastPoint = null;
  this.bindEvent();
  return this;
}

CircleTool.prototype = {
  bindEvent: function(){
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  },

  onMouseDown: function(event){
    this.startPoint = event.point;
  },

  onMouseDrag: function(event){
    var point;
    if(Key.isDown('shift')){
      point = squarePoint(this.startPoint, event.point);
    }else{
      point = event.point;
    }

    if(this.currentItem){
      var initialWidth = this.lastPoint.x - this.startPoint.x;
      var initialHeight = this.lastPoint.y - this.startPoint.y;
      var newWidth = point.x - this.startPoint.x;
      var newHeight = point.y - this.startPoint.y;
      var xFactor = newWidth/initialWidth;
      var yFactor = newHeight/initialHeight;

      if((Math.abs(newWidth - initialWidth) >= 2 || Math.abs(newHeight - initialHeight) >= 2 ) && xFactor != 0 && yFactor != 0){
        this.currentItem.scale(xFactor, yFactor, this.startPoint);
        this.lastPoint = point;
      }
    }
    else if(event.point.x != this.startPoint.x && event.point.y != this.startPoint.y){
      var shape = new Path.Ellipse(new Rectangle(this.startPoint, point));
      shape.strokeColor = 'rebeccaPurple';
      shape.strokeWidth = 1;
      shape.fillColor = 'orange';
      this.currentItem = shape;
      this.currentItem.selected = true;
      this.lastPoint = point;
    }
  },

  onMouseUp: function(event){
    paper.project.deselectAll();
    if(this.currentItem){
      this.currentItem.selected = true;
      this.currentItem = null;
    }
  }
};

function squarePoint(anchor, point){
  var diffX = point.x - anchor.x;
  var diffY = point.y - anchor.y;
  var diff = Math.max(Math.abs(diffX), Math.abs(diffY));
  point.x = anchor.x + diff * diffX / Math.abs(diffX);
  point.y = anchor.y + diff * diffY / Math.abs(diffY);
  return point;
}

export default CircleTool;

