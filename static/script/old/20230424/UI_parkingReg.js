let UI_parkingReg = function() {

    this.systemButtonIDs = {
        postalcode : 'js_convertButton_postalcode',
        normal : 'js_convertButton_address',
        reverse: 'js_convertButton_leaflet'};

    this.defaultStatusSetup();
    this.eventSetup();
};

UI_parkingReg.prototype = {

    defaultStatusSetup: function() {
        const values = Object.values(this.systemButtonIDs);
        for (let idName of values) {
            document.getElementById(idName).disabled = true;
        }

    },

    eventSetup: function() {

        // 各フォームへのイベント付与
        let _dom_postalcode = document.getElementById('label_input1_postalCode');
        _dom_postalcode.addEventListener('change', this.changePostalCode);

        // ボタン類へのイベント付与
        for (let prop in this.systemButtonIDs) {
            let _dom = document.getElementById(this.systemButtonIDs[prop]);
            _dom.addEventListener('click', {value: prop, parent : this, handleEvent : this.geocoding });
        }
    },

    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    formDisabledChange: function(targetDomID, stat) {
        document.getElementById(targetDomID).disabled = stat;
    },
    geoButtonsDisabledChange: function(job, stat) {

        if (stat === 'ACTIVATE') {
            for (let prop in this.systemButtonIDs) {
                document.getElementById(this.systemButtonIDs[prop]).disabled = false;
            }
        } else if (stat === 'DEACTIVATE') {
            for (let prop in this.systemButtonIDs) {
                document.getElementById(this.systemButtonIDs[prop]).disabled = true;
            }

        }

    },


    formAdjust_postalcode: function() {
        const dom = document.getElementById('label_input1_postalCode'),
            regex = /[^0-9 ０-９]/g;

        // 入力内容を半角数字と全角数字だけ残して取得
        let array = dom.value.replace(regex, '').split('');

        let result = '';
        for (let item of array) {
            result += (item.charCodeAt(0) > 0xFEE0) ? String.fromCharCode(item.charCodeAt(0) - 0xFEE0) : item;  // 全角の数字であれば半角に変換

            if (result.length > 6) break;
        }

        dom.value = result;
        return (result.length !== 7) ? true : false;
    },


    formComplete_address: function(decorded) {

        let P = decorded.package;
        const createAddress2 = function(source) {
            let residential = (source.hasOwnProperty('residential')) ? P.residential: '';
            let result = (source.hasOwnProperty('neighbourhood')) ? P.neighbourhood: residential;
            return result;
        };

        document.getElementById('label_input1_postalCode').value = P.postcode;
        document.getElementById('label_input2_address1').value = P.province + P.city;
        document.getElementById('label_input3_address2').value = createAddress2(P);
    },
    formComlete_latlng: function(coordinate) {
        document.getElementById('secretParam_lat').value = coordinate.lat;
        document.getElementById('secretParam_lon').value = coordinate.lng;
    },


    collectStatus: function(job) {
        // job … normal 住所から座標を取得, postalcode 郵便番号から住所を取得

        const adjustPostalCode = function(source) {
            if (source.length !== 7) return undefined;

            return source.substr(0, 3) + '-' + source.substr(3);
        };

        return {
            postalcode : adjustPostalCode(document.getElementById('label_input1_postalCode').value),
            address1 : document.getElementById('label_input2_address1').value,
            address2 : document.getElementById('label_input3_address2').value
        }
    },

    geocodingOut: function(job, source, errCode) {

        // エラーチェック
        if (source !== 'ERR' && errCode === undefined) {

            // APIからもらった結果の整理（デコード）
            let D = new decorder(job, source);
            if (D.package === undefined) alert('該当する情報が見つかりませんでした。');
            else {
                // データの反映
                (job === 'normal') ? map.addMarker({lat : D.package.lat, lng : D.package.lng}): this.parent.formComplete_address(D);
            }
        }  

        // フォームの調整
        ui.geoButtonsDisabledChange(job, 'ACTIVATE');
    },

    geocoding: function() {
console.log('geocoding', this);
        let param = {
            package : (this.value === 'reverse') ? map.getMarkerCoordinate() : this.parent.collectStatus(this.value),
            job : this.value,
            callback : this.parent.geocodingOut,
            parent : this.parent
        };

        geo.jobOrder(param);
    },



    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    changePostalCode: function() {
        const flag = ui.formAdjust_postalcode();
        console.log('flag', flag);
        ui.formDisabledChange('js_convertButton_postalcode', flag);
    }

};