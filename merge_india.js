const turf = require('@turf/turf');
const fs = require('fs');

try {
  const asiaRaw = JSON.parse(fs.readFileSync('./public/asia_countries.geojson', 'utf8'));
  const indiaRaw = JSON.parse(fs.readFileSync('./public/indian_states.geojson', 'utf8'));

  // 1. Remove old IND from asia Raw
  asiaRaw.features = asiaRaw.features.filter(f => f.properties.ISO_A3 !== 'IND');

  // 2. Extract all polygons and make a single MultiPolygon
  let allCoords = [];
  
  // Using turf to ensure we handle GeometryCollections or nested MultiPolygons correctly
  turf.flatten(indiaRaw).features.forEach(f => {
    if (f.geometry && f.geometry.type === 'Polygon') {
       allCoords.push(f.geometry.coordinates);
    }
  });

  const mergedIndiaFeature = {
    type: 'Feature',
    properties: { NAME: 'India', ISO_A3: 'IND' },
    geometry: {
      type: 'MultiPolygon',
      coordinates: allCoords
    }
  };

  asiaRaw.features.push(mergedIndiaFeature);

  fs.writeFileSync('./public/asia_countries.geojson', JSON.stringify(asiaRaw));
  console.log('Successfully replaced India with official boundaries!');
} catch (err) {
  console.error("Error during merge:", err);
}
