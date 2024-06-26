let LeafletObject = function() {
    this.stat = false;
    this.map = undefined;

    this.marker = undefined;    // マーカー情報　※mainFormでは（複数のマーカを扱うため）SYS_parkinginfo内にマーカー格納変数を用意して利用する
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
    addMarker: function(_obj) { // parkingRegistration.html側から使用（mainForm側からは↓のaddSystemMarker関数を利用する）

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
        ui.formComplete_latlng(coordinate);
    },

    getMarkerCoordinate: function() {
        return this.marker._latlng;
    },

    /*addMarkerFromAPI: function(latlng) {
        let bounds = L.latLngBounds();
        console.log('>> aPI ', bounds);

        map.addMarker({lat : D.package.lat, lng : D.package.lng})
    },*/



    freeze: function() {
        this.map.dragging.disable();
        this.map.scrollWheelZoom.disable();
        this.map.zoomControl.disable();
    },

    forcePanAndZoom: function(latlng, zoomLevel) {

        this.map.flyTo(latlng, zoomLevel, { animate: false });

       /* console.log('pan and zoom : ', latlng);
        let aaa = this.map.panTo(latlng);
        console.log('aaa ', aaa);
        this.map.setZoom(zoomLevel);*/
    },

    /* -----  ----- ----- ----- --- ----- ----- ----- */
    leafletMarkerUpdate: function(source, generator) {

        // 現マーカーの全削除
        this.allEraseMarker(source);

        // ※マーカー描画変更後のオートズームを有効にしたい場合、関数内のbounds部分を有効にする
        //let bounds = new BoundsObject();
        
        for (let _obj of source) {
        
            if (_obj.plotOrder) {
                // true … markerが未作成の場合、markerを作成する。（boundsの更新は既設markerの有無によらず実行する）
                if (_obj.marker === undefined) {
                    _obj.marker = this.addSystemMarker(_obj);
                    _obj.marker.bindPopup(generator(_obj));
                    _obj.marker.addTo(this.map);
                }
                //bounds.update(_obj.lat, _obj.lon);
            } else {
                // false … markerを生成しない（すでにマーカーがあるなら削除する）
                if (_obj.marker !== undefined) {
                    this.map.removeLayer(_obj.marker);
                    _obj.marker = undefined;
                }
            }

        }

        // データに応じた表示範囲調整
        // bounds.fitting(this.map);
    },

    addSystemMarker: function(_obj) {
        let marker = L.marker([_obj.lat, _obj.lon]);//.addTo(this.map);

        marker.bindTooltip(_obj.title);
        return marker;
    },

    allEraseMarker: function(source) {
        for (let _obj of source) {
            if (_obj.marker !== undefined) {
                this.map.removeLayer(_obj.marker);
                _obj.marker = undefined;
            }
        }
    },

    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    onClick: function(e) {

        switch(pageType) {
            case 'mainForm':
                
                break;
            case 'parkingRegistration':

                if (map.marker === undefined) {
                    map.addMarker({lat : e.latlng.lat, lng : e.latlng.lng});
                    // 2023/12/15 「地図にピンを打つ⇒住所に変換」の実装を解除する。それに伴いコメントアウト
                    // ui.formDisabledChange('js_convertButton_leaflet', false);
                    // ui.navigateMessageChange('putMarker');
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
                map.latlngUpdate();
                break;
        }

    }



};
