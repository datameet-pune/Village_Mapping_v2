function DistrictMap_Leaflet() {};

DistrictMap_Leaflet.prototype = {
    setup: function(args) {
        // setup variables
        if (this.map) {
            this.map = null;
        }
        this.div_id = args.divId;
        this.district_name = args.district_name || 'Pune';
        this.field_name = args.field_name || 'Total.Population.of.Village'
        this.opacityVal = 0.7;
        if (!this.map) {
            this.setup_map();
        }
        this.loading(true);
        this.create_map();
        this.searchControl;
    },


    setup_map: function() {
        var self = this;
        var map_id = {
            "light": "bnamita.lbkenk58",
            "dark": "bnamita.l282bpl6",
            "street_classic": "bnamita.lbkf97cf"
        };
        var map_color = map_id["light"];

        /* --   FROM NIKHIL -- */
        /* set up the map*/
        var osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        var mapboxUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';
        var MBAttrib = '&copy; ' + osmLink + ' Contributors & <a href="https://www.mapbox.com/about/maps/">Mapbox</a>';
        MBAttrib += '<br>Link to census data: ' + '<a href="http://www.censusindia.gov.in/2011census/dchb/DCHB.html">Click here</a>';

        var MBstreets = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mlpl2d', attribution: MBAttrib}),
            MBsatlabel = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mmaa87', attribution: MBAttrib}),
            MBsat = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mni8e7', attribution: MBAttrib}),
            MBemerald = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mmebk6', attribution: MBAttrib}),
            MBrun = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mmicn2', attribution: MBAttrib}),
            MBlight = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mmobne', attribution: MBAttrib}),
            MBbw = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mn13df', attribution: MBAttrib}),
            MBdark = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.jme9hi44', attribution: MBAttrib}),
            MBpencil = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mn5lf5', attribution: MBAttrib}),
            MBpirates = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mn8b72', attribution: MBAttrib}),
            MBwheatpaste = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mnld61', attribution: MBAttrib}),
            MBcomic = L.tileLayer(mapboxUrl, {id: 'nikhilsheth.m0mo16hg', attribution: MBAttrib}),

            OsmIndia = L.tileLayer(mapboxUrl, {id: 'openstreetmap.1b68f018', attribution: MBAttrib});

        var baseLayers = {
            "OpenStreetMap.IN": OsmIndia,
            "Mapbox Streets": MBstreets,
            "Mapbox Satellite w/labels": MBsatlabel ,
            "Mapbox Light": MBlight ,
            "Mapbox Dark": MBdark
        };

        var overlays = {
            //"Electoral Wards": wards
        };


        /* -- END FROM NIKHIL -- */

        //var tileLayer = L.tileLayer(mapboxUrl, {id: map_color, attribution: MBAttrib});

        this.map = L.map('map_container', {
            center: [18.62, 74.2],
            zoom: 9,
            layers: [MBlight]
        })

        //    .on('overlayremove', function(e) {  // to reset the side panel
        //    document.getElementById('sidepanel-content').innerHTML = '';
        //});
        var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true}).addTo(this.map); //changed to selectLayers() so that layers panel doesn't get too big.

        var MH_district_boundaries = L.geoJson(null, {
            //onEachFeature: function (feature, layer) { defaultOnEachFeature(feature, layer, title, fields); },
            style: {weight: 2, opacity: 1, color: '#636363', dashArray: '4', fillOpacity: 0 },
            onEachFeature: function(feature, layer) {
                //layer.on({
                //    //click: onMapClick,
                //    click: function (e) {
                //        var loc = '<br>Located in Prabhag : ' + feature.properties.wardnum;
                //        url = getTileURL(e.latlng.lat, e.latlng.lng, map.getZoom()); //integrated the tile solution from http://jsfiddle.net/84P9r/ with this popup.
                //        popup
                //            .setLatLng(e.latlng)
                //            .setContent(e.latlng.toString() + loc)
                //            .openOn(map);
                //    },
                //    mouseover: function (e) {
                //        $('#wardNum').html('Mouse currently over Prabhag <b>' + feature.properties.wardnum + '</b>');
                //    },
                //    mouseout: function (e) {
                //        $('#wardNum').html('');
                //    }
                //}); // end of layer.on
            } // end of onEachFeature
        }).addTo(self.map);

        omnivore.geojson('geometry/overlays/MH_district_boundaries.geojson', null, MH_district_boundaries);
        layerControl.addOverlay(MH_district_boundaries , "District Boundaries");

        this.choroLayer = new L.geoJson(null);
        this.info = L.control();
        this.legend = L.control({position: 'bottomright'});

        this.legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                labels = [];

            var grades = [0, 0.2, 0.4, 0.6, 0.8];
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + self.getLegendColor(grades[i]) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            div.innerHTML += '<i style="background:#000"></i> NA <br>';

            return div;
        };

        this.legend.addTo(this.map);

    },

    updateLegend: function(max) {
        var grades = [0, 0.2, 0.4, 0.6, 0.8];
        var div = $('.legend')[0];
        div.innerHTML = '';
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + this.getLegendColor(grades[i]) + '"></i> ' +
                Math.floor(grades[i]*max) + ((grades[i + 1]*max) ? '&ndash;' + Math.floor(grades[i + 1]*max) + '<br>' : '&ndash;' + Math.floor(max));
        }
        div.innerHTML += '<br> <i style="background:#000"></i> NA <br>';
    },

    getColor: function (data, min, max) {
        //min = Math.min.apply(Math,data[this.setFieldName].map(function(o){return parseFloat(o[column]);}));
        //max = Math.max.apply(Math,results3.map(function(o){return parseFloat(o[column]);}));
        var d, perc;
        if (data === undefined) {
            d = -1;
        } else {
            d = data[this.field_name]
        }

        if (d === -1) {
            perc = 0;
        } else if (d === 0) {
            perc = 0.2;
        } else {
            perc = 0.2 + 0.7*(d-min)/(max-min);
        }

        return perc > 0.8  ? '#bd0026' :
            perc > 0.6  ? '#f03b20' :
                perc > 0.4  ? '#fd8d3c' :
                    perc > 0.2  ? '#fecc5c' :
                        perc > 0    ? '#ffffb2' :
                            perc === -1 ? '#000' :
                                '#000'
    },

    getLegendColor: function(perc) {
        return perc >= 0.8  ? '#bd0026' :
            perc >= 0.6  ? '#f03b20' :
                perc >= 0.4  ? '#fd8d3c' :
                    perc >= 0.2  ? '#fecc5c' :
                        perc >= 0    ? '#ffffb2' :
                            //perc === -1 ? '#000' :
                                '#000'
    },

    create_map: function() {
        var self = this;

        if (self.info._map !== undefined) {
            self.info.remove();
        }
        self.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        self.info.update = function (shapeLayerData, csvLayerData) {
            var csvVillageName;

            var dataVal = (csvLayerData && csvLayerData[self.field_name]) ? csvLayerData[self.field_name] : 'NA'
            this._div.innerHTML = '<h4>' + self.field_name + '  </h4>' +  (shapeLayerData ?
                '<b>' + shapeLayerData.VILLNAME + ' (' + shapeLayerData[fieldToMatch['geometry']] + '), ' + shapeLayerData['IPNAME']  +  ': </b><br />' + dataVal : '') ;
            if (csvLayerData && (shapeLayerData.VILLNAME !== csvLayerData['Village.Name'])) {
                this._div.innerHTML += '<br>' + ' Village name in csv: ' + csvLayerData['Village.Name'];

            }

        };

        self.info.addTo(self.map);

        if (!this.opacitySlider) {
            //Create the opacity controls
            this.opacitySlider = new L.Control.opacitySlider({position: 'topright'});
            this.map.addControl(this.opacitySlider);
            $('.opacity_slider_control').on('slide', function(e, ui) {
                self.setOpacity(ui.value/100);
            });
        }


        function getDensityColor(data) {
            var d;
            if (data === undefined) {
                d = 0;
            } else {
                d = data[self.field_name]
            }

            return d > 1400 ? '#f03b20' :

                d > 1000  ? '#feb24c' :
                    d > 0  ? '#ffeda0' :
                        d === 0 ? '#000' :
                            '#000'

        }




        this.parseCSVFile().done(function(result) {
            var min = Math.min.apply(Math,result.map(function(o) { return parseFloat(o[self.field_name])})),
                max = Math.max.apply(Math,result.map(function(o) { return parseFloat(o[self.field_name])}));
            self.updateLegend(max);

             function getResult() {
                 return result;
             }

            function getFieldName() {
                return self.field_name;
            }
                function highlightFeature(e, csvLayerData) {
                    var layer = e.target;

                    layer.setStyle({
                        weight: 1,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: self.opacityVal
                    });

                    if (!L.Browser.ie && !L.Browser.opera) {
                        layer.bringToFront();
                    }
                    self.info.update(layer.feature.properties, csvLayerData);
                }

                function resetHighlight(e, csvLayerData) {
                    self.choroLayer.resetStyle(e.target);
                    self.info.update(e.target.feature.properties, csvLayerData);
                }

                function zoomToFeature(e, csvLayerData) {
                    self.map.fitBounds(e.target.getBounds());
                    self.info.update(e.target.feature.properties, csvLayerData);
                }

                self.choroLayer.clearLayers();
                self.choroLayer = L.geoJson(null, {
                    style: function (feature) {
                        self.featureData = getResult(),
                         fieldName = getFieldName(),
                            min = Math.min.apply(Math,self.featureData.map(function(o) { return parseFloat(o[fieldName])})),
                            max = Math.max.apply(Math,self.featureData.map(function(o) { return parseFloat(o[fieldName])}));

                        var csvLayerData = _.find(self.featureData, function(d) {
                            return d[fieldToMatch['csv']] == feature.properties[fieldToMatch['geometry']];
                        })
                        //if (csvLayerData === undefined) {
                        //    console.log(feature)
                        //}
                        return {
                            weight: 2,
                            opacity: self.opacityVal,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: self.opacityVal,
                            fillColor: self.getColor(csvLayerData, min, max )
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        //layer.bindPopup('<h4>'+ feature.properties.VILLNAME +'</h4>');
                        //layer.on('mouseover', function (e) {
                        //    this.openPopup();
                        //});
                        //layer.on('mouseout', function (e) {
                        //    this.closePopup();
                        //});
                        var featureData = getResult();
                        var csvLayerData = _.find(featureData, function(d) {
                            return d[fieldToMatch['csv']] == feature.properties[fieldToMatch['geometry']];
                        })
                        layer.on({
                            mouseover: function(e) {
                                highlightFeature(e, csvLayerData);
                            },

                            mouseout: function(e) {
                                resetHighlight(e, csvLayerData);
                            },
                            click: function(e) {
                                zoomToFeature(e, csvLayerData)
                            }

                        });

                    }

                });


                $.ajax({
                    url: 'geometry/' + geojson_file_map[self.district_name] + '.geojson',
                    success: function (geojsonObj) {
                        self.choroLayer.addTo(self.map);
                        if (typeof geojsonObj === "string") {
                            geojsonObj = JSON.parse(geojsonObj);
                        }
                        self.choroLayer.addData(geojsonObj);
                        self.bestFitZoom();

                        if (self.searchControl === undefined) {
                            self.searchControl = new L.Control.Search({
                                //container: 'findbox',
                                textPlaceholder: 'Search Village...',
                                collapsed: false,
                                //position: 'topright',
                                layer: self.choroLayer,
                                propertyName: 'VILLNAME',
                                circleLocation: true,
                                moveToLocation: function(latlng, title, map) {
                                    //map.fitBounds( latlng.layer.getBounds() );
                                    var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                                    map.setView(latlng, zoom - 3); // access the zoom
                                }
                            });
                            self.searchControl.on('search:locationfound', function(e) {

                                e.layer.setStyle({fillColor: 'blue', color: 'red'});
                                if(e.layer._popup)
                                    e.layer.openPopup();
                            }).on('search:collapsed', function(e) {
                                self.choroLayer.eachLayer(function(layer) {	//restore feature color
                                    self.choroLayer.resetStyle(layer);
                                });
                            });

                            self.map.addControl( self.searchControl );
                        } else {
                            self.searchControl._input.value = '';
                            self.searchControl._layer = self.choroLayer;
                            //$(self.searchControl._button).trigger('click')
                        }


                        self.loading(false);
                    },
                    error: function(e) {
                        console.log("File not available.")
                        alert("Data not available for " +self.district_name + ". Please select another district.");

                        self.loading(false);

                    }
                });

                 //inizialize search control

            //        self.map.on('layeradd', function(e) {
            //
            //    //console.log(e);
            //    //self.map.panTo(e.target.getPanes());
            //    //self.map.fitBounds(e.target.getBounds());
            //});

                });

    },

    parseCSVFile: function() {
        var self = this;
        var $deferred = new $.Deferred();
        var filepath = 'data/csvdata/census_split_by_district/' + geojson_file_map[self.district_name] +  '.csv';
        Papa.parse(filepath, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function(response) {
                var results = response.data.filter( function(data){return parseFloat(data[self.field_name]) || data[self.field_name] === 0;} );
                $deferred.resolve(results);
            },
            error: function() {
                console.log("Error");
                alert("Data not available for " +self.district_name + ". Please select another district.");
                self.loading(false);
            }

        });
        return $deferred.promise();
    },

    updateStyle: function() {
        var self = this;
        var $deferred = new $.Deferred();
        this.choroLayer.eachLayer(function(layer) {

            var min = Math.min.apply(Math,self.featureData.map(function(o) { return parseFloat(o[self.field_name])})),
                max = Math.max.apply(Math,self.featureData.map(function(o) { return parseFloat(o[self.field_name])}));
            self.updateLegend(max);

            var csvLayerData = _.find(self.featureData, function(d) {
                return d[fieldToMatch['csv']] == layer.feature.properties[fieldToMatch['geometry']];
            })

            layer.setStyle({
                weight: 2,
                opacity: self.opacityVal,
                color: 'white',
                dashArray: '3',
                fillOpacity: self.opacityVal,
                fillColor: self.getColor(csvLayerData, min, max )
            });
        });
        $deferred.resolve();
        return $deferred.promise();

    },


    parseCSV: function(data, dataAttr) {
        // Split the lines
        var lines = data.split('\n');

        var joinByIndex = null, // Village.Code
            dataAttrIndex =null, // Geographical Area
            joinNameIndex = null;
        data = []
        // Iterate over the lines and add categories or series
        $.each(lines, function(lineNo, line) {
            var items = line.split(',');

            // header line containes categories
            if (lineNo == 0) {
                $.each(items, function (itemNo, item) {
                    //if (itemNo > 0) options.xAxis.categories.push(item);
                    if (item === dataAttr) {
                        dataAttrIndex = itemNo;
                    }
                    if (item === fieldToMatch['csv']) {
                        joinByIndex = itemNo;
                    }
                    if (item === 'Village.Name') {
                        joinNameIndex = itemNo;
                    }

                });
            }

            // the rest of the lines contain data with their name in the first
            // position
            else {
                data.push({
                    "code" : items[joinByIndex],
                    "name" : items[joinNameIndex],
                    "value" : Number(items[dataAttrIndex])


                })
            }
        });
        return data;
    },

    setDistrictName: function(name) {
        //$(".overlay").show();
        //$("#loading-img").html('../images/5.gif');
        this.loading(true);
        var self = this;
        this.district_name = name;
        //this.create_map();
        this.choroLayer.clearLayers();
        //$.ajax({
        //    url: 'geometry/' + geojson_file_map[self.district_name] + '.geojson',
        //    success: function (geojsonObj) {
        //        self.choroLayer.addTo(self.map);
        //        self.choroLayer.addData(JSON.parse(geojsonObj))
        //        self.bestFitZoom();
        //        self.loading(false);
        //    }
        //});
        this.create_map();
    },

    setFieldName: function(name) {
        var self = this;
        $(".info")[0].textContent = "Loading...";
        this.loading(true);
        this.field_name = name;
        this.updateStyle().done(function(){
            self.loading(false);
            self.info.update();
        });



        //this.create_map();
    },

    //setMapAttribute: function () {
    //    var self = this;
    //    //$.get('data/' + csv_file_map[self.field_name] + '.csv', function(csv) {
    //        //var parsedData = self.parseCSV(csv, self.field_name);
    //        //self.mapHandle.series[0].setData(parsedData)
    //        //self.mapHandle.series[0].name = self.field_name;
    //    //});
    //
    //    self.setFieldName('Outside the State/UT distance');
    //
    //},

    bestFitZoom: function ()
    {
        var self = this;
        // declaring the group variable
        var group = new L.featureGroup(null);

        // map._layers gives all the layers of the map including main container
        // so looping in all those layers filtering those having feature
        $.each(self.choroLayer._layers, function(ml){
            //self.opacitySlider.setOpacityLayer(this);
            // here we can be more specific to feature for point, line etc.
            if(this._latlngs)
            {
                group.addLayer(this)
            }
        })

        self.map.fitBounds(group.getBounds());

        //var zoom = self.map.getBoundsZoom(latlng.layer.getBounds());
        //self.map.setView(latlng, zoom); // access the zoom
    },

    loading: function(visible) {
        if (visible) {
            $(".overlay").show();
            //$("#loading-img").html('<img src="./images/5.gif"/>');
        } else {
            $(".overlay").hide();
            //$("#loading-img").html('');
        }

    },

    setOpacity: function(val) {
        this.choroLayer.eachLayer(function(layer) {
            layer.setStyle({
                fillOpacity: val,
                opacity: val
            })
        });
        this.opacityVal = val;
    }




}

