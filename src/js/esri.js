require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search",
  "esri/layers/GeoJSONLayer",
  "esri/layers/GroupLayer",
  "esri/widgets/LayerList",
  "esri/symbols/SimpleFillSymbol",
  "esri/renderers/UniqueValueRenderer",
  "esri/renderers/ClassBreaksRenderer",
  "esri/smartMapping/symbology/color",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/popup/content/TextContent",
  "esri/popup/content/CustomContent",
], function(
  Map, 
  MapView, 
  Search,
  GeoJSONLayer, 
  GroupLayer, 
  LayerList,
  SimpleFillSymbol,
  UniqueValueRenderer,
  ClassBreaksRenderer,
  colorSymbology,
  Legend,
  Expand,
  TextContent,
  CustomContent
) {
  class LoadApp {
      constructor() {
          this.initMap();
      }

      async initMap() {
          // Create map and view
          this.map = new Map({
              basemap: "streets-navigation-vector"
          });

          this.view = new MapView({
              container: "viewEsriMap",
              map: this.map,
              center: [90.4125, 23.8103],
              zoom: 7
          });

          // Create layer groups
          this.populationGroup = new GroupLayer({
              title: "Population Layer",
              visible: true
          });
          this.buildingGroup = new GroupLayer({
              title: "Building Layer",
              visible: true
          });
          

          // Load GeoJSON layers
          await this.loadLayers();

          // Add layers to map
          this.map.addMany([
              this.populationGroup, 
              this.buildingGroup, 
          ]);
          
          // Setup event listeners
          this.setupEventListeners();
          this.setupWidgets();
      }

      async loadLayers() {
          try {
              // Population Layer
              const populationLayer = await this.createPopulationLayer();
              this.populationGroup.add(populationLayer);
              this.setupPopupHandler(populationLayer);

              // Building Layer
              const buildingLayer = await this.createBuildingLayer();
              this.buildingGroup.add(buildingLayer);

              // Populate Upazila Select
              this.populateUpazilaSelect(populationLayer);

              // Setup click handler for spatial queries
              this.setupSpatialQueries(populationLayer);
          } catch (error) {
              console.error("Error loading layers:", error);
          }
      }

      async createPopulationLayer() {
          const layer = new GeoJSONLayer({
              title: "Population Layer",
              url: "data/adm3_bbs_upazila.geojson",
              // fields: ["ADM3_NAME", "ADM3_PCODE", "T_TL", "M_TL", "F_TL"],
              renderer: new ClassBreaksRenderer({
                  field: "T_TL",
                  classBreakInfos: [
                      {
                          minValue: 0,
                          maxValue: 5000,
                          symbol: new SimpleFillSymbol({
                              color: [255, 255, 178, 0.7],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      },
                      {
                          minValue: 5001,
                          maxValue: 25000,
                          symbol: new SimpleFillSymbol({
                              color: [254, 204, 92, 0.7],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      },
                      {
                          minValue: 25001,
                          maxValue: 50000,
                          symbol: new SimpleFillSymbol({
                              color: [253, 141, 60, 0.7],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      },
                      {
                          minValue: 50001,
                          maxValue: Infinity,
                          symbol: new SimpleFillSymbol({
                              color: [227, 26, 28, 0.7],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      }
                  ]
              }),
              popupTemplate: {
                title: "{ADM3_NAME}",
                // content: [
                //     {
                //         type: "custom",
                //         creator: (feature) => {
                //             // Create a container for popup content
                //             const container = document.createElement("div");
                //             console.log("feature.graphic.attributes", feature.graphic);
                //             container.innerHTML = `
                //                 <table class="esri-widget" style="width:100%; border-collapse: collapse;">
                //                     <tr>
                //                         <th colspan="2" style="text-align:center; background-color:#f0f0f0; padding:10px;">
                //                             Upazila Demographics
                //                         </th>
                //                     </tr>
                //                     <tr>
                //                         <td style="padding:5px; border:1px solid #ddd;">Upazila Name</td>
                //                         <td style="padding:5px; border:1px solid #ddd;">${feature.graphic.attributes.ADM3_NAME}</td>
                //                     </tr>
                //                     <tr>
                //                         <td style="padding:5px; border:1px solid #ddd;">Upazila Code</td>
                //                         <td style="padding:5px; border:1px solid #ddd;">${feature.graphic.attributes.ADM3_PCODE || 'N/A'}</td>
                //                     </tr>
                //                     <tr>
                //                         <td style="padding:5px; border:1px solid #ddd;">Total Population</td>
                //                         <td style="padding:5px; border:1px solid #ddd;">${feature.graphic.attributes.T_TL.toLocaleString()}</td>
                //                     </tr>
                //                     <tr>
                //                         <td style="padding:5px; border:1px solid #ddd;">Male Population</td>
                //                         <td style="padding:5px; border:1px solid #ddd;">${feature.graphic.attributes.M_TL ? feature.graphic.attributes.M_TL.toLocaleString() : 'N/A'}</td>
                //                     </tr>
                //                     <tr>
                //                         <td style="padding:5px; border:1px solid #ddd;">Female Population</td>
                //                         <td style="padding:5px; border:1px solid #ddd;">${feature.graphic.attributes.F_TL ? feature.graphic.attributes.F_TL.toLocaleString() : 'N/A'}</td>
                //                     </tr>
                                 
                //                 </table>
                //             `;
                //             return container;
                //         }
                //     }
                // ]
                content: `
                <table class="esri-widget" style="width:100%; border-collapse: collapse;">
                  <tr>
                          <th colspan="2" style="text-align:center; background-color:#f0f0f0; padding:10px;">
                            Upazila Demographics
                      </th>
                  </tr>
                  <tr>
                    <td style="padding:5px; border:1px solid #ddd;">Upazila Code</td>
                      <td style="padding:5px; border:1px solid #ddd;">{expression/upazilaCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px; border:1px solid #ddd;">Upazila Name</td>
                    <td style="padding:5px; border:1px solid #ddd;">{expression/upazilaName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px; border:1px solid #ddd;">Total Population</td>
                    <td style="padding:5px; border:1px solid #ddd;">{expression/totalPopulation}</td>
                  </tr>
                  <tr>
                  <td style="padding:5px; border:1px solid #ddd;">Male Population</td>
                    <td style="padding:5px; border:1px solid #ddd;">{expression/totalMalePopulation}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px; border:1px solid #ddd;">Female Population</td>
                    <td style="padding:5px; border:1px solid #ddd;">{expression/totalFemalePopulation}</td>
                  </tr>
                </table>`,
                expressionInfos: [
                  {
                    name: "upazilaCode",
                    expression: "$feature.ADM3_PCODE"
                  },
                  {
                    name: "upazilaName",
                    expression: "$feature.ADM3_EN"
                  },
                  {
                    name: "totalPopulation",
                    expression: "$feature.T_TL"
                  },
                  {
                    name: "totalMalePopulation",
                    expression: "$feature.M_TL"
                  },
                  {
                    name: "totalFemalePopulation",
                    expression: "$feature.F_TL"
                  }
                ]
            }
          });
          return layer;
      }

      async createBuildingLayer() {
          const layer = new GeoJSONLayer({
              url: "data/buildingpoint_clip.geojson",
              renderer: new UniqueValueRenderer({
                  field: "building",
                  uniqueValueInfos: [
                      {
                          value: "residential",
                          symbol: new SimpleFillSymbol({
                              color: [51, 136, 255, 0.6],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      },
                      {
                          value: "commercial",
                          symbol: new SimpleFillSymbol({
                              color: [255, 0, 0, 0.6],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      },
                      {
                          value: "industrial",
                          symbol: new SimpleFillSymbol({
                              color: [0, 255, 0, 0.6],
                              outline: { color: [0, 0, 0, 0.5], width: 1 }
                          })
                      }
                  ]
              })
          });
          return layer;
      }

      // async createElevationLayer() {
      //     const layer = new GeoJSONLayer({
      //         url: "elevation.geojson",
      //         renderer: new ClassBreaksRenderer({
      //             field: "elevation",
      //             classBreakInfos: [
      //                 {
      //                     minValue: 0,
      //                     maxValue: 10,
      //                     symbol: new SimpleFillSymbol({
      //                         color: [255, 0, 0, 0.7],
      //                         outline: { color: [0, 0, 0, 0.5], width: 1 }
      //                     })
      //                 },
      //                 {
      //                     minValue: 11,
      //                     maxValue: 25,
      //                     symbol: new SimpleFillSymbol({
      //                         color: [255, 255, 0, 0.7],
      //                         outline: { color: [0, 0, 0, 0.5], width: 1 }
      //                     })
      //                 },
      //                 {
      //                     minValue: 26,
      //                     maxValue: 50,
      //                     symbol: new SimpleFillSymbol({
      //                         color: [0, 255, 0, 0.7],
      //                         outline: { color: [0, 0, 0, 0.5], width: 1 }
      //                     })
      //                 },
      //                 {
      //                     minValue: 51,
      //                     maxValue: 100,
      //                     symbol: new SimpleFillSymbol({
      //                         color: [0, 255, 255, 0.7],
      //                         outline: { color: [0, 0, 0, 0.5], width: 1 }
      //                     })
      //                 },
      //                 {
      //                     minValue: 101,
      //                     maxValue: Infinity,
      //                     symbol: new SimpleFillSymbol({
      //                         color: [0, 0, 255, 0.7],
      //                         outline: { color: [0, 0, 0, 0.5], width: 1 }
      //                     })
      //                 }
      //             ]
      //         })
      //     });
      //     return layer;
      // }

      setupEventListeners() {
          // Layer toggle
          document.getElementById('population-toggle').addEventListener('change', (e) => {
              this.populationGroup.visible = e.target.checked;
          });

          document.getElementById('building-toggle').addEventListener('change', (e) => {
              this.buildingGroup.visible = e.target.checked;
          });

          // document.getElementById('elevationToggle').addEventListener('change', (e) => {
          //     this.elevationGroup.visible = e.target.checked;
          // });

          // Search button
          document.getElementById('search-btn').addEventListener('click', () => {
              this.zoomToUpazila();
          });
      }

      populateUpazilaSelect(layer) {
          const select = document.getElementById('upazila-select');
          layer.queryFeatures().then(result => {
              const upaziladata = new Map();
              result.features.forEach(feature => {
                const { ADM3_EN, ADM3_PCODE } = feature.attributes;
                
                if (ADM3_PCODE && ADM3_EN) {
                  upaziladata.set(ADM3_PCODE, ADM3_EN); // Store as key-value pair
                }
              });
             
              for (const [ADM3_PCODE, ADM3_EN] of Object.entries(upaziladata)) {
                const option = document.createElement('option');
                option.value = ADM3_PCODE; 
                option.textContent = ADM3_EN; 
                select.appendChild(option);
              }
          });
      }

      setupWidgets() {
        // Search Widget
        const searchWidget = new Search({
            view: this.view,
            sources: [
                {
                    layer: this.populationLayer,
                    searchFields: ["ADM3_NAME"],
                    displayField: "ADM3_NAME",
                    exactMatch: false,
                    outFields: ["*"]
                }
            ],
            includeDefaultSources: false,
            locationEnabled: false
        });
        const searchExpand = new Expand({
            view: this.view,
            content: searchWidget,
            expandIconClass: "esri-icon-search"
        });
        this.view.ui.add(searchExpand, "top-right");

        // Legend Widget
        const legendWidget = new Legend({
            view: this.view,
            container: "legendDiv"
        });

        // Layer List Widget
        const layerList = new LayerList({
            view: this.view,
            container: "filterDiv",
            listItemCreatedFunction: (event) => {
                const item = event.item;
                item.panel = {
                    content: "legend",
                    open: true
                };
            }
        });
      }

      setupSpatialQueries(layer) {
          this.view.on("click", (event) => {
              this.view.hitTest(event).then(response => {
                  if (response.results.length) {
                      const graphic = response.results[0].graphic;
                      this.displayUpazilaInfo(graphic);
                  }
              });
          });
      }
      setupPopupHandler(layer) {
        // Configure popup behavior
        this.view.popup = {
            dockEnabled: true,
            dockOptions: {
                position: "bottom-right",
                breakpoint: false
            }
        };

        // Highlight selected feature
        this.view.on("click", (event) => {
            this.view.hitTest(event).then((response) => {
                if (response.results.length) {
                    const graphic = response.results[0].graphic;
                    
                    // Ensure the graphic is from the population layer
                    if (graphic.layer.title === "Population Layer") {
                        this.view.popup.open({
                            features: [graphic],
                            location: event.mapPoint
                        });
                    }
                }
            });
        });
    }
      displayUpazilaInfo(graphic) {
          const infoPanel = document.getElementById('infoPanel');
          const attrs = graphic.attributes;
          
          infoPanel.innerHTML = `
              <h3>${attrs.ADM3_EN || 'Upazila Details'}</h3>
              <p>Population: ${attrs.T_TL || 'N/A'}</p>
              <p>Building Count: ${attrs.buildingCount || 'N/A'}</p>
          `;
          infoPanel.style.display = 'block';
      }

      zoomToUpazila() {
          const select = document.getElementById('upazila-select');
          const selectedUpazila = select.value;

          if (!selectedUpazila) return;

          // Query and zoom to the selected upazila
          this.populationGroup.layers.items[0].queryFeatures({
              where: `ADM3_PCODE = '${selectedUpazila}'`,
              outFields: ["*"]
          }).then(result => {
              if (result.features.length > 0) {
                  const feature = result.features[0];
                  this.view.goTo({
                      target: feature.geometry,
                      zoom: 10
                  });
                  this.displayUpazilaInfo(feature);
              }
          });
      }
  }

  new LoadApp();
});