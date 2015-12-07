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
    "dojo/text!./Templates.html",
     "./SabineMap",
      "./CalculateSalinity",
       "esri/geometry/Extent"

], function ($, config,validators,templates,SabineMap,Salinity,Extent) {
    var configVals = dojo.eval(config)[0];

    return {

        setDialog: function (container,map,app) {
            //loads the content and wires up the events

            $(container).html($.trim($(templates).find("#template-SabineApp").html()));
            
            $("#dialog-message").dialog({
                modal: true,
                autoOpen: false,
                width: 600,
                buttons: {
                    CLOSE: function () {
                        $(this).dialog("close");
                    }
                }
            }
          )
            $("#imgDamFlow","#imgRiverFlow","#imgWaterFlow").tooltip();

            $("#aThresholds").attr("onclick", "$('#dialog-message').dialog('open');");
           
            $("#radFull").change(function () { map.centerAndZoom([configVals.mapCenter.x, configVals.mapCenter.y], configVals.mapCenter.zoom); });
            $("#radLake").change(function () { map.setExtent(new Extent(configVals.sabineExtent)) });
            $("#selMonth").change(SabineMap.setValidators)
            $("#btnCalculate").click(function () {
                Salinity.calculateSalinity(map,app);
            });
            SabineMap.setValidators();

            $("#btnStartOver").click(function () {
                $("#divLanding").css("display", "");
                $("#divResults").css("display", "none");
                SabineMap.loadStations(map);
                SabineMap.loadDefaultLegend(map);
            });

        },

        setValuesFromState: function (sabineState) {

            $("#selMonth option[value='" + sabineState.month + "']").prop('selected', true);
            SabineMap.setValidators();
            $("#spanDamFlow").text(sabineState.damFlow);
            $("#damFlow").slider({ value: sabineState.damFlow });
            $("#spanWaterLevel").text(sabineState.waterLevel);
            $("#waterLevel").slider({ value: sabineState.waterLevel });
            $("#spanRiverFlow").text(sabineState.riverFlow);
            $("#riverFlow").slider({ value: sabineState.riverFlow });

          
        },

        getState: function (map) {
            var sabineState = new Object;
            //get the input values
            sabineState.month = $("#selMonth").val();
            sabineState.damFlow = $("#spanDamFlow").text();
            sabineState.waterLevel = $("#spanWaterLevel").text();
            sabineState.riverFlow = $("#spanRiverFlow").text();

            //see if we are looking at results
            if ($("#divResults").css("display") == "none")
                sabineState.results = false;
            else
                sabineState.results = true;

            sabineState.mapExtent = map.extent;
            return sabineState;
        }
    }




})