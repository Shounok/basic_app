## Application Structure:

- Uses Leaflet.js for mapping
- Turf.js for spatial operations
- Responsive design with not so mobile-friendly layout
- Layer toggle functionality
- Upazila search and information display

## Features Implemented:

- Layer Toggling (Population, Building, Elevation)
- Upazila-wise population and building count search

## Setup Instructions
1. Prepare GeoJSON Files
2. For Local Development, open command prompt in the project root and run: 
   ```bash
   npx http-server
   ```
3. By default, the server should start locally at [IP]: 127.0.0.1:8080. 
4. Browse [IP] for ArcGIS JS SDK version.
5. Browse '[IP]/leafindex.html' for Leaflet JS version.

## Switch Between Branches
### For Leaflet
- Checkout to 'leafversion' branch of the app with leaflet.js
### For ArcGIS JS SDK
- Checkout to 'arcgisversion' branch of the app with ArcGIS JS SDK
