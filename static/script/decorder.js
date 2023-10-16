let decorder = function(job, source) {
    this.job = job;

    // console.log('> NORMAL ', source);
    this.source = (job === 'postalcode') ? JSON.parse(source.responseText): this.XMLparse(source);

    // console.log(this.source);
    this.package = (this.source === undefined) ? undefined : this.setPackage();

};

decorder.prototype = {

    XMLparse: function(_source) {

        // 1. 共通工程（responseXML.documentElement.outerHTMLをXMLデータに変換する）
        const parser = new DOMParser();
        let common_xmlData = parser.parseFromString(_source.responseXML.documentElement.outerHTML, 'text/xml');

        // 2. 1.の内容から個別対応を行う
        let xmlData = undefined;
        switch(this.job) {
            case 'normal':      xmlData = this.XMLparse_normal(common_xmlData); break;
            case 'reverse':     xmlData = this.XMLparse_reverse(common_xmlData); break;
        }

        return xmlData;
    },
    XMLparse_normal: function(xmlData) {
        let places = xmlData.getElementsByClassName('place');

        // debug ---
        /*console.log('■ places : ', places);
        console.log('■ places length : ', places.length);
        if (places.length > 1) console.log('【DEBUG】複数あり。。。');*/
        // debug ---
 
        if (places.length === 0) return undefined;

        /*console.log(places[0].attributes);
        console.log(places[0].attributes.lat.textContent);*/

        return places[0].attributes;
    },
    XMLparse_reverse: function(xmlData) {
        const parser = new DOMParser();

        // job 座標によってaddressPartsが複数ないか要確認
        let addressParts = xmlData.getElementsByTagName('addressparts');
        /*console.log('addressP', addressParts);
        console.log('addressP length', addressParts.length);*/

        return parser.parseFromString(addressParts[0].outerHTML, 'text/xml');
    },

    setPackage: function() {
        let package = {};

        switch(this.job) {
            case 'normal':      // ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- 
                package = {
                    lat : parseFloat(this.source.lat.nodeValue),
                    lng : parseFloat(this.source.lon.nodeValue)
                };
                break;
            case 'postalcode':  // ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- 
                if (this.source.results === null) return undefined; // 簡易エラーチェック （該当データが無かった場合）

                const obj1 = ['zipcode', 'prefcode', 'address1', 'address2', 'address3', 'kana1', 'kana2', 'kana3'];
                for (let O of obj1) {
                    package[O] = (O === 'zipcode') ? this.postCodeChangeToNumber(this.source.results[0].zipcode) : this.source.results[0][O];
                }

                break;
            case 'reverse':     // ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- --- ----- ----- ----- 
                const obj2 = ['postcode', 'province', 'city', 'residential', 'quarter', 'neighbourhood'];
                for (let O of obj2) {
                    let domElement = this.source.getElementsByTagName(O);
                    if (domElement.length !== 0) {
                        package[O] = (O === 'postcode') ? this.postCodeChangeToNumber(domElement[0].textContent) : domElement[0].textContent;
                    }
                }

                break;
        }

        //console.log('package :: ', package);
        return package;
    },

    // 郵便番号の文字形式（***-****）からハイフンを取り除き、数値化する
    postCodeChangeToNumber: function(source) {
        return parseInt(source.replace('-', ''));
    }


};