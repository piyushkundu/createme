const turf = require('@turf/turf');
const fs = require('fs');

try {
  const indiaRaw = JSON.parse(fs.readFileSync('./public/indian_states.geojson', 'utf8'));
  console.log("Unioning...", indiaRaw.features.length, "features");
  
  // Create an initial polygon to unite into
  let united = indiaRaw.features[0];
  
  for(let i=1; i<indiaRaw.features.length; i++) {
    try {
      united = turf.union(turf.featureCollection([united, indiaRaw.features[i]]));
    } catch(e) {
      console.log("Skipping internal union error for a feature", i);
    }
  }

  united.properties = { NAME: 'India', ISO_A3: 'IND' };
  
  // write out to check
  fs.writeFileSync('united_india_test.geojson', JSON.stringify(united));
  console.log("Union SUCCESS!");

} catch (err) {
  console.error("Error:", err);
}
