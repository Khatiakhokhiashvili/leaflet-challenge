// Define the URL to fetch earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the basemap layer using OpenStreetMap
let basemap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
);

// Initialize the map
let myMap = L.map("map", {
  center: [37.7749, -122.4194], // Center the map to San Francisco
  zoom: 5,
  layers: [basemap]
});

// Fetch the earthquake data
d3.json(url).then(function(data) {
  // Function to set the color based on depth
  function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#a6d96a';
  }

  // Function to set the radius based on magnitude
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: function(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    },
    // Called on each feature
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place +
        "</h3><hr><p>Date & Time: " + new Date(feature.properties.time) + "</p>" +
        "<p>Magnitude: " + feature.properties.mag + "</p>" +
        "<p>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }
  }).addTo(myMap);

  // Add a legend to the map
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    let div = L.DomUtil.create("div", "info legend"),
      grades = [-10, 10, 30, 50, 70, 90],
      labels = [];

    // Loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
});
