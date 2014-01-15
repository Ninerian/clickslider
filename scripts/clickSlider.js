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
  var pluginName = 'clickSlider',
    defaults = {
      propertyName: 'value'
    };

  // The actual plugin constructor
  function clickSlider(element, options) {
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
    this.init();
  }

  clickSlider.prototype = {
    init: function () {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.$element
      // and this.options
      // you can add more functions like the one below and
      // call them like so: this.yourOtherFunction().
      this.$element.addClass('success');
    },
    yourOtherFunction: function () {
      // some logic
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin-' + pluginName)) {
        $.data(this, 'plugin-' + pluginName, new clickSlider(this, options));
      }
    });
  };

})(jQuery, window, document);

//  (function($){
//    'use strict';
//
//    $.fn.clickSlider = function( params ) {
//
//    var SLIDER_CLASS = 'slider';
//    var SLIDER_CONTROLL_CLASS = '-control__';
//    var SLIDER_SLIDES_CONTAINER = 'slider-slides';
//    var SLIDER_SLIDE_CLASS = '-slide__';
//
//    var SLIDER_ID = _makeid();
//
//    var DEFAULT_EASING = 'linear';
//    var DEFAULT_DURATION = 1000;//ms
//
//    var options = params || {};
//    var easing = options.easing || DEFAULT_EASING;
//    var duration = options.duration || DEFAULT_DURATION;
//
//    var activeSlide = options.startSlide || 0;
//
//
//    var slidesData;
//    var containerInnerWidth;
//    var containerOuterWidth;
//    var containerHeight;
//
//
//    var slidesElements;
//    var controlElements;
//
//
//
//  /**
//  * erzeugt Slider
//  */
//
//  function init( slider ) {
//    var _sliderElement = $(slider);
//    var _navigationElement = getElements(_sliderElement, '.slider__nav');
//    var _arrowElement = getElements(_sliderElement, '.slider__arrow');
//    var _slidesContainer = getElements(_sliderElement, '.slider-slides');
//
//    controlElements = getElements(_navigationElement, 'button');
//    slidesElements = _slidesContainer.children('div[id^="slider-slide"]');
//
//
//    slidesData = collectSlideData(slidesElements);
//
//
//    containerInnerWidth = _slidesContainer.width();
//    containerOuterWidth = _slidesContainer.outerWidth();
//    containerHeight = getMaxHeight();
//
//    console.log('containerInnerWidth', containerInnerWidth);
//    console.log('containerOuterWidth', containerOuterWidth);
//
//
//    _slidesContainer.height(containerHeight);
//
//
//    setCountClass(controlElements, SLIDER_CONTROLL_CLASS);
//    setCountClass(slidesElements, SLIDER_SLIDE_CLASS);
//
//
//    initControls ( controlElements );
//
//    startPosition ( options.startSlide );
//    //switchSlide( options.startSlide );
//
//    }
//
//  /**
//  * Set all slides to the source Position
//  *
//  * @param  {[type]} startSlide
//  * @return {[type]}
//  */
//
//  function startPosition ( startSlide ) {
//    var _slideNumber = startSlide || 0;
//    var	_slideClass = '.' + SLIDER_CLASS + SLIDER_SLIDE_CLASS;
//    var _targetPosition;
//    var _elementWidth;
//
//    for (var i = 0; i < slidesElements.length; i++) {
//    _elementWidth = slidesData[i].width;
//
//    if ( i !== _slideNumber && i > 0) {
//    _targetPosition = containerOuterWidth;
//    } else if ( i !== _slideNumber) {
//    _targetPosition =  0 - _elementWidth;
//    } else {
//    _targetPosition = (containerOuterWidth - _elementWidth) / 2;
//    }
//
//  $(_slideClass + i).css({
//    'position': 'absolute',
//    'left': _targetPosition});
//  }
//
//  toggleActiveState( _slideNumber );
//  }
//
//  /**
//  * switches slides
//  * @return {[type]}
//  */
//  function switchSlide( slide ) {
//    var _slideNumber = slide || 0;
//    var	_slideClass = SLIDER_CLASS + SLIDER_SLIDE_CLASS;
//    var _direction;
//
//    if (activeSlide > _slideNumber) {
//    _direction = 'right';
//    } else if (activeSlide < _slideNumber) {
//    _direction = 'left';
//    } else {
//    return;
//    }
//
//  moveSlide(_slideClass  + _slideNumber, getTargetPosition( _slideNumber, _direction ));
//  moveSlide(_slideClass  + activeSlide, getTargetPosition( activeSlide, _direction),
//  toggleActiveState(_slideNumber));
//  }
//
//  function getTargetPosition( slide, direction ) {
//    var _elementWidth = slidesData[slide].width;
//
//    if (slide !== activeSlide) {
//    return (containerInnerWidth - _elementWidth) / 2;
//    } else if ( direction === 'left' ) {
//    return 0 - _elementWidth;
//    } else {
//    return containerOuterWidth;
//    }
//  }
//
//
//
//  /**
//  * moves slide in the given direction
//  * @param  {[type]} slide
//  * @param  {[type]} direction
//  * @return {[type]}
//  */
//
//  function moveSlide(slide, targetPosition, callback) {
//    $('.'+slide).css('position', 'absolute');
//
//    $('.'+slide).animate( {
//    left: targetPosition
//    }, {
//    duration: duration,
//    easing: easing,
//    queue: true
//    },
//  callback );
//  }
//
//  /**
//  * [getDirection description]
//  * @param  {[type]} slide
//  * @return {[type]}
//  */
//
//  function getDirection(slide) {
//    var direction,
//    _slidePosition = $(slide).position().left;
//
//    if (_slidePosition < 0) {
//    direction = 'left';
//    } else if (_slidePosition > containerOuterWidth) {
//    direction = 'right';
//    } else {
//    direction = 'both';
//    }
//
//  return direction;
//  }
//
//  /**
//  * [setActiveSlide description]
//  */
//  function toggleActiveState( slideNumber ) {
//    var _slideNumber = slideNumber || 0;
//    var	_slideClassName = '.'+ SLIDER_CLASS + SLIDER_SLIDE_CLASS + _slideNumber;
//    var _controllerClassName = '.'+ SLIDER_CLASS + SLIDER_CONTROLL_CLASS + _slideNumber;
//
//    slidesElements.removeClass('active');
//    controlElements.removeClass('active');
//
//    $(_slideClassName).addClass('active');
//    $(_controllerClassName).addClass('active');
//
//    activeSlide = _slideNumber;
//    }
//
//  /**
//  * [isActive description]
//  * @param  {[type]}  el
//  * @return {Boolean}
//  */
//  function isActive ( el ) {
//    return $(el).hasClass('active');
//    }
//
//  /**
//  * [isFirst description]
//  * @return {Boolean}
//  */
//  function isFirst( el ) {
//
//    }
//
//  /**
//  * [isLast description]
//  * @return {Boolean}
//  */
//  function isLast() {
//
//    }
//
//  /**
//  * [autoPlay description]
//  * @return {[type]}
//  */
//
//  function autoPlay() {
//    // body...
//    }
//
//  /**
//  * [moveArrow description]
//  * @param  {[type]} argument
//  * @return {[type]}
//  */
//  function moveArrow(argument) {
//    // body...
//    }
//
//  function getElements(parent, searchedElement) {
//    var element = $(parent).find(searchedElement);
//
//    return element.length > 0 ? element : null;
//    }
//
//  /**
//  * Generates random string
//  * @return {[string]} random string
//  */
//
//  function _makeid()
//		{
//      var text = "";
//      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
//      for( var i=0; i < 5; i++ )
//      text += possible.charAt(Math.floor(Math.random() * possible.length));
//
//      return text;
//      }
//
//  function setCountClass( element, className ) {
//    for (var i = 0; i < element.length; i++) {
//    $(element[i]).addClass(SLIDER_CLASS + className + i);
//    }
//  }
//
//  function collectSlideData (elements) {
//    var data = {};
//
//  for (var i = 0; i < elements.length; i++) {
//      data[i] = {};
//    data[i] = getSlideData(elements[i]);
//    }
//
//    return data;
//    }
//
//    /**
//    * [getSlidesData description]
//    * @param  {[type]} slide
//    * @return {[type]}
//    */
//
//    function getSlideData( slide ) {
//      var _el = $(slide);
//
//      return	{
//      width: _el.width(),
//      height: _el.height(),
//      direction: getDirection(_el)
//      };
//    }
//
//    function initControls ( elements ) {
//      for (var i = 0; i < elements.length; i++) {
//      addClickEvent(elements[i]);
//      }
//    }
//
//    function addClickEvent ( element ) {
//      var _className = $(element).attr('class');
//      var _position = parseInt(_className.substr(_className.lastIndexOf('__') +2, _className.length -1), 10);
//
//      $(element).on('click', function() {
//      switchSlide(_position);
//      });
//    }
//
//    function getMaxHeight () {
//      var _slideDataArr = $.makeArray( slidesData );
//
//      var maxHeight = $.map( _slideDataArr[0], function ( index, el ) {
//      return index.height;
//      });
//
//    return Math.max.apply(null, maxHeight);
//    }
//
//
//    init(this);
//    };
//    }(jQuery));