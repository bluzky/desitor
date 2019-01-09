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
  this.handles = {};
  this.saveTool = null;
  this.selectedHandle = null;
  this.anchorPoint = null;
  this.group = new Group();
  this.buildHandle();
  this.lastPoint = null;
  return this;
}

var selectionColor = '';
var settings = {
  selection:{
    radius: 4,
    width: 1,
    strokeColor: new paper.Color('blue'),
    fillColor: new paper.Color('white'),
    rotationHandleColor: new paper.Color('orange')
  }
};

var handleKeys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft', 'topCenter', 'rightCenter', 'bottomCenter', 'leftCenter'];
var cursors =  {
  'topLeft': 'nwse-resize', 'topRight': 'nesw-resize', 'bottomRight': 'nwse-resize', 'bottomLeft': 'nesw-resize', 'topCenter': 'ns-resize', 'rightCenter': 'ew-resize', 'bottomCenter': 'ns-resize', 'leftCenter': 'ew-resize'
};

SelectedItem.prototype = {
  buildHandle: function(){
    var bounds = this.item.strokeBounds;
    var opts = settings.selection;
    this.createRectangleBound(bounds, opts);
    this.createScalingHandle(bounds, opts);
    this.createRotationHandle(bounds, opts);
  },

  createRectangleBound: function(bounds, opts){
    var rectangle = new Path.Rectangle(bounds);
    rectangle.strokeColor = opts.strokeColor;
    rectangle.strokeWidth = opts.width;
    rectangle.dashArray = [4, 3];
    rectangle.data.type = 'handle';
    this.group.addChild(rectangle);
    this.handles.rectangle = rectangle;
    return rectangle;
  },

  createScalingHandle: function(bounds, opts){
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

      this.group.addChild(dot);
      this.handles[handleKeys[i]] = dot;
    }
  },

  createRotationHandle: function(bounds, opts){
    var position = bounds.topLeft;
    position.y = position.y - 15;
    position.x = (position.x + bounds.topRight.x) / 2;

    var dot = new Path.Circle(position, opts.radius);
    dot.fillColor = opts.rotationHandleColor;
    dot.strokeColor = opts.rotationHandleColor;
    dot.strokeWidth = opts.width;
    dot.data = {
      type: 'handle',
      key: 'rotation'
    };

    dot.onMouseEnter = this.onMouseEnterRotation.bind(this);
    dot.onMouseLeave = this.onMouseLeaveRotation.bind(this);
    dot.onMouseDown = this.onMouseDownRotation.bind(this);
    dot.onMouseDrag = this.onMouseDragRotation.bind(this);
    dot.onMouseUp = this.onMouseUpRotation.bind(this);

    this.group.addChild(dot);
    this.handles.rotation = dot;
  },

  remove: function(){
    this.group.remove();
  },

  translate: function(delta){
    this.item.translate(delta);
    this.group.translate(delta);
  },

  onMouseEnterDot: function(event){
    document.body.style.cursor = cursors[this.data.key] || 'default';
  },

  onMouseLeaveDot: function(event){
    document.body.style.cursor = 'default';
  },

  onMouseDownDot: function(event){
    var item = event.target, center;
    var bounds = this.item.strokeBounds;

    this.selectedHandle = item;
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

    this.anchorPoint = center;
  },

  onMouseDragDot: function(event){
    if(this.selectedHandle != event.target)
      return;

    var item = event.target;

    switch(item.data.key){
    case 'topLeft':
    case 'topRight':
    case 'bottomLeft':
    case 'bottomRight':
      this.scaleCorner(event.point, item);
      break;

    case 'topCenter':
    case 'bottomCenter':
      this.scaleVertical(event.point, item);
      break;

    case 'leftCenter':
    case 'rightCenter':
      this.scaleHorizontal(event.point, item);
      break;
    }
  },


  scaleHorizontal: function(newPoint, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];
    var lastWidth = scalePoint.x - this.anchorPoint.x;
    var newWidth = newPoint.x - this.anchorPoint.x;
    var xFactor = newWidth/lastWidth;

    if(Math.abs(newWidth - lastWidth) > 2 && newWidth != 0 && lastWidth != 0 && xFactor != 0){
      this.item.scale( xFactor,1, this.anchorPoint);
      this.scaleHandle(xFactor, 1, this.anchorPoint);

      if(xFactor < 0)
        this.flipHandleX();
    }
  },

  scaleVertical: function(newPoint, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];
    var lastHeight = scalePoint.y - this.anchorPoint.y;
    var newHeight = newPoint.y - this.anchorPoint.y;
    var yFactor = newHeight/lastHeight;

    if(Math.abs(newHeight - lastHeight) > 2 && newHeight != 0 && yFactor != 0){
      this.item.scale( 1, yFactor, this.anchorPoint);
      this.scaleHandle(1, yFactor, this.anchorPoint);
      if(yFactor < 0)
        this.flipHandleY();
    }
  },

  scaleCorner: function(newPoint, handle){
    var bounds = this.item.strokeBounds;
    var scalePoint = bounds[handle.data.key];

    var initialWidth = scalePoint.x - this.anchorPoint.x;
    var initialHeight = scalePoint.y - this.anchorPoint.y;
    var newWidth = newPoint.x - this.anchorPoint.x;
    var newHeight = newPoint.y - this.anchorPoint.y;
    var xFactor = newWidth/initialWidth;
    var yFactor = newHeight/initialHeight;

    if((Math.abs(newWidth - initialWidth) >= 2
        || Math.abs(newHeight - initialHeight) >= 2
       )
       && newWidth != 0
       && newHeight != 0
       && xFactor != 0
       && yFactor != 0
      ){
      this.item.scale(xFactor, yFactor, this.anchorPoint);
      this.scaleHandle(xFactor, yFactor, this.anchorPoint);
      if(xFactor < 0)
        this.flipHandleX();

      if(yFactor < 0)
        this.flipHandleY();
    }
  },

  scaleHandle: function(xFactor, yFactor){
    this.handles.rectangle.scale(xFactor, yFactor, this.anchorPoint);
    var bounds = this.item.strokeBounds;

    for(var i = 0, len = handleKeys.length; i < len; i++){
      var key = handleKeys[i];
      var dot = this.handles[key];
      var dotCenter = dot.bounds.center;
      var delta = bounds[key].subtract(dotCenter);
      dot.translate(delta);
    }
  },

  flipHandleX: function(){
    this.swapHandle('topLeft', 'topRight');
    this.swapHandle('bottomLeft', 'bottomRight');
    this.swapHandle('leftCenter', 'rightCenter');
  },

  flipHandleY: function(){
    this.swapHandle('topLeft', 'bottomLeft');
    this.swapHandle('topRight', 'bottomRight');
    this.swapHandle('topCenter', 'bottomCenter');
  },

  swapHandle: function(keyA, keyB){
    var tmp = this.handles[keyA];
    this.handles[keyA] = this.handles[keyB];
    this.handles[keyB] = tmp;
    this.handles[keyA].data.key = keyA;
    this.handles[keyB].data.key = keyB;

  },

  onMouseUpDot: function(event){
    this.selectedHandle = null;
    this.anchorPoint = null;
  },

  onMouseEnterRect: function(event){
    document.body.style.cursor = 'move';
  },

  onMouseLeaveRect: function(event){
    document.body.style.cursor = 'default';
  },

  onMouseEnterRotation: function(event){
    document.body.style.cursor = 'all-scroll';
  },

  onMouseLeaveRotation: function(event){
    document.body.style.cursor = 'default';
  },

  onMouseDownRotation: function(event){
    this.item.applyMatrix = false;
    this.item.pivot = this.item.strokeBounds.center;
    // this.lastPoint = this.item.globalToLocal(event.point);
    // this.lastPoint = event.point;
  },

  onMouseUpRotation: function(event){
    // this.lastPoint = null;
  },

  onMouseDragRotation: function(event){
    // var point = this.item.globalToLocal(event.point);
    // var point = event.point;
    var delta = event.point.subtract(this.item.pivot);
    this.item.rotation = delta.angle + 90;
    // var angle = point.getDirectedAngle(this.lastPoint);
    // console.log(angle);
    // if(angle != 0){
    //   this.lastPoint = point;
    //   this.item.rotate(angle);
    // }
  }
};

var selectionManager = new Selection();

export default {
  selectionManager,
  SelectedItem
}
