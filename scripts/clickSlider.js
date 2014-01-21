/*global jQuery, window, document*/

(function ($, window, document, undefined) {
  'use strict';

  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really being
  // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
  // can no longer be modified.

  // window and document are passed through as local variable rather than global
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified (especially when both are regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = 'ClickSlider',
    defaults = {
      SLIDER_CLASS: 'slider',
      SLIDER_CONTROLL_CLASS: '-control__',
      SLIDER_SLIDES_CONTAINER: 'slider-slides',
      SLIDER_SLIDE_CLASS: 'slide__',

      DEFAULT_EASING: 'linear',
      DEFAULT_DURATION: 1000,

      fullscreen: false

    };

  // The actual plugin constructor
  function ClickSlider(element, options) {
    // Store a jQuery wrapped version of the element so we can easily
    // work with it
    this.$element = $(element);
    // jQuery has an extend method which merges the contents of two or
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;

    this.easing = this.options.easing || this._defaults.DEFAULT_EASING;
    this.duration = this.options.duration || this._defaults.DEFAULT_DURATION;

    this.activeSlide = null;

    var _that = this;


    this.init();

    if (this.delay !== 0) this.begin();

    /*
     API
     */

    return {
      play: function() {
        _that.begin();
      },
      pause: function() {
        _that.stop();
      },
      next: function() {
        _that.stop();

        _that.next();
      },
      prev: function() {
        _that.stop();

        _that.prev();
      },
      slideTo: function(to) {
        _that.stop();
        _that.switchSlide(to);
      },
      getPos: function() {
        return _that.activeSlide;
      },
      getSlideNum: function() {
        return _that.slidesElements.length;
      }
    };
  }

  ClickSlider.prototype = {

    init: function () {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.$element
      // and this.options
      // you can add more functions like the one below and
      // call them like so: this.yourOtherFunction().
      var _sliderElement = this.$element;
      var _navigationElement = this.getElements(_sliderElement, '.slider-nav');
      var _slidesContainer = this.getElements(_sliderElement, '.slider-slides');
      // setup auto slideshow
      this.delay = this.options.autoPlay || 0;


      this.arrowElement = this.getElements(_sliderElement, '.slider-arrow');
      this.controlElements = this.getElements(_navigationElement, 'button');
      this.slidesElements = _slidesContainer.children();

      // set continuous to false if only one slide
      if (this.slidesElements.length < 2) this.options.continuous = false;

      //special case if two slides
      if (this.options.continuous && this.slidesElements.length < 3) {
        _slidesContainer.append(this.slidesElements[0].cloneNode(true));
        _slidesContainer.append(_slidesContainer.children()[1].cloneNode(true));
        this.slidesElements = _slidesContainer.children();
      }


      this.slidesData = this.collectSlideData(this.slidesElements);

      this.containerInnerWidth = _slidesContainer.width();
      this.containerOuterWidth = _slidesContainer.outerWidth();
      this.containerPaddingLeft = parseInt(_slidesContainer.css('padding-left'), 10);

      this.containerHeight = this.getMaxHeight();


      _slidesContainer.height(this.containerHeight);


      this.setCountClass(this.slidesElements, defaults.SLIDER_SLIDE_CLASS);

      if (this.controlElements) {
        this.setCountClass(this.controlElements, defaults.SLIDER_CONTROLL_CLASS);
        this.initControls(this.controlElements);
      }

      this.startPosition(this.options.startSlide);
      this.addResizeEvent();


    },


    /**
     * Set all slides to the source Position
     *
     * @param  {[type]} startSlide
     * @return {[type]}
     */

    startPosition: function (startSlide) {
      var _slideNumber = startSlide || 0;
      var _targetPosition;
      var _elementWidth;

      for (var i = 0; i < this.slidesElements.length; i++) {
        _elementWidth = this.slidesData[i].width;

        if (i !== _slideNumber && i > 0) {
          _targetPosition = this.containerOuterWidth;
        } else if (i !== _slideNumber) {
          _targetPosition = - this.containerOuterWidth;
        } else {
          _targetPosition = ((this.containerInnerWidth - _elementWidth) / 2) + this.containerPaddingLeft;
          _targetPosition = this.options.fullscreen ? 0 : _targetPosition;

        }


        $(this.slidesElements[i]).css({
          'position': 'absolute',
          'left': _targetPosition
        });
      }

      this.moveArrow(_slideNumber, 0);
      this.toggleActiveState(_slideNumber);


    },

    getTargetPosition: function (slide) {
      var _elementWidth = this.slidesData[slide].width;

       return (this.containerInnerWidth - _elementWidth) / 2 + this.containerPaddingLeft ;

    },

    /**
     * switches slides
     * @return {[type]}
     */
    switchSlide: function ( to, speed ) {

      if ( this.activeSlide === to ) return;

      var _from = this.activeSlide;
      var _direction;
      var _diff;
      var _originalDirection;
      var _targetPosition;
      var _speed = speed || this.duration;

      _direction = Math.abs(_from - to) / (_from - to); // 1: backward, -1: forward

       // get the actual position of the slide
      if (this.options.continuous) {
        _originalDirection = _direction;
        _direction = - $(this.slidesElements[this.circle(to)]).position().left / this.containerOuterWidth;

        this.moveSlide ( this.circle(to) - _originalDirection, this.containerOuterWidth * - _originalDirection, 0 );

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (_direction !== _originalDirection){

         // to =  -_direction * this.slidesElements.length + to;
          this.moveSlide ( this.circle(to) , this.containerOuterWidth * _direction, 0 );
        }

      }
      _diff = Math.abs(_from - to) - 1;

      while (_diff--) {
        this.moveSlide ( this.circle((to > _from ? to: _from ) - _diff - 1), this.containerOuterWidth * _direction, 0 );
      }
      to = this.circle(to);

      _targetPosition = this.options.fullscreen ? 0 : this.getTargetPosition(to);

      this.moveSlide(_from, this.containerOuterWidth * (_originalDirection || _direction), _speed);
      this.moveSlide(to, _targetPosition, _speed, this.toggleActiveState(to));
      this.moveArrow(to);
    },


    /**
     *
     * @param slide
     * @param targetPosition
     * @param callback
     * @returns {*}
     */

    moveSlide: function (slide, targetPosition, speed, callback) {
      var _slideElement = $(this.slidesElements[slide]);
      var _that = this;

      if (speed === 0) {
        _slideElement.css({
          left: targetPosition
        });


        return;
      }

     return _slideElement.stop().animate({
              left: targetPosition
            }, {
              duration: this.duration,
              easing: this.easing,
              complete: function() {
                if (_that.delay) _that.begin();
                if (typeof callback === 'function') {
                  callback(_that);
                }
              }
            }
            );
    },

    /**
     * [setActiveSlide description]
     */
    toggleActiveState: function (slideNumber) {
      this.slidesElements.removeClass('active');
      $(this.slidesElements[slideNumber]).addClass('active');

      if(this.controlElements) {
        this.controlElements.removeClass('active');
        $(this.controlElements[slideNumber]).addClass('active');
      }

      this.activeSlide = slideNumber;
    },

    /**
     *
     * @param index
     * @returns {number}
     */

    circle: function(index) {

    // a simple positive modulo using this.slidesElements.length
     return (this.slidesElements.length +
                (index % this.slidesElements.length)) % this.slidesElements.length;

    },

    begin: function() {
      var that = this;

      this.interval = setTimeout(that.next(), this.delay);

    },

    next: function() {
      if ( this.options.continuous ) { this.switchSlide(this.activeSlide + 1); }
      else if (this.activeSlide < this.slidesElements.length - 1) { this.switchSlide(this.activeSlide + 1); }
    },

    prev: function() {
      if ( this.options.continuous ) { this.switchSlide(this.activeSlide - 1); }
      else if (this.activeSlide > 0){ this.switchSlide(this.activeSlide - 1); }
    },

    stop: function() {

      this.delay = 0;
      clearTimeout(this.interval);

    },


    /**
     * [moveArrow description]
     * @param  {[type]} argument
     * @return {[type]}
     */
    moveArrow: function ( dest, speed ) {
      if (!this.arrowElement) return;

      var _arrowElement =   $(this.arrowElement),
          _targetPosition = $(this.controlElements[dest]).parent().position().left,
          _leftMargin = parseInt($(this.controlElements[dest]).parent().css('marginLeft'), 10),
          _leftPadding = parseInt($(this.controlElements[dest]).parent().css('paddingLeft'), 10),
          _controlWidth = $(this.controlElements[dest]).width(),
          _arrowWidth = $(this.arrowElement).width(),
          _centerPosition;

        _centerPosition = _controlWidth > _arrowWidth ?
          ( _controlWidth - _arrowWidth ) / 2 :  ( _arrowWidth - _controlWidth ) / 2;

        _centerPosition = _leftMargin === 0 ? 0 : _centerPosition;

      if (speed === 0) {
        _arrowElement.css({
          marginLeft: _targetPosition + _centerPosition + _leftPadding
        });

        return;
      }

      _arrowElement.stop().animate({
        marginLeft: _targetPosition + _centerPosition + _leftPadding
      },{
        duration: speed || this.duration,
        easing: this.easing
      });
    },

    getElements: function (parent, searchedElement) {
      var element = $(parent).find(searchedElement);

      return element.length > 0 ? element : null;
    },



    setCountClass: function (element, className) {
      for (var i = 0; i < element.length; i++) {
        $(element[i]).addClass(defaults.SLIDER_CLASS + className + i);
      }
    },

    collectSlideData: function (elements) {
      var data = {};

      for (var i = 0; i < elements.length; i++) {
        data[i] = {};
        data[i] = this.getSlideData(elements[i]);
      }

      return data;
    },

    /**
     *
     * @param slide
     * @returns {{width: *, height: *, direction: type[]}}
     */

    getSlideData: function (slide) {
      var _el = $(slide);

      return {
        width: _el.width(),
        height: _el.height()
      };
    },

    initControls: function (elements) {
      for (var i = 0; i < elements.length; i++) {
        this.addClickEvent(elements[i]);
      }
    },

    getMaxHeight: function () {
      var _slideDataArr = $.makeArray(this.slidesData);

      var maxHeight = $.map(_slideDataArr[0], function (index, el) {
        return index.height;
      });

      return Math.max.apply(null, maxHeight);
    },

    addClickEvent: function (element) {
      var _className = $(element).attr('class');
      var _position = parseInt(_className.substr(_className.lastIndexOf('__') + 2, _className.length - 1), 10);

      $(element).on('click', $.proxy(function ( event ) {
        this.switchSlide(_position);
      }, this));
    },

    addResizeEvent: function() {
      $(window).on('resize', $.proxy(function(){
        var _slidesContainer = this.getElements(this.$element, '.slider-slides');

        this.containerInnerWidth = _slidesContainer.width();
        this.containerOuterWidth = _slidesContainer.outerWidth();
        this.startPosition(this.activeSlide);
      }, this));
    }



  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin-' + pluginName)) {
        $.data(this, 'plugin-' + pluginName, new ClickSlider(this, options));
      }
    });
  };

})(jQuery, window, document);
