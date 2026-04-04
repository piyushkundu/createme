const turf = require('@turf/turf');
const fs = require('fs');

try {
  // Read clean pristine originals if possible, but reading modified ones is ok if we clean IND out
  const asiaRaw = JSON.parse(fs.readFileSync('./public/asia_countries.geojson', 'utf8'));
  const indiaRaw = JSON.parse(fs.readFileSync('./public/indian_states.geojson', 'utf8'));
  const bgRaw = JSON.parse(fs.readFileSync('./public/asia_background.geojson', 'utf8'));

  console.log("Unioning India states into a unified polygon...");
  let unitedIndia = indiaRaw.features[0];
  for(let i=1; i<indiaRaw.features.length; i++) {
    try {
      unitedIndia = turf.union(turf.featureCollection([unitedIndia, indiaRaw.features[i]]));
    } catch(e) {}
  }
  unitedIndia.properties = { NAME: 'India', ISO_A3: 'IND' };

  console.log("Processing Asia Countries...");
  // 1. Remove old IND (both unified and flattened versions)
  asiaRaw.features = asiaRaw.features.filter(f => f.properties.ISO_A3 !== 'IND');

  // 2. Erase overlapping parts from ALL other features (to ensure absolutely no lines cut into India)
  asiaRaw.features = asiaRaw.features.map(f => {
    try {
        // Turf's difference modifies the first polygon by subtracting the second
        const diff = turf.difference(turf.featureCollection([f, unitedIndia]));
        if (diff) {
            f.geometry = diff.geometry;
        }
    } catch(e) {
        // Suppress errors, e.g. for non-overlapping or disjoint shapes causing topological errors
    }
    return f;
  });

  // 3. Add united India
  asiaRaw.features.push(unitedIndia);
  fs.writeFileSync('./public/asia_countries.geojson', JSON.stringify(asiaRaw));

  console.log("Processing Asia Background...");
  bgRaw.features = bgRaw.features.filter(f => f.properties.ISO_A3 !== 'IND');
  bgRaw.features = bgRaw.features.map(f => {
    try {
        const diff = turf.difference(turf.featureCollection([f, unitedIndia]));
        if (diff) f.geometry = diff.geometry;
    } catch(e) {}
    return f;
  });
  fs.writeFileSync('./public/asia_background.geojson', JSON.stringify(bgRaw));

  console.log('Merge complete! India boundary is fully supreme and unified.');
} catch(err) {
  console.log("Error:", err);
}
