
(function($) {
  'use strict';
  function Annotate(container, options) {
    this.options = options;
    this.$container = $(container);
    this.clicked = false;
    this.fromx = null;
    this.fromy = null;
    this.dx = null;
    this.dy = null;
    this.storedUndo = [];
    this.storedElement = [];
    this.img = null;
    this.currentWidth = null;
    this.currentHeight = null;
    this.linewidth = 1;
    this.fontsize = '20px';
    this.color = 'blue';
    this.currentAnotateType = 'rectangle';
    this.init();
  }
  Annotate.prototype = {
    init: function() {
      var self = this;
      self.currentAnotateType = self.options.defaultTool;
      self.baseCanvas = document.getElementById('baseLayer_imagePreview');
      self.drawingCanvas = document.getElementById('drawingLayer_iamgePreview');
      //create CanvasRenderingContext2D objects representing rendering context.
      self.baseContext = self.baseCanvas.getContext('2d');
      self.drawingContext = self.drawingCanvas.getContext('2d');
      self.baseContext.lineJoin = 'round';
      self.drawingContext.lineJoin = 'round';
      self.$textbox = $('#anotationText');
      self.initBackgroundImages();//load the image
      $('#tools').on('change', 'input[name^="tool_option"]', function() {
        self.selectTool($(this));
      });
      $('[data-tool="' + self.currentAnotateType + '"]').trigger('click');
      $('#tools').on('click', '.annotate-redo', function(event) {
        self.redoaction(event);
      });
      $('#tools').on('click', '.annotate-undo', function(event) {
        self.undoaction(event);
      });
      var $drawingCanvas = $(self.drawingCanvas);
      $drawingCanvas.on('mousedown touchstart', function(
        event) {
        self.annotatestart(event);
      });
      $drawingCanvas.on('mouseup touchend', function(event) {
        self.annotatestop(event);
      });
      $drawingCanvas.on('mouseleave touchleave', function(
        event) {
        self.annotateleave(event);
      });
      $drawingCanvas.on('mousemove touchmove', function(
        event) {
        self.annotatemove(event);
      });
    },
    initBackgroundImages: function() {
      var self = this;
      self.img = new Image();
      self.img.src = self.options.image;
      self.img.onload = function() {
        self.currentWidth = this.width;
        self.currentHeight = this.height;
        self.baseCanvas.width = self.drawingCanvas.width = self.currentWidth;
        self.baseCanvas.height = self.drawingCanvas.height = self.currentHeight;
        self.baseContext.drawImage(self.img, 0, 0, self.currentWidth,
          self.currentHeight);
        self.$container.css({
          height: self.currentHeight,
          width: self.currentWidth
        });
        self.storedUndo = [];
        self.storedElement = [];
      };
    },
    refreshDrawing: function() {
      var self = this;
      self.baseCanvas.width = self.baseCanvas.width;
      self.baseContext.drawImage(self.img, 0, 0, self.currentWidth,self.currentHeight);
      if (self.storedElement.length === 0) {
        return;
      }
      for (var i = 0; i < self.storedElement.length; i++) {
        var element = self.storedElement[i];
        switch (element.type) {
          case 'rectangle':
            self.drawRectangle(self.baseContext, element.fromx, element.fromy,
              element.dx, element.dy);
            break;
          case 'text':
            self.drawText(self.baseContext, element.text, element.fromx,
              element.fromy, element.maxwidth);
            break;
          default:
        }
      }
    },
    clear: function() {
      // Clear Canvas
      this.drawingCanvas.width = this.drawingCanvas.width;
    },
    drawRectangle: function(context, x, y, w, h) {
      var self = this;
      context.beginPath();
      context.rect(x, y, w, h);
      context.fillStyle = 'transparent';
      context.fill();
      context.lineWidth = self.linewidth;
      context.strokeStyle = self.color;
      context.stroke();
    },
    drawText: function(context, text, x, y, maxWidth) {
      var self = this;
      context.font = self.fontsize + ' sans-serif';
      context.textBaseline = 'top';
      context.fillStyle = self.color;
      self.arrangeTextInBox(context, text, x + 3, y + 4, maxWidth, 25);
    },
    arrangeTextInBox: function(drawingContext, text, x, y, maxWidth, lineHeight) {
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';
        for (var j = 0; j < words.length; j++) {
          var testLine = line + words[j] + ' ';
          var metrics = drawingContext.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && j > 0) {
            drawingContext.fillText(line, x, y);
            line = words[j] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        drawingContext.fillText(line, x, y + i * lineHeight);
      }
    },
    //push text in the box into storedElement
    pushText: function() {
      var self = this;
      if (self.$textbox.is(':visible')) {
        var self = this;
        var text = self.$textbox.val();
        self.$textbox.val('').hide();
        if (text) {
          self.storedElement.push({
            type: 'text',
            text: text,
            fromx: self.fromx,
            fromy: self.fromy,
            maxwidth: self.dx
          });
          self.storedUndo = [];
        }
        self.refreshDrawing();
        self.clear();
      }
    },
    // select rectangle or text tool
    selectTool: function(element) {
      var self = this;
      self.currentAnotateType = element.data('tool');
      self.pushText();
    },
    annotatestart: function(event) {
      var self = this;
      self.clicked = true;
      var offset = self.$container.offset();
      self.pushText();
      self.dx = null;
      self.dy = null;
      var pageX = event.pageX || event.originalEvent.touches[0].pageX;
      var pageY = event.pageY || event.originalEvent.touches[0].pageY;
      self.fromx = pageX - offset.left;
      self.fromy = pageY - offset.top;
      if (self.currentAnotateType === 'text') {
        self.$textbox.show();
      }
    },
    annotatestop: function() {
      var self = this;
      self.clicked = false;
      if (self.dx !== null && self.dy !== null && self.currentAnotateType === 'rectangle') {
        self.storedElement.push({
          type: 'rectangle',
          fromx: self.fromx,
          fromy: self.fromy,
          dx: self.dx,
          dy: self.dy
        });
        self.storedUndo = [];
      } else if (self.currentAnotateType === 'text') {
        if (self.dy === null || self.dx === null) {
          self.dx = 100;
          self.dy = 50;
        }
        self.setTextboxSize();
      }
      self.refreshDrawing();
    },
    setTextboxSize: function() {
      var self = this;
      var offset = self.$container.offset();
      self.$textbox.css({
        left: self.fromx + offset.left,
        top: self.fromy + offset.top,
        width: self.dx,
        height: self.dy
      });
    },
    annotateleave: function(event) {
      var self = this;
      if (self.clicked) {
        self.annotatestop(event);
      }
    },
    annotatemove: function(event) {
      var self = this;
      event.preventDefault();
      if (!self.clicked) {
        return;
      }
      var offset = self.$container.offset();
      var pageX = event.pageX || event.originalEvent.touches[0].pageX;
      var pageY = event.pageY || event.originalEvent.touches[0].pageY;
      switch (self.currentAnotateType) {
        case 'rectangle':
          self.clear();
          self.dx = pageX - offset.left - self.fromx;
          self.dy = pageY - offset.top - self.fromy;
          self.drawRectangle(self.drawingContext, self.fromx, self.fromy,
            self.dx, self.dy);
          break;
        case 'text':
          self.clear();
          self.dx = pageX - self.fromx - offset.left;
          self.dy = pageY - self.fromy - offset.top;
          self.setTextboxSize();
          break;
        default:
      }
    },
    undoaction: function(event) {
      event.preventDefault();
      var self = this;
      if (self.storedElement.length == 0) {//nothing to undo
        return;
      }
      self.storedUndo.push(self.storedElement.pop());
      self.clear();
      self.refreshDrawing();
    },
    redoaction: function(event) {
      event.preventDefault();
      var self = this;
      if (self.storedUndo.length === 0) {
        return;
      }
      self.storedElement.push(self.storedUndo.pop());
      self.clear();
      self.refreshDrawing();
    }
  };
  $.fn.annotate = function(imageUrl) {
    var annotate = $(this).data('annotate');
    var opts = $.extend({}, $.fn.annotate.defaults, {image: imageUrl});
    //only initate annotate object once
    if (annotate == null) {
      annotate = new Annotate($(this), opts);
      $(this).data('annotate', annotate);
    } else { //reset the new image
      annotate.pushText();
      annotate.fromx = null;
      annotate.fromy = null;
      annotate.dx = null;
      annotate.dy = null;
      annotate.storedUndo = [];
      annotate.storedElement = [];
      annotate.options = opts;
      annotate.baseContext.clearRect(0, 0, annotate.currentWidth, annotate.currentHeight);
      annotate.initBackgroundImages();
    }
  };
  $.fn.annotate.defaults = {
    image: null,
    defaultTool: 'rectangle'
  };
})(jQuery);
