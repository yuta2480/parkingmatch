let UI_parkingReg = function() {

    this.systemButtonIDs = {
        postalcode : 'js_convertButton_postalcode',
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
        let _dom_postalcode = document.getElementById('input_postalCode');   // 郵便暗号の内容が変わったタイミング
        _dom_postalcode.addEventListener('change', this.changePostalCode);

        // ボタン類へのイベント付与
        for (let prop in this.systemButtonIDs) {
            let _dom = document.getElementById(this.systemButtonIDs[prop]);
            _dom.addEventListener('click', {value: prop, parent : this, handleEvent : this.geocoding });
        }
    },

    /* ----- DOM操作 ----- ----- ----- --- ----- ----- ----- */
    formDisabledChange: function(targetDomID, stat) {
        document.getElementById(targetDomID).disabled = stat;
    },
    geoButtonsDisabledChange: function(job, mode) {
        const stat = (mode === 'ACTIVATE') ? false : true;
        for (let prop in this.systemButtonIDs) {
            document.getElementById(this.systemButtonIDs[prop]).disabled = stat;
        }

    },

    formDisabledChange_autoControl: function() {

        const status = this.collectStatus();

        let stat = (status.postalcode === undefined) ? true: false;
        this.formDisabledChange(this.systemButtonIDs.postalcode, stat);

        stat = (map.marker === undefined) ? true: false;
        this.formDisabledChange(this.systemButtonIDs.reverse, stat); 

    },

    /* ----- DOM操作・入力補完 ----- */
    formAdjust_postalcode: function() {
        const dom = document.getElementById('input_postalCode'),
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
            let quarter = (source.hasOwnProperty('quarter')) ? P.quarter: '',
                residential = (source.hasOwnProperty('residential')) ? P.residential: '';

            // 仮の優先順位：neighbourhood、quarter, residential
            return (source.hasOwnProperty('neighbourhood')) ? P.neighbourhood: (quarter !== '') ? quarter: residential;
        };

        document.getElementById('input_postalCode').value = P.postcode;
        document.getElementById('input_address1').value = (P.province + P.city).replace('undefined', '');
        document.getElementById('input_address2').value = createAddress2(P);
    },
    formComplete_address_postalcode: function(decorded) {
        let P = decorded.package;

        // document.getElementById('input_postalCode').value = P.zipcode;
        document.getElementById('input_address1').value = P.address1 + P.address2;
        document.getElementById('input_address2').value = P.address3;
    },
    formComplete_latlng: function(coordinate) {
        document.getElementById('secretParam_lat').value = coordinate.lat;
        document.getElementById('secretParam_lon').value = coordinate.lng;
    },



    /* ----- SYSTEM ----- ----- ----- --- ----- ----- ----- */
    collectStatus: function() {
        const adjustPostalCode = function(source) {
            if (source.length !== 7) return undefined;

            return source.substr(0, 3) + '-' + source.substr(3);
        };

        return {
            postalcode : adjustPostalCode(document.getElementById('input_postalCode').value),
            address1 : document.getElementById('input_address1').value,
            address2 : document.getElementById('input_address2').value
        }
    },



    geocodingOut: function(job, source, errCode) {

        // 1. エラーチェック
        if (source !== 'ERR' && errCode === undefined) {

            // 2. APIからもらった結果の整理（デコード）
            let D = new decorder(job, source);

            // 3. デコード結果の反映
            if (D.package === undefined) alert('該当する情報が見つかりませんでした。');
            else {
                // データの反映
                (job === 'reverse') ? this.parent.formComplete_address(D): this.parent.formComplete_address_postalcode(D);
            }
        }  

        // 4. フォームの調整
        ui.formDisabledChange_autoControl();
        // ui.geoButtonsDisabledChange(job, 'ACTIVATE');
    },

    geocoding: function() {
        // console.log('geocoding', this);
        let param = {
            package : (this.value === 'reverse') ? map.getMarkerCoordinate() : this.parent.geocoding_getPackage(this.job),
            job : this.value,
            callback : this.parent.geocodingOut,
            parent : this.parent
        };

        geo.jobOrder(param);
    },
    geocoding_getPackage: function(job) {
        let package = this.collectStatus();

        if (job === 'postalcode') {
            package.address1 = undefined;
            package.address2 = undefined;
        }

        return package;
    },



    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    changePostalCode: function() {
        const flag = ui.formAdjust_postalcode();
        ui.formDisabledChange('js_convertButton_postalcode', flag);
    }, 

};