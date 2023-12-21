let UI_parkingReg = function() {

    this.systemButtonIDs = {
        // postalcode : 'js_convertButton_postalcode',
        normal: 'js_convertButton_address'
        // reverse: 'js_convertButton_leaflet'
    };

    this.defaultStatusSetup();
    this.eventSetup();
};

UI_parkingReg.prototype = {

    defaultStatusSetup: function() {
        /*const values = Object.values(this.systemButtonIDs);
        for (let idName of values) {
            document.getElementById(idName).disabled = true;
        }*/
        this.formDisabledChange_autoControl();

    },

    eventSetup: function() {

        // 各フォームへのイベント付与
        let _dom_postalcode = document.getElementById('input_postalCode');   // 郵便暗号の内容が変わったタイミング
        _dom_postalcode.addEventListener('change', this.changePostalCode);

        let _dom_address1 = document.getElementById('input_address1');    // address1が変わったタイミング
        _dom_address1.addEventListener('change', this.changeAddress);

        let _dom_address2 = document.getElementById('input_address2');    // address2が変わったタイミング
        _dom_address2.addEventListener('change', this.changeAddress);

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

        // ナビゲーションメッセージを非表示に
        // this.navigateMessageChange('allStop');
    },

    formDisabledChange_autoControl: function() {
        const status = this.collectStatus();

        // address1とaddress2がともに有効な値（判定がfalse）のときのみ、ジオコーディング用のボタンを押せるようにする。
        let stat1 = (status.address1 === undefined || status.address1 === '' || status.address1 === '{{parking.address1}}') ? true : false;
        let stat2 = (status.address2 === undefined || status.address2 === '' || status.address2 === '{{parking.address2}}') ? true : false;
        let stat = (!stat1 && !stat2) ? false : true;

        this.formDisabledChange(this.systemButtonIDs.normal, stat);

        /* 2023/12/15 「地図にピンを打つ⇒住所に変換」の実装を解除する。それに伴いコメントアウト
        let stat = (status.postalcode === undefined || status.postalcode === '{{parking.postal_code}}') ? true: false;
        this.formDisabledChange(this.systemButtonIDs.postalcode, stat);

        stat = (map.marker === undefined) ? true: false;
        this.formDisabledChange(this.systemButtonIDs.reverse, stat); 

        // 住所類のフォームのdisabledを解除する
        this.formDisabledCheck(false);
        */
    },
    /* 2023/12/15 「地図にピンを打つ⇒住所に変換」の実装を解除する。それに伴いコメントアウト
    formDisabledCheck: function(stat) {
        targetIDs = ['input_address1'];

        for (let ID of targetIDs) {
            this.formDisabledChange(ID, stat);

            color = (stat) ? 'rgb(215, 215, 215)': 'transparent';
            document.getElementById(ID).style.backgroundColor = color;
        }
    },
    */

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


    /* ----- DOM操作・ナビゲーションの調整 ----- */
    /* 2023/12/15 「地図にピンを打つ⇒住所に変換」の実装を解除する。それに伴いコメントアウト
    navigateMessageChange: function(stat) {
        switch(stat) {
            case 'putMarker':   // leafletをクリックしてマーカーを設置した際に通過（呼び出し元：leafletObject.js）
                document.getElementById('message1').style.animationIterationCount = 1;
                document.getElementById('message2').style.animationIterationCount = 'infinite';
                break;
            case 'allStop':
            default:
                // 現状、allStop（＝全停止）とdefaultは同一。アニメーションカウントがループ指定になっているものを「1」に変更することで停止処理させる
                targets = ['message1', 'message2'];
                for (let target of targets) {
                    dom = document.getElementById(target);
                    // if (dom.style.animationIterationCount == 'infinite') dom.style.animationIterationCount = 1;
                    if (dom.style.animationIterationCount == 'infinite' || dom.style.animationIterationCount == '') dom.style.animationIterationCount = 1;
                }
        }
    }, */


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

        const showAlert_notFound = function() {
            alert('該当する情報が見つかりませんでした。');
        };

        // 1. 国土地理院API用のエラー対策
        if (source.responseText === '[]') { showAlert_notFound(); return; }

        if (source !== 'ERR' && errCode === undefined) {

            // 2. APIからもらった結果の整理（デコード）
            let D = new decorder(job, source);

            // 3. デコード結果の反映
            if (D.package === undefined) showAlert_notFound();
            else {
                // データの反映
                // (job === 'reverse') ? this.parent.formComplete_address(D): this.parent.formComplete_address_postalcode(D);
                switch(job) {
                    case 'normal':      map.addMarker(D.package); map.forcePanAndZoom(D.package, 17); break;
                    case 'reverse':     this.parent.formComplete_address(D); break;
                    case 'postalcode':  this.parent.formComplete_address_postalcode(D); break;
                }

            }
        }  

        // 4. フォームの調整
        ui.formDisabledChange_autoControl();
        // console.log('geocodingOut : job >> ', job)
        ui.geoButtonsDisabledChange(job, 'ACTIVATE');
    },

    geocoding: function() {
        // console.log('geocoding', this);
        let param = {
            package : (this.value === 'reverse') ? map.getMarkerCoordinate() : this.parent.collectStatus(),
            job : this.value,
            callback : this.parent.geocodingOut,
            parent : this.parent
        };

        geo.jobOrder(param);
    },
    

    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    changePostalCode: function() {
        const flag = ui.formAdjust_postalcode();
        // ui.formDisabledChange('js_convertButton_postalcode', flag);        // 2023/12/15 「地図にピンを打つ⇒住所に変換」の実装を解除する。それに伴いコメントアウト
    }, 


    changeAddress: function() {
        ui.formDisabledChange_autoControl();

        /*stat = ui.collectStatus();
        flag = (stat.address1 == '') ? true : false;
        ui.formDisabledChange('js_convertButton_address', flag);*/
    }, 

};