
define([
    "dojo/_base/declare",
    "plugins/layer_selector/main",
    "dojo/text!./layers.json"],
    function (declare,
              LayerSelectorPlugin,
              layerSourcesJson) {
        return declare(LayerSelectorPlugin, {
            toolbarName: "Hydrologic Alterations",
            fullName: "Explore relative concentrations within Louisiana's watersheds, Parishes and Congressional Districts.",

            getLayersJson: function() {
                return layerSourcesJson;
            }
        });
    }
);
