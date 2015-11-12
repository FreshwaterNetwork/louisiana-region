require({
    packages: [
	{
	    name: "jquery",
	    location: "//ajax.googleapis.com/ajax/libs/jquery/1.9.0",
	    main: "jquery.min"
	}
    ]
});

define([
    "dojo/_base/declare",
    "framework/PluginBase",
   "jquery",
   "./jquery-ui.min",
    "dojo/text!./Templates.html",
    "dojo/text!./config.json",   
    "./SabineMap",
    "./SabineDialog",
     "./CalculateSalinity",
    "esri/geometry/Extent",
    "esri/SpatialReference",
     "esri/layers/FeatureLayer",
     "esri/layers/GraphicsLayer",
     "esri/symbols/PictureMarkerSymbol",
     "esri/tasks/Geometry",
     "esri/geometry/Point",
      "esri/dijit/Legend"
],
    function (declare, PluginBase, $, ui, templates, config,SabineMap,SabineDialog,Salinity,Extent, SpatialReference, FeatureLayer, GraphicsLayer, PictureMarkerSymbol,
        Geometry,Point,Legend) {

        var configVals = dojo.eval(config)[0];        
        
        return declare(PluginBase, {
            toolbarName: configVals.toolbarName,
            //fullName: "",
            toolbarType: "sidebar",
            allowIdentifyWhenActive: false,
            infoGraphic: configVals.infoGraphic,
            width: configVals.dialogWidth,
            height: configVals.dialogHeight,
            showServiceLayersInLegend: true,

            initialize: function (args) {
                container = args.container;
                legendContainer = args.legendContainer;
                map = args.map;
                app = args.app;
                state = null;
            },

            activate: function () {
                SabineDialog.setDialog(container, map,app);
               
                this.setInitialMap();               
            },

            deactivate: function () {
                this.removeLayers();
            },

            hibernate: function () {
                this.removeLayers();
            },

            getState: function () {
               return SabineDialog.getState(map);           
            },

            setState: function (inputState) {
                state = inputState;
            },

            setInitialMap: function () {
                //add the sabine layers
                var reservoirLayer = new FeatureLayer(configVals.layers.Reservoir, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "SabineApp_Reservoir"
                });
                map.addLayer(reservoirLayer);

                var riverLayer = new FeatureLayer(configVals.layers.River, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "SabineApp_River"
                });
                map.addLayer(riverLayer);

                var lakeLayer = new FeatureLayer(configVals.layers.Lake, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "SabineApp_Lake"
                });
                map.addLayer(lakeLayer);


                if (!state) {
                    var stationsLayer = SabineMap.loadStations(map);

                    map.centerAndZoom([configVals.mapCenter.x, configVals.mapCenter.y], configVals.mapCenter.zoom);

                    //add these layers to the legend
                    SabineMap.loadDefaultLegend(map);
                }
                else {
                    SabineDialog.setValuesFromState(state);
                    if (!state.results) {
                        var stationsLayer = SabineMap.loadStations(map);
                        map.setExtent(new Extent(state.mapExtent.xmin, state.mapExtent.ymin, state.mapExtent.xmax, state.mapExtent.ymax, new SpatialReference(state.mapExtent.spatialReference.wkid)));
                        SabineMap.loadDefaultLegend(map);
                    }
                    else { //calculate the results
                        Salinity.calculateSalinity(map);
                        map.setExtent(new Extent(state.mapExtent.xmin,state.mapExtent.ymin,state.mapExtent.xmax,state.mapExtent.ymax, new SpatialReference(state.mapExtent.spatialReference.wkid)));
                    }

                }
                
            },

            

           

            removeLayers: function () {
                var layerList = map.graphicsLayerIds;
                for (var i = layerList.length - 1; i >= 0; i--) {

                    if (layerList[i].indexOf("SabineApp") >= 0) //all layers for the tool have SabineApp in the ID
                        map.removeLayer(map.getLayer(layerList[i]));

                }

                //clean up the legend
                if (dijit.byId("divSabineLegend"))
                    dijit.byId("divSabineLegend").destroy();

                $(legendContainer).html(null);

                
            }

            
        });
    }
);