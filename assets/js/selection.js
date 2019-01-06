import paper from 'paper';

function Selection(){
  this.selectedItems = [];
  return this;
}

Selection.prototype = {
  addItem: function(item){
    this.selectedItems.push(new SelectedItem(item));
  },
  removeItem: function(item){
    for(var i = 0, len = this.selectedItems.length; i < len; i++){
      if(this.selectedItems[i] == item){
        item.remove();
        this.selectedItems.splice(i, 1);
        break;
      }
    }
  },
  removeItemIndex: function(index){
    for(var i = 0, len = this.selectedItems.length; i < len; i++){
      if(i == index){
        this.selectedItems[i].remove();
        this.selectedItems.splice(i, 1);
        break;
      }
    }
  },

  removeAll: function(){
    for(var i = 0, len = this.selectedItems.length; i < len; i++){
        this.selectedItems[i].remove();
    }
    this.selectedItems = [];
  },

  translateAll: function(delta){
    for(var i = 0, len = this.selectedItems.length; i < len; i++){
      this.selectedItems[i].translate(delta);
    }
  }
};

function SelectedItem(item){
  this.item = item;
  this.handles = this.buildHandle(this.item);
  this.saveTool = null;
  this.selectedHandle = null;
  return this;
}

var selectionColor = '';
var settings = {
  selection:{
    radius: 4,
    width: 1,
    strokeColor: new paper.Color('green'),
    fillColor: new paper.Color('white')
  }
};

var handleKeys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'topCenter', 'rightCenter', 'bottomCenter', 'leftCenter'];
var cursors =  {
  'topLeft': 'nwse-resize', 'topRight': 'nesw-resize', 'bottomRight': 'nwse-resize', 'bottomLeft': 'nesw-resize', 'topCenter': 'ns-resize', 'rightCenter': 'ew-resize', 'bottomCenter': 'ns-resize', 'leftCenter': 'ew-resize'
};

SelectedItem.prototype = {
  buildHandle: function(item){
    var bounds = item.strokeBounds;
    var opts = settings.selection;

    var handles = {};
    var rectangle = new Path.Rectangle(bounds);
    rectangle.strokeColor = opts.strokeColor;
    rectangle.strokeWidth = opts.width;
    rectangle.data.type = 'handle';
    handles.rectangle = rectangle;

    for(var i = 0, len = handleKeys.length; i < len; i++){
      var dot = new Path.Circle(bounds[handleKeys[i]], opts.radius);
      dot.strokeColor = opts.strokeColor;
      dot.fillColor = opts.fillColor;
      dot.strokeWidth = opts.width;
      dot.data = {
        type: 'handle',
        key: handleKeys[i]
      };

      dot.onMouseEnter = this.onMouseEnterDot;
      dot.onMouseLeave = this.onMouseLeaveDot;
      dot.onMouseDown = this.onMouseDownDot.bind(this);
      dot.onMouseDrag = this.onMouseDragDot.bind(this);
      dot.onMouseUp = this.onMouseUpDot.bind(this);

      handles[handleKeys[i]] = dot;

    }

    var group = new Group([]);
    for(var key in handles){
      group.addChild(handles[key]);
    }
    this.group = group;

    return handles;
  },

  redrawHandle: function(){
    this.remove();
    this.handles = this.buildHandle();
  },

  remove: function(){
    for(var key in this.handles){
      this.handles[key].remove();
    }
  },

  translate: function(delta){
    this.item.translate(delta);
    this.group.translate(delta);
  },

  scale: function(hor, ver, center){
    
  },

  onMouseEnterDot: function(event){
    document.body.style.cursor = cursors[this.data.key] || 'default';
  },

  onMouseLeaveDot: function(event){
    document.body.style.cursor = 'default';
  },

  onMouseDownDot: function(event){
    this.selectedHandle = event.target;
  },

  onMouseDragDot: function(event){

    if(this.selectedHandle != event.target)
      return;

    var center = null;
    var item = event.target;
    var bounds = this.item.strokeBounds;

    switch(item.data.key){
    case 'topLeft':
    case 'topCenter':
    case 'leftCenter':
      center = bounds.bottomRight;
      break;

    case 'topRight':
      center = bounds.bottomLeft;
      break;

    case 'rightCenter':
    case 'bottomRight':
    case 'bottomCenter':
      center = bounds.topLeft;
      break;

    case 'bottomLeft':
      center = bounds.topRight;
      break;
    }

    switch(item.data.key){
    case 'topLeft':
    case 'topRight':
    case 'bottomLeft':
    case 'bottomRight':
      this.scaleCorner(event.point, center, item);
      break;

    case 'topCenter':
    case 'bottomCenter':
      this.scaleVertical(event.point, center, item);
      break;

    case 'leftCenter':
    case 'rightCenter':
      this.scaleHorizontal(event.point, center, item);
      break;
    }
  },


  scaleHorizontal: function(newPoint, center, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];
    var lastWidth = scalePoint.x - center.x;
    var newWidth = newPoint.x - center.x;
    var xFactor = newWidth/lastWidth;
    console.log(scalePoint);

    if(Math.abs(newWidth - lastWidth) > 2 && xFactor != 0){
      this.item.scale( xFactor,1, center);
      this.scaleHandle(xFactor, 1, center);
    }
  },

  scaleVertical: function(newPoint, center, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];
    var lastHeight = scalePoint.y - center.y;
    var newHeight = newPoint.y - center.y;
    var yFactor = newHeight/lastHeight;

    if(Math.abs(newHeight - lastHeight) > 2 && yFactor != 0){
      this.item.scale( 1, yFactor, center);
      this.scaleHandle(1, yFactor, center);
    }
  },

  scaleCorner: function(newPoint, center, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];

    var initialWidth = scalePoint.x - center.x;
    var initialHeight = scalePoint.y - center.y;
    var newWidth = newPoint.x - center.x;
    var newHeight = newPoint.y - center.y;
    var xFactor = newWidth/initialWidth;
    var yFactor = newHeight/initialHeight;

    if((Math.abs(newWidth - initialWidth) >= 2 || Math.abs(newHeight - initialHeight) >= 2) && xFactor != 0 && yFactor != 0 ){
      this.item.scale(xFactor, yFactor, center);
      this.scaleHandle(xFactor, yFactor, center);
    }
  },

  scaleHandle: function(xFactor, yFactor, center){
    this.handles.rectangle.scale(xFactor, yFactor, center);
    var bounds = this.item.strokeBounds;

    for(var i = 0, len = handleKeys.length; i < len; i++){
      var key = handleKeys[i];
      var dot = this.handles[key];
      var dotCenter = dot.bounds.center;
      var delta = bounds[key].subtract(dotCenter);
      dot.translate(delta);
    }
  },

  onMouseUpDot: function(event){
    this.selectedHandle = null;
  },

  onMouseEnterRect: function(event){
    document.body.style.cursor = 'move';
  },

  onMouseLeaveRect: function(event){
    document.body.style.cursor = 'default';
  }
};

var selectionManager = new Selection();

export default {
  selectionManager,
  SelectedItem
}
