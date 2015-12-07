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
    "jquery",
    "dojo/text!./config.json",
    "dojo/text!./validators.json",
    "esri/SpatialReference",
     "esri/layers/GraphicsLayer",
     "esri/symbols/PictureMarkerSymbol",
     "esri/tasks/Geometry",
     "esri/geometry/Point",
     "esri/tasks/FeatureSet",
     "esri/layers/FeatureLayer",
     "esri/renderers/UniqueValueRenderer",
      "esri/dijit/Legend",
      "esri/geometry/Extent",
       "dijit/TooltipDialog"
     

], function ($, config,validators,SpatialReference, GraphicsLayer, PictureMarkerSymbol, Geometry, Point, FeatureSet,
    FeatureLayer, UniqueValueRenderer, Legend,Extent,TooltipDialog) {

    var configVals = dojo.eval(config)[0];
    var validate = dojo.eval(validators)[0];

    return {
               
        loadStations: function (map) {
            //Loads the unclassified stations

            //remove the existing stations layer
            var stationsLayer = map.getLayer("SabineApp_Stations");
            if (stationsLayer)
                map.removeLayer(stationsLayer);

            var stationSymbol = new PictureMarkerSymbol({ "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriPMS", "url": "plugins/sabine_app/images/WhiteFlag.png", "contentType": "image/png", "width": 32, "height": 32 });

            var jsonFS = {
                "displayFieldName": "Station",
                "fieldAliases": {
                    "Station": "Station",
                    "Name":"Name"
                },
                "geometryType": "esriGeometryPoint",
                "spatialReference": {
                    "wkid":3857
                },
                "fields": [
                     {
                         "name": "ObjectID",
                         "alias": "ObjectID",
                         "type": "esriFieldTypeOID"
                     },
                    {
                        "name": "Station",
                        "type": "esriFieldTypeString",
                        "alias": "Station",
                        "length":255
                    },
                     {
                         "name": "Name",
                         "type": "esriFieldTypeString",
                         "alias": "Name",
                         "length": 255
                     }
                ],
                "features":configVals.stations
            }

            var fsStations = new FeatureSet(jsonFS);

            var featureCollection = {
                layerDefinition: {
                    "geometryType": "esriGeometryPoint",
                    "objectIdField": "ObjectID",
                    "drawingInfo": {
                        "renderer": {
                            "type": "uniqueValue",
                            "field1":"DisplayName",                           
                            "uniqueValueInfos": [{
                                "value": "Stations",
                                "symbol":stationSymbol
                            }]
                        }
                    },
                    "fields": [
                        {
                            "name": "ObjectID",
                            "alias": "ObjectID",
                            "type": "esriFieldTypeOID"
                        },
                        {
                            "name": "Station",
                            "type": "esriFieldTypeString",
                            "alias":"Station"
                        },
                        {
                            "name": "Name",
                            "type": "esriFieldTypeString",
                            "alias":"Name"
                        }
                    ]
                },
                featureSet:fsStations
            };

            var featureLayer = new FeatureLayer(featureCollection, { mode: FeatureLayer.MODE_SNAPSHOT, id: "SabineApp_Stations", outfields:["Station"] });
            map.addLayer(featureLayer);

            map.centerAndZoom([configVals.mapCenter.x, configVals.mapCenter.y], configVals.mapCenter.zoom);
            $("#radLake").prop("checked", false);
            $("#radFull").prop("checked", true);


            //initialize the mouse over tooltip
            var stationTooltip = new TooltipDialog({
                style: "position: absolute;font: normal normal normal 8pt Helvetica; z-index:100",
                position: "right"
            });

            //add the tool tip
            featureLayer.on("mouse-over", function (evt) {
                map.graphics.clear();

                var t = "<div align ='center'>${Station}</div>";
                var content = esri.substitute(evt.graphic.attributes, t);
               
                stationTooltip.startup();
                stationTooltip.setContent(content);
                dijit.popup.open({ popup: stationTooltip, x: evt.pageX, y: evt.pageY });
            });

            featureLayer.on("mouse-out", function (evt) {
                map.graphics.clear();
                dijit.popup.close(stationTooltip);
            });

            return featureLayer;

         
        },

        loadDefaultLegend: function (map) {
            if (dijit.byId("divSabineLegend"))
                dijit.byId("divSabineLegend").destroy();

            $(legendContainer).html(null);
            $(legendContainer).css("display", "");

            var legendReference = $('<div>');
            $(legendReference).attr("id", "divSabineLegendReference")
            $(legendContainer).append(legendReference);

            //make a div for the legend
            var placeholder = $('<div>');
            $(placeholder).attr("id", "divSabineLegend");
            $(legendReference).append(placeholder);

            var layerInfos = [
                { layer: map.getLayer("SabineApp_Reservoir"), title: "Reservoir" },
                { layer: map.getLayer("SabineApp_River"), title: "River" },
                { layer: map.getLayer("SabineApp_Lake"), title: "Lake" },
                { layer: map.getLayer("SabineApp_Stations"), title: "Stations" }
            ];

            var appLegend = new Legend({
                map: map,
                layerInfos: layerInfos
            }, divSabineLegend);

            appLegend.startup();
        },

       

        setValidators: function () {
            var selectedMonth = $("#selMonth").find(":selected").text()
            lstValidate = validate[selectedMonth];

            $("#waterLevel").slider({
                min: lstValidate.waterLevel.min,
                max: lstValidate.waterLevel.max,
                value: lstValidate.waterLevel.med,
                step: .001,
                slide: function (event, ui) {
                    $("#spanWaterLevel").text(ui.value);
                }
            })

            $("#spanWaterLevel").text(lstValidate.waterLevel.med);
            $("#spanWaterLevelMin").text(lstValidate.waterLevel.min);
            $("#spanWaterLevelMax").text(lstValidate.waterLevel.max);

            $("#damFlow").slider({
                min: lstValidate.damFlow.min,
                max: lstValidate.damFlow.max,
                value: lstValidate.damFlow.med,
                step:1,
                slide: function (event, ui) {
                    $("#spanDamFlow").text(ui.value);
                }
            })

            $("#spanDamFlow").text(lstValidate.damFlow.med);
            $("#spanDamFlowMin").text(lstValidate.damFlow.min);
            $("#spanDamFlowMax").text(lstValidate.damFlow.max);

            $("#riverFlow").slider({
                min: lstValidate.riverFlow.min,
                max: lstValidate.riverFlow.max,
                value: lstValidate.riverFlow.med,
                slide: function (event, ui) {
                    $("#spanRiverFlow").text(ui.value);
                }
            })

            $("#spanRiverFlow").text(lstValidate.riverFlow.med);
            $("#spanRiverFlowMin").text(lstValidate.riverFlow.min);
            $("#spanRiverFlowMax").text(lstValidate.riverFlow.max);

        }

       
    }
}
);
