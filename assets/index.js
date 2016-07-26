//Please note that navigator.geolocation requires https:// when using Chrome or you won't get a prompt to share your location

'use strict';

/* === Timer Methods === */

var refreshTime = 600000, //600000 for 10 minutes
    timeToRefresh = null,
    currentLatLng = [],
    isUS = null, //is fahrenheit/mph or celsius/kph
    tempF = null,
    tempC = null,
    windM = null,
    windK = null;

function refreshTimer(currentTime, refreshTime){
  timeToRefresh -= 1000;
  if (timeToRefresh < 0){
    //reset timer and update/request data
    updateWeather();
    timeToRefresh = refreshTime;
  }
  setTimer();
}

/* === Conversion/Formatting Methods === */

//converts from milliseconds to pretty format
function setTimer(){
  var secPrefix = '',
      minPrefix = '',
      secondsToRefresh = Math.floor(timeToRefresh/1000),
      minutesToRefresh = Math.floor(secondsToRefresh/60);
  secondsToRefresh = secondsToRefresh % 60;
  
  if (secondsToRefresh < 10){
    secPrefix = '0';
  }
  if (minutesToRefresh < 10){
    minPrefix = '0';
  }
  
  $('#timer').text('Next Update: ' + minPrefix + minutesToRefresh + ':' + secPrefix + secondsToRefresh);
}

function updateLastUpdateTime(){
  var date = new Date(),
      currentTime = null,
      currentPrettyTime = '';
  
  currentTime = date.getTime().toString();
  return getPrettyTime(date);
}

//converts Date time 24hr to 12hr
function getPrettyTime(date){
  //adapted from SO - bbrame
  var hr = date.getHours();
  var min = date.getMinutes();
  var suffix = (hr >= 12) ? 'pm' : 'am';
  hr = hr % 12;
  hr = (hr == 0) ? 12 : hr;
  min = (min < 10) ? '0' + min : min;
  return hr + ':' + min + ' ' + suffix;
}

function getIconText(data){
  if(data == null || data == undefined) {
    return 'Weather Description Unavailable';
  } else {
    data = data.replace(/-/g, ' ');
    data = data.replace(/\w\S*/g, function(str){
      return str.charAt(0).toUpperCase() + str.substr(1);
    });
    return data.replace(/\s(Day|Night)/, '');
  }
}

function setIconCSS(data){
  var status = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night', 'hail', 'thunderstorm', 'tornado'];
  var iconURL = (status.indexOf(data) == -1) ? 'cloudy' : data;
  $('#w-icon').attr('src', 'https://github.com/Meepasaurus/fcc-images/blob/master/local-weather/icons/' + data + '.png?raw=true');
  $('#w-icon').attr('alt', data + ' icon');
}

//fanrenheit to celsius
function fToC(temp){
  return Math.round((temp-32)*(5/9));
}

//mph to kph
function mToK(speed){
  return Math.round(speed * 1.609344);
}

/* === Data Methods === */

function updateWeather(){
  
  $('#location-time').text('Local Weather as of ' + updateLastUpdateTime());
  
  //forecast.io
  //Using client-side API keys is bad, but that's what FCC asks for this project. Please don't spam.
  $.ajax({
    dataType: 'jsonp',
    url: 'https://api.forecast.io/forecast/e9097c35ea613c2b9cecdbe75e35d04c/'+ currentLatLng[0] + ',' + currentLatLng[1],
    success: function(data) {
      $('#w-description').text(getIconText(data.currently.icon));
      setIconCSS(data.currently.icon);
      tempF = data.currently.temperature;
      tempC = fToC(tempF);
      var tempToDisplay = (isUS ? Math.round(tempF) : Math.round(tempC));
      $('#w-temperature').text(tempToDisplay);
      $('#w-precipitation').text(Math.round(data.currently.precipProbability*100));
      $('#w-humidity').text(Math.round(data.currently.humidity*100));
      windM = data.currently.windSpeed;
      windK = mToK(windM);
      var windToDisplay = (isUS ? Math.round(windM) : Math.round(windK));
      $('#w-windspeed').text(windToDisplay);
      $('.weather-box').fadeIn();
      $('#timer-container').fadeIn();
    },
    error: function(err){
      console.log('forecast.io request error: ' + err);
    }
  });
}

function geo_success(pos){
  /* Google Reverse Geocoding adapted from https://www.raymondcamden.com/2013/03/05/Simple-Reverse-Geocoding-Example/ 
  and https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse*/
  $('#location').html('Loading Local Weather...</br></br>&nbsp;');
  
  var geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
  currentLatLng = [pos.coords.latitude, pos.coords.longitude];
  
  //gets named address
  geocoder.geocode({'latLng': latlng}, function(results, status){
    if (status == google.maps.GeocoderStatus.OK){
      
      var date = new Date(),
          currentTime = null,
          currentTime = date.getTime().toString();
      
      if (results[1]){
        $('#location-address').text(results[1].formatted_address);
      } else {
        $('#location-address').text('No-Named Mystery Location');
      }
      
      //initialize timer
      timeToRefresh = refreshTime;  
      setTimer();
  
      //update counter each second
      var timer = setInterval(function(){refreshTimer(currentTime, refreshTime)}, 1000);
      updateWeather();
	  } else {
      $('#location').text('Google Maps error. Status: ' + status);
    }
  });
}

function geo_error(){
  $('#location').text('Unable to find current location.');
}

function setTempButtons(isCurrentlyUS, setLocal){
  if (isCurrentlyUS === false){
    $('#w-temperature-units').text('C');
    $('#w-wind-units').text(' kph');
    $('#temp-c-button').css({'background-color':'#666', 'box-shadow':'inset 0 0 5px 2px #222'});
    $('#temp-f-button').css({'background-color':'#333', 'box-shadow':'none'});
    if (setLocal === true){
      isUS = false;
      localStorage.setItem('isUS', 'false');
      $('#w-temperature').text(Math.round(tempC));
      $('#w-windspeed').text(Math.round(windK));
    }
  } else {
    isUS = true;
    localStorage.setItem('isUS', 'true');
    $('#w-temperature').text(Math.round(tempF));
    $('#w-windspeed').text(Math.round(windM));
    $('#w-temperature-units').text('F');
    $('#w-wind-units').text(' mph');
    $('#temp-f-button').css({'background-color':'#666', 'box-shadow':'inset 0 0 5px 2px #222'});
    $('#temp-c-button').css({'background-color':'#333', 'box-shadow':'none'});
  }
}

$(document).ready(function(){
  //get or initialize units settings
  isUS = $.parseJSON(localStorage.getItem('isUS'));
  if (isUS == null){
    isUS = true;
    localStorage.setItem('isUS', 'true');
  }
  if (isUS === false){
    setTempButtons(false, false);
  }
  
  //check for user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, {timeout:30000});
  } else {
    geo_error();
  }
  
  //change units
  $('#temp-f-button').on('click', function(event){
    event.preventDefault();
    if (isUS === false){
      setTempButtons(true, true);
    }
  });
  
  $('#temp-c-button').on('click', function(event){
    event.preventDefault();
    if (isUS === true){
      setTempButtons(false, true);
    }
  });
});