var NodeGeocoder = require('node-geocoder');

var options = {
  provider: process.env.GEOCODER_PROVIDER,
  // Optionnal depending of the providers
  httpA1dapter: 'https',                  // Default
  apiKey: process.env.GEOCODER_API_KEY,   // API Product Key
  formatter: null                         // 'gpx', 'string', ...
};
  
var geocoder = NodeGeocoder(options);

module.exports = geocoder