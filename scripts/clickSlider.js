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
      propertyName: 'value'
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
    this._name = pluginName;

    this.SLIDER_CLASS = 'slider';
    this.SLIDER_CONTROLL_CLASS = '-control__';
    this.SLIDER_SLIDES_CONTAINER = 'slider-slides';
    this.SLIDER_SLIDE_CLASS = '-slide__';

    this.SLIDER_ID = _makeID();

    this.DEFAULT_EASING = 'linear';
    this.DEFAULT_DURATION = 1000;//ms

    this.easing = this.options.easing || this.DEFAULT_EASING;
    this.duration = this.options.duration || this.DEFAULT_DURATION;

    this.activeSlide = this.options.startSlide || 0;

//
//    this.slidesData;
//    this.containerInnerWidth;
//    this.containerOuterWidth;
//    this.containerHeight;
//
//
//    this.slidesElements;
//    this.controlElements;

    /**
     * Generates random string
     * @return {[string]} random string
     */

    function _makeID() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    this.init();
  }

  ClickSlider.prototype = {

    variables: this,

    init: function () {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.$element
      // and this.options
      // you can add more functions like the one below and
      // call them like so: this.yourOtherFunction().
      var _sliderElement = this.$element;
      var _navigationElement = this.getElements(_sliderElement, '.slider-nav');
      var _arrowElement = this.getElements(_sliderElement, '.slider-arrow');
      var _slidesContainer = this.getElements(_sliderElement, '.slider-slides');

      this.controlElements = this.getElements(_navigationElement, 'button');
      this.slidesElements = _slidesContainer.children('div[id^="slider-slide"]');


      this.slidesData = this.collectSlideData(this.slidesElements);


      this.containerInnerWidth = _slidesContainer.width();
      this.containerOuterWidth = _slidesContainer.outerWidth();
      this.containerHeight = this.getMaxHeight();

      console.log('containerInnerWidth', this.containerInnerWidth);
      console.log('containerOuterWidth', this.containerOuterWidth);


      _slidesContainer.height(this.containerHeight);


      this.setCountClass(this.controlElements, this.SLIDER_CONTROLL_CLASS);
      this.setCountClass(this.slidesElements, this.SLIDER_SLIDE_CLASS);


      this.initControls(this.controlElements);

      this.startPosition(this.options.startSlide);
      //switchSlide( options.startSlide );
    },

    /**
     * Set all slides to the source Position
     *
     * @param  {[type]} startSlide
     * @return {[type]}
     */

    startPosition: function (startSlide) {
      var _slideNumber = startSlide || 0;
      var _slideClass = '.' + this.SLIDER_CLASS + this.SLIDER_SLIDE_CLASS;
      var _targetPosition;
      var _elementWidth;

      for (var i = 0; i < this.slidesElements.length; i++) {
        _elementWidth = this.slidesData[i].width;

        if (i !== _slideNumber && i > 0) {
          _targetPosition = this.containerOuterWidth;
        } else if (i !== _slideNumber) {
          _targetPosition = 0 - _elementWidth;
        } else {
          _targetPosition = (this.containerOuterWidth - _elementWidth) / 2;
        }

        $(_slideClass + i).css({
          'position': 'absolute',
          'left': _targetPosition
        });
      }

      this.toggleActiveState(_slideNumber);

    },


    /**
     * switches slides
     * @return {[type]}
     */
    switchSlide: function (slide, data) {
      var _slideNumber = slide || 0;
      var _slideClass = this.SLIDER_CLASS + this.SLIDER_SLIDE_CLASS;
      var _direction;

      if (this.activeSlide > _slideNumber) {
        _direction = 'right';
      } else if (this.activeSlide < _slideNumber) {
        _direction = 'left';
      } else {
        return;
      }

      this.moveSlide(_slideClass + _slideNumber, this.getTargetPosition(_slideNumber, _direction));
      this.moveSlide(_slideClass + this.activeSlide, this.getTargetPosition(this.activeSlide, _direction), this.toggleActiveState(_slideNumber));
    },

    getTargetPosition: function (slide, direction) {
      var _elementWidth = this.slidesData[slide].width;

      if (slide !== this.activeSlide) {
        return (this.containerInnerWidth - _elementWidth) / 2;
      } else if (direction === 'left') {
        return 0 - _elementWidth;
      } else {
        return this.containerOuterWidth;
      }
    },


    /**
     *
     * @param slide
     * @param targetPosition
     * @param callback
     * @returns {*}
     */

    moveSlide: function (slide, targetPosition, callback) {

     return $('.' + slide).animate({
              left: targetPosition
            }, {
              duration: duration,
              easing: easing,
              queue: true
            },
            callback);
    },

    /**
     * [getDirection description]
     * @param  {[type]} slide
     * @return {[type]}
     */

    getDirection: function (slide) {
      var direction,
        _slidePosition = $(slide).position().left;

      if (_slidePosition < 0) {
        direction = 'left';
      } else if (_slidePosition > this.containerOuterWidth) {
        direction = 'right';
      } else {
        direction = 'both';
      }

      return direction;
    },

    /**
     * [setActiveSlide description]
     */
    toggleActiveState: function (slideNumber) {
      var _slideNumber = slideNumber || 0;
      var _slideClassName = '.' + this.SLIDER_CLASS + this.SLIDER_SLIDE_CLASS + _slideNumber;
      var _controllerClassName = '.' + this.SLIDER_CLASS + this.SLIDER_CONTROLL_CLASS + _slideNumber;

      this.slidesElements.removeClass('active');
      this.controlElements.removeClass('active');

      $(_slideClassName).addClass('active');
      $(_controllerClassName).addClass('active');

      this.activeSlide = _slideNumber;
    },

    /**
     * [isActive description]
     * @param  {[type]}  el
     * @return {Boolean}
     */
    isActive: function (el) {
      return $(el).hasClass('active');
    },

    /**
     * [isFirst description]
     * @return {Boolean}
     */
    isFirst: function (el) {

    },

    /**
     * [isLast description]
     * @return {Boolean}
     */
    isLast: function () {

    },

    /**
     * [autoPlay description]
     * @return {[type]}
     */

    autoPlay: function () {
      // body...
    },

    /**
     * [moveArrow description]
     * @param  {[type]} argument
     * @return {[type]}
     */
    moveArrow: function (argument) {
      // body...
    },

    getData: function() {
      return this;
    },

    getElements: function (parent, searchedElement) {
      var element = $(parent).find(searchedElement);

      return element.length > 0 ? element : null;
    },



    setCountClass: function (element, className) {
      for (var i = 0; i < element.length; i++) {
        $(element[i]).addClass(this.SLIDER_CLASS + className + i);
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
        height: _el.height(),
        direction: this.getDirection(_el)
      };
    },

    initControls: function (elements) {
      for (var i = 0; i < elements.length; i++) {
        this.addClickEvent(elements[i]);
      }
    },

    addClickEvent: function (element) {
      var _className = $(element).attr('class');
      var _position = parseInt(_className.substr(_className.lastIndexOf('__') + 2, _className.length - 1), 10);
      var _that = this;

      $(element).on('click', _that, function ( event ) {
        ClickSlider.prototype.switchSlide(_position, event.data);
      });
    },

    getMaxHeight: function () {
      var _slideDataArr = $.makeArray(this.slidesData);

      var maxHeight = $.map(_slideDataArr[0], function (index, el) {
        return index.height;
      });

      return Math.max.apply(null, maxHeight);
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
