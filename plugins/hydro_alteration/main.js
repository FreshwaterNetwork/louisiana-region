define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Hydrologic Alterations",
            fullName: "Explore hydrologic alteration features and assessments in your watersheds.",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);