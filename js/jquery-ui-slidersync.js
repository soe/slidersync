(function($){
  var SLIDERSYNC = {};
  SLIDERSYNC['changing'] = false;
  
  $.fn.slidersync = function(options) {
    
    var _options = $.extend({
      'sliders': false,
      'vals': false,
      'val_prefix': false,
      'val_suffix': false,
      'range': 'min',
      'min': 0,
      'max': 100,
      'step': 1,
      'animate' : false,
      'orientation': 'horizontal',
    }, options);
        
    var _id = this.attr('id');
	  SLIDERSYNC[_id] = {};
  	
  	// if list of sliders are given, dynamically create slider containers
  	if(_options.sliders) {
  	  this.empty();
  	  var _appendTo = '', _sliders = '', _vals = '';

  	  for(i in _options.sliders) {
  	    _sliders += '<span class="slider">'+ _options.sliders[i] +'</span>';
  	    
  	    _vals += '<span class="val">';
  	    if(_options.val_prefix) _vals += _options.val_prefix;
  	    _vals += '<input value="'+ _options.sliders[i] +'" />';
  	    if(_options.val_suffix) _vals += _options.val_suffix;
  	    _vals += '</span>';
  	  }

  	  // vals
  	  if(_options.vals == 'left' || _options.vals == 'top') _appendTo += '<div class="vals">'+ _vals +'</div>';
  	  // sliders
  	  _appendTo += '<div class="sliders">'+ _sliders +'</div>';
  	  // vals
  	  if(_options.vals == 'right' || _options.vals == 'bottom') _appendTo += '<div class="vals">'+ _vals +'</div>'; 
  	  
  	  $(_appendTo).appendTo(this);
  	}

  	this.find('.slider').each(function() {
	    // read initial values from markup and remove that
			var value = parseInt($(this).text(), 10);

			$(this).empty().slider({
        range: _options.range,		
				value: value,
				min: _options.min,
				max: _options.max,
				step: _options.step,
				animate: _options.animate,
				orientation: _options.orientation,
				start: function(e, ui) {
				  SLIDERSYNC[_id]['before'] = ui.value;
				},
				stop: function(e, ui) {
				  _adjust(_id, ui.value, $(this).index(), _options);
				}
			});
	  }); // end each     	  
	  

	  var _adjust = function(_id, value, index, _options) {
	    var _delta = SLIDERSYNC[_id]['before'] - value;

		  if(_delta == 0) return false; // don't proceed if no change

	    var _sliders = []; // keep track of sliders' values
	    var _indices = [index]; // indices to skip, first set it for the one which has changed

	    var _max = _options.max;
	    var _min = _options.min;

      // initially get the sliders' values
      // this is to optimize by reducing DOM access while adjusting values
	    $('#'+ _id +' .slider').each(function() {
        _sliders.push(parseInt($(this).slider('value')));
      });

      j = 0
      while(_delta != 0 && j < 2) { j++;
        var _i = _delta / (_sliders.length - _indices.length) | 0; // increment
  	    var _r = _delta % (_sliders.length - _indices.length); // remainder

  	    //console.log('_delta: '+ _delta +', _i: '+ _i +', _r: '+ _r);
  	    //console.log(_indices);

        for(i in _sliders) {
          i = parseInt(i);
	        if(_indices.indexOf(i) == -1) { // adjust only if the slider is not in the skip list
	          var _adj = _i; 

            if(_r > 0) {
	            _adj++; _r--;
	          } else if(_r < 0) {
	            _adj--; _r++;
	          }

	          if(_adj > 0 && _max < _sliders[i] + _adj) { 
	            // increasing and max is lower than adjustment
	            _delta -= _max - _sliders[i];
	            _sliders[i] = _max;
	            _indices.push(i);
	          } else if(_adj < 0 && _min > _sliders[i] + _adj) { 
	            // decreasing and min is higher than adjustment
	            _delta += _sliders[i] - _min;
	            _sliders[i] = _min;
	            _indices.push(i);
	          } else {
	            _delta -= _adj;
	            _sliders[i] += _adj;
	          } // end if
	        } // end if
	      } // end for

        // no sufficient adjustment with the rest of sliders - so adjust the current slider
        if(_delta != 0 && _sliders.length == _indices.length) {
          _sliders[index] += _delta;
          _delta = 0;
        } // end if
	    } // end while
	    
	    // now set the values for sliders
	    SLIDERSYNC['changing'] = true;
	    $('#'+ _id +' .slider').each(function(i) {
        $(this).slider('value', _sliders[i]);
        
        if(_options.vals) $('#'+ _id +' .val:eq('+ i +') input').val(_sliders[i]);
      });
      SLIDERSYNC['changing'] = false;
      $('#'+ _id).trigger('slidersynced');
      
    } // end function - adjust
  }; // end $.fn.slidersync
})(jQuery);