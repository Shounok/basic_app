var map = L.map('viewEsriMap').setView([23.8103, 90.4125], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


var geojsonFeature = {
  "type": "Feature",
  "geometry": {
      "type": "Point",
      "coordinates": [90.4125, 23.8103] // Longitude, Latitude
  },
  "properties": {
      "name": "Dhaka City",
      "popupContent": "This is Dhaka!"
  }
};

// Add GeoJSON layer to the map
L.geoJSON(geojsonFeature, {
  onEachFeature: function (feature, layer) {
      if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
      }
  }
}).addTo(map);