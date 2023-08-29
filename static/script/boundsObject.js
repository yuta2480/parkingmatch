let BoundsObject = function() {
    this.param = {_min : {lat : undefined, lon : undefined},
    _max : {lat : undefined, lon : undefined}};
};

BoundsObject.prototype = {

    update : function(_lat, _lon) {
        if (this.param._min.lat === undefined || this.param._min.lat > _lat) this.param._min.lat = _lat;
        if (this.param._min.lon === undefined || this.param._min.lon > _lon) this.param._min.lon = _lon;

        if (this.param._max.lat === undefined || this.param._max.lat < _lat) this.param._max.lat = _lat;
        if (this.param._max.lon === undefined || this.param._max.lon < _lon) this.param._max.lon = _lon;
    },

    blankCheck: function() {
        return (this.param._min.lat === undefined || 
            this.param._min.lon === undefined ||
            this.param._max.lat === undefined ||
            this.param._max.lon === undefined ) ? true : false; 
    },

    fitting : function(targetMap) {
        if (this.blankCheck()) return;

        const boundsObject = L.latLngBounds([this.param._min.lat, this.param._min.lon], [this.param._max.lat, this.param._max.lon]);
        targetMap.fitBounds(boundsObject);
    }
};