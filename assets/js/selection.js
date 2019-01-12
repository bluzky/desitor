import paper from 'paper';

function Selection(){
  this.selectedItems = [];
  return this;
}

Selection.prototype = {
  isSelected: function(item){
    for(var i = 0, len = this.selectedItems.length; i < len; i++){
      if(this.selectedItems[i].item == item)
        return true;
    }

    return false;
  },

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
  this.itemRotation = item.data.rotation || 0;
  this.item.rotation = -this.itemRotation;
  this.zeroBounds = this.item.strokeBounds.clone();
  this.item.rotation = this.itemRotation;

  this.handles = {};
  this.saveTool = null;
  this.selectedHandle = null;
  this.anchorPoint = null;
  this.group = new Group();

  this.pivot = this.item.strokeBounds.center.clone();
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
    var bounds = this.zeroBounds.clone();
    var opts = settings.selection;
    this.createRectangleBound(bounds, opts);
    this.createScalingHandle(bounds, opts);
    this.createRotationHandle(bounds, opts);
    this.group.rotate(this.itemRotation, this.pivot);
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
    var position = bounds.topLeft.clone();
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
    dot.onMouseUp = this.onMouseUpRotation.bind(this);
    dot.onMouseDrag = this.onMouseDragRotation.bind(this);

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
    var bounds = this.getZeroBounds();

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

    this.anchorPoint = center.clone();
    this.pivot =  this.item.strokeBounds.center.clone();
  },

  getZeroBounds: function(){
    this.item.rotation = - this.itemRotation;
    var bounds = this.item.strokeBounds.clone();
    this.item.rotation = this.itemRotation;
    return bounds;
  },

  onMouseDragDot: function(event){
    if(this.selectedHandle != event.target)
      return;

    var handle = event.target;
    var point = event.point.clone().rotate(-this.itemRotation, this.pivot);
    this.item.rotate(-this.itemRotation, this.pivot);
    this.group.rotate(-this.itemRotation, this.pivot);

    switch(handle.data.key){
    case 'topLeft':
    case 'topRight':
    case 'bottomLeft':
    case 'bottomRight':
      this.scaleCorner(point, handle);
      break;

    case 'topCenter':
    case 'bottomCenter':
      this.scaleVertical(point, handle);
      break;

    case 'leftCenter':
    case 'rightCenter':
      this.scaleHorizontal(point, handle);
      break;
    }

    this.item.rotate(this.itemRotation, this.pivot);
    this.group.rotate(this.itemRotation, this.pivot);
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
    var bounds = this.item.strokeBounds;

    // rectangle
    this.handles.rectangle.scale(xFactor, yFactor, this.anchorPoint);

    // rotation dot
    var position = bounds.topLeft.clone();
    position.y = position.y - 15;
    position.x = (position.x + bounds.topRight.x) / 2;
    this.handles.rotation.translate(position.subtract(this.handles.rotation.bounds.center));

    // scaling dot
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
    this.lastPoint = event.point;
    this.pivot =  this.item.strokeBounds.center.clone();
  },

  onMouseUpRotation: function(event){
    this.lastPoint = null;
    this.item.data.rotation = this.itemRotation % 360;
  },

  onMouseDragRotation: function(event){
    var lastAngle = this.lastPoint.subtract(this.pivot).angle;
    var newAngle = event.point.subtract(this.pivot).angle;
    var angle = newAngle - lastAngle;
    this.group.rotate(angle, this.pivot);
    this.item.rotate(angle, this.pivot);
    this.itemRotation += angle;
    this.lastPoint = event.point;
  },

  debug: function(item, color){
    switch(item.className){
    case 'Point':
      var p = new Path.Circle(item, 5);
      p.fillColor = color;
      break;
    case 'Rectangle':
      var p = new Path.Rectangle(item);
      p.strokeColor = color;
      p.strokeWidth = 1;
      break;
    default:
      break;
    }

  }

};

function rotateRectangle(rect, angle, center){
  var topLeft = rect.topLeft.clone().rotate(angle, center);
  var bottomRight = rect.bottomRight.clone().rotate(angle, center);
  return new Rectangle(topLeft, bottomRight);
}

var selectionManager = new Selection();
window.manager = selectionManager;

export default {
  selectionManager,
  SelectedItem
}
