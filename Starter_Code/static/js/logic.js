
//Data Set

let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to create a markerSize 

function markerSize(magnitude) {
    return magnitude *25000;
};

// Creating baseMaps

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Create a baseMaps object      
let baseMaps = {
    "Street Map": street,

};

// Create an overlay objects

let earthquakes = new L.LayerGroup();

let overlayMaps = {
    Earthquakes: earthquakes
};

// Create my map

let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
});
street.addTo(myMap);

L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
}).addTo(myMap);

// Perform a GET request to the query URL      

d3.json(queryUrl).then(function(data) {
    console.log(data)
    // Define a marker Color based on earthquate depth 

    const depthColors = ["#00FF00", "#FFFF00", "#FF0000"];

    const depthLabels = ["< 10 km", "10 - 50 km", "> 50 km"];

    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }
// Create functions that contains each feature 
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 5;
    }

    function mapStyle(feature) {
        const depth = feature.geometry.coordinates[2];
        const magnitude = feature.properties.mag;
        console.log(depth)
        console.log(magnitude)


        return {
            color: "#fff",
            fillColor: getColor(feature.geometry.coordinates[2]),
            radius: getRadius(magnitude),
            opacity: 1,
            fillOpacity: 1,
            stroke: true,
            weight: 0.5
        };
    }

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,
        onEachFeature: onEachFeature
    }).addTo(myMap);

    // Create a legend 

    function createLegend() {
        let legend = L.control({
            position: "bottomright"
        });
        legend.onAdd = function(map) {
            let div = L.DomUtil.create("div", "info legend");
            let grades = [0, 10, 30, 50, 70, 90];
            let labels = [];

            // Add legend content to the div
            div.innerHTML += "<h4>Depth Legend</h4>";

            // Loop through the depth ranges and generate legend labels            
            for (let i = 0; i < depthColors.length; i++) {
                div.innerHTML +=
                    '<i style="background:' +
                    depthColors[i] +
                    '"></i> ' +
                    depthLabels[i] +
                    "<br>";
            }

            return div;
        };

        return legend;
    }

// Adding legend to the map      

   createLegend().addTo(myMap);

});