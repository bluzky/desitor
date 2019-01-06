import paper from 'paper';

function LineTool(){
  this.tool = new Tool();
  this.currentItem = null;
  this.bindEvent();
  return this;
}

LineTool.prototype = {
  bindEvent: function(){
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  },

  onMouseDown: function(event){
    var path = new Path();
    path.strokeColor = 'rebeccaPurple';
    path.strokeWidth = 3;
	  path.add(event.point);
    this.currentItem = path;
  },

  onMouseDrag: function(event){
    if(this.currentItem.segments.length >= 2){
      this.currentItem.removeSegment(1);
    }

    this.currentItem.add(event.point);
  },

  onMouseUp: function(event){
    if(this.currentItem.segments.length >= 2){
      this.currentItem.removeSegment(1);
    }

    this.currentItem.add(event.point);

    var length = this.currentItem.segments[0].point.subtract(this.currentItem.segments[1].point).length
    if(length < 5){
      this.currentItem.remove();
    }
    paper.project.deselectAll();

    if(this.currentItem){
      this.currentItem.selected = true;
      this.currentItem = null;
    }
  }
};

export default LineTool;
