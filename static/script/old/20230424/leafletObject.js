let LeafletObject = function() {
    this.stat = false;
    this.map = undefined;

    this.marker = undefined;


};

LeafletObject.prototype = {


    leafletActivate: function(_latlng, _zoomLevel) {
        this.map = L.map('leafletObj', {doubleClickZoom: false});
        this.map.setView(_latlng, _zoomLevel);   // 地図の中心とズームレベルを指定
        this.map.on('dblclick', this.onDoubleClick);

        //表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
        /*L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
            attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
        }).addTo(this.map);*/



        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        });
        tileLayer.addTo(this.map);

        this.eventSetup();
    },

    eventSetup: function() {
        this.map.on('click', this.onClick);


    },


    /* ----- Leafletのアイテム管理（ピンの追加や移動など） ----- ----- ----- --- ----- ----- ----- */
    addMarker: function(_obj) {
        console.log('addMarker ', _obj);
        console.log('this', this);

        if (this.marker === undefined) {
            this.marker = L.marker([_obj.lat, _obj.lng], {draggable:true}).addTo(this.map);
            this.marker.on('moveend', this.latlngUpdate);
        }
        else this.marker.setLatLng([_obj.lat, _obj.lng]);

        // マーカーの座標をフォームへ反映
        this.latlngUpdate();
    },

    latlngUpdate:function() {
        let coordinate = map.getMarkerCoordinate();
        ui.formComlete_latlng(coordinate);
    },

    getMarkerCoordinate: function() {
        return this.marker._latlng;
    },


    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    onClick: function(e) {

        switch(pageType) {
            case 'mainForm':
                
                break;
            case 'parkingRegistration':

                if (map.marker === undefined) {
                    map.addMarker({lat : e.latlng.lat, lng : e.latlng.lng});
                    ui.formDisabledChange('js_convertButton_leaflet', false);
                }
                
                break;
        }

    },

    onDoubleClick: function(e) {

        switch(pageType) {
            case 'mainForm':
                
                break;
            case 'parkingRegistration':
                if (map.marker !== undefined) map.marker.setLatLng(e.latlng);
                break;
        }

    }



};
