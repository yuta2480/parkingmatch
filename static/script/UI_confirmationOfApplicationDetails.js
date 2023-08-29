let UI_confirmationOfApplicationDetails = function(_lat, _lon, parkId, start, end) {
    this.zoomLevel = 19;
    this.latlon = {lat : _lat, lon : _lon};
    this.param = {
        park_id : parkId, use_start : start, use_end : end };

    // Markerセットアップ
    this.createDefaultMarker();
    this.setLeafletParams();

    // イベントの配置
    this.eventSetup();
    
};

UI_confirmationOfApplicationDetails.prototype = {

    eventSetup: function() {
        let _dom = document.getElementById('button_apply');
        _dom.addEventListener('click', {value: 'apply', handleEvent : this.apply.bind(this) });
    },

    /* ----- create a markers popup. ----- */
    createLatLonObject: function() {
        const lat = this.latlon.lat,
            lon = this.latlon.lon;

        return [lat, lon];
    },

    createDefaultMarker: function() {
        map.marker = L.marker([this.latlon.lat, this.latlon.lon], {draggable:false});
        map.marker.addTo(map.map);
    },
    setLeafletParams: function() {
        console.log('createLatLonObject()>>', this.createLatLonObject());
        map.forcePanAndZoom(this.createLatLonObject(), this.zoomLevel);
        map.freeze();
    },



    setPostData: function(items) {
        const generator = (name, value) => {
            let dom = document.createElement('input');
            dom.type = 'hidden';
            dom.name = name;
            dom.value = value;
            return dom;
        };

        let F = document.createElement('form');
        F.setAttribute('method', 'POST');
        F.setAttribute('action', '/confirmationOfApplicationDetails');
        F.setAttribute('style', 'display : block');

        for (let prop in items) {
            F.appendChild(generator(prop, items[prop]));
        }

        document.body.appendChild(F);
        F.submit();
    },

    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    apply: function() {
        //this.parent.setPostData(this.parent.param);
        this.setPostData(this.param);
    }, 


};


