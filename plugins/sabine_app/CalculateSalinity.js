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
     "./ClassifyStations"

], function ($, config,validators, ClassifyStations) {

    var configVals = dojo.eval(config)[0];
    var validate = dojo.eval(validators)[0];

    return {
        calculateSalinity: function (map,app) {
            //get the inputs from the dialog
            var selectedMonth = $("#selMonth").find(":selected").text();

            var inputMonth = validate[selectedMonth].input;
            var waterLevel = $("#spanWaterLevel").text();
            var damFlow = $("#spanDamFlow").text();
            var riverFlow = $("#spanRiverFlow").text();

            //bundle these info an object we can pass to the next function
            var inputs = new Object();
            inputs.selectedMonth = selectedMonth;
            inputs.waterLevel = waterLevel;
            inputs.damFlow = damFlow;
            inputs.riverFlow = riverFlow;

            var promise = $.ajax({
                type: "GET",
                url: configVals.WaterFALLService + "Salinity/.jsonp?water_level=" + waterLevel + "&month="+inputMonth+"&wf_dam=" + damFlow + "&tidal_mean=" + riverFlow ,
                dataType: 'jsonp'

            });

            promise.done(function (response) {
                ClassifyStations.classifyStations(container,map, inputs,response);
            });

            //failure
            promise.fail(function (xhr, status, error) {
                //alert("XHR: " + xhr.responseText + " Status: " + status + " Error: " + error);
                app.error("There was an issue calling the salinity service.", "XHR: " + xhr.responseText + " Status: " + status + " Error: " + error);

            });


        }
    }
})