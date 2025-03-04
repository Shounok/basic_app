class LoadApp {
  constructor() {
    this.map = L.map('viewEsriMap').setView([23.8103, 90.4125], 7);
    
    // Add base map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    console.log('itreached me');

    // Layer groups
    this.populationLayer = L.layerGroup().addTo(this.map);
    this.buildingLayer = L.layerGroup().addTo(this.map);
    // this.elevationLayer = L.layerGroup().addTo(this.map);

    this.initializeControls();
    this.loadGeojsonData();
  }

  initializeControls() {
    // Layer toggle event listeners
    document.getElementById('population-toggle').addEventListener('change', (e) => {
        e.target.checked ? this.populationLayer.addTo(this.map) : this.map.removeLayer(this.populationLayer);
    });

    document.getElementById('building-toggle').addEventListener('change', (e) => {
        e.target.checked ? this.buildingLayer.addTo(this.map) : this.map.removeLayer(this.buildingLayer);
    });

    document.getElementById('elevation-toggle').addEventListener('change', (e) => {
        e.target.checked ? this.elevationLayer.addTo(this.map) : this.map.removeLayer(this.elevationLayer);
    });

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', () => this.searchUpazila());
}

  async loadGeojsonData() {
    try {
        // Simulated data loading (replace with actual file paths)
        const [populationData, buildingData, elevationData] = await Promise.all([
            fetch('data/adm3_bbs_upazila.geojson').then(r => r.json()),
            fetch('data/buildingpoint_clip.geojson').then(r => r.json()),
            // fetch('elevation.geojson').then(r => r.json())
        ]);
  
        this.processPopulationLayer(populationData);
        this.processBuildingLayer(buildingData);
        // this.processElevationLayer(elevationData);
  
        this.populateUpazilaSelect(populationData);
    } catch (error) {
        console.error('Error loading GeoJSON data:', error);
    }
  }
  processPopulationLayer(data) {
      L.geoJSON(data, {
          style: (feature) => ({
              fillColor: this.getPopulationColor(feature.properties.T_TL),
              color: 'black',
              weight: 1,
              fillOpacity: 0.7
          }),
          onEachFeature: (feature, layer) => {
              layer.on('click', () => this.showUpazilaInfo(feature));
          }
      }).addTo(this.populationLayer);
    };
  getPopulationColor(population) {
    return population > 50000 ? '#800026' :
            population > 25000 ? '#BD0026' :
            population > 10000 ? '#E31A1C' :
            population > 5000  ? '#FC4E2A' :
            population > 2000  ? '#FD8D3C' :
            population > 1000  ? '#FEB24C' :
                                '#FFEDA0';
  }
  processBuildingLayer(data) {
    const buildingStyles = {
        'residential': '#3388ff',
        'commercial': '#ff0000',
        'industrial': '#00ff00'
    };
  
    L.geoJSON(data, {
        style: (feature) => ({
            color: buildingStyles[feature.properties.building] || '#3388ff',
            weight: 2,
            fillOpacity: 0.5
        })
    }).addTo(this.buildingLayer);
  
    this.createBuildingLegend();
  };
  createBuildingLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = `
        <h4>Building Types</h4>
        <div><span style="background-color:#3388ff;">▬</span> Residential</div>
        <div><span style="background-color:#ff0000;">▬</span> Commercial</div>
        <div><span style="background-color:#00ff00;">▬</span> Industrial</div>
    `;
}
  populateUpazilaSelect(data) {
    const select = document.getElementById('upazila-select');
    // const upazilas = [...new Set(data.features.map(f => f.properties.ADM3_EN))];
    // upazilas.forEach(upazila => {
    //     const option = document.createElement('option');
    //     option.value = ADM3_PCODE;
    //     option.textContent = ADM3_PCODE;
    //     select.appendChild(option);
    // });
//
//
    const uniqueUpazilas = new Map(); 

    data.features.forEach(feature => {
        const { ADM3_EN, ADM3_PCODE } = feature.properties;

        if (ADM3_PCODE && ADM3_EN) {
            uniqueUpazilas.set(ADM3_PCODE, ADM3_EN); 
        }
    });

    uniqueUpazilas.forEach((ADM3_EN, ADM3_PCODE) => {
      const option = document.createElement('option');
      option.value = ADM3_PCODE;  
      option.textContent = ADM3_EN; 
      select.appendChild(option);
  });

}
  searchUpazila() {
    const selectedUpazila = document.getElementById('upazila-select').value;
    if (!selectedUpazila) return;

    const populationFeature = this.findUpazilaFeature(selectedUpazila);
    if (populationFeature) {
        this.showUpazilaInfo(populationFeature);
        this.zoomToUpazila(populationFeature);
    }
  }
  findUpazilaFeature(upazilaCode) {
    return this.populationLayer.getLayers().find(layer => 
        layer.feature.properties.ADM3_PCODE === upazilaCode
    );
  }
  showUpazilaInfo(feature) {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `
        <h3>${feature.properties.ADM3_EN}</h3>
        <p>Population: ${feature.properties.T_TL}</p>
        <p>Building Count: ${feature.properties.buildingCount || 'N/A'}</p>
    `;
    infoPanel.style.display = 'block';
  }
  zoomToUpazila(feature) {
    const layer = L.geoJSON(feature);
    this.map.fitBounds(layer.getBounds());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoadApp();
});