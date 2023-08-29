let decorder = function(job, source) {
    this.job = job;

    console.log('> NORMAL ', source);
    this.source = this.XMLparse(source);

    console.log(this.source);
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
            case 'postalcode':
            case 'normal':      xmlData = this.XMLparse_normal(common_xmlData); break;
            case 'reverse':     xmlData = this.XMLparse_reverse(common_xmlData); break;
        }

        return xmlData;
    },
    XMLparse_normal: function(xmlData) {
        // job 座標によってaddressPartsが複数ないか要確認
        //let places = xmlData.getElementsByTagName('place');
        let places = xmlData.getElementsByClassName('place');
        console.log('■ places : ', places);
        if (places.length === 0) return undefined;

        console.log(places[0].attributes);
        console.log(places[0].attributes.lat.textContent);
        return places[0].attributes;
    },
    XMLparse_reverse: function(xmlData) {
        const parser = new DOMParser();

        // job 座標によってaddressPartsが複数ないか要確認
        let addressParts = xmlData.getElementsByTagName('addressparts');
        console.log('addressP', addressParts);
        console.log('addressP length', addressParts.length);

        return parser.parseFromString(addressParts[0].outerHTML, 'text/xml');
    },

    setPackage: function() {
        let package = {};

        if (this.job === 'normal') {
            package = {
                lat : parseFloat(this.source.lat.nodeValue),
                lng : parseFloat(this.source.lon.nodeValue)
            };

        } else if (this.job === 'reverse' || this.job === 'postalcode') {

            const _obj = ['postcode', 'province', 'city', 'residential', 'neighbourhood'];
            for (let O of _obj) {

                let domElement = this.source.getElementsByTagName(O);
                if (domElement.length !== 0) {
                    package[O] = (O === 'postcode') ? this.postCodeChangeToNumber(domElement[0].textContent) : domElement[0].textContent;
                }

            }

           /* package = {
                postcode : this.postCodeChangeToNumber( this.source.getElementsByTagName('postcode')[0].textContent ), // 郵便番号（***-****）
                province : this.source.getElementsByTagName('province')[0].textContent, // 都道府県
                city : this.source.getElementsByTagName('city')[0].textContent,         // 市町村
                residential : this.source.getElementsByTagName('residential')[0].textContent,         // 武蔵台
            //    neighbourhood : this.source.getElementsByTagName('neighbourhood')[0].textContent         // 武蔵台三丁目 
            };*/

        }

        console.log('package :: ', package);
        return package;
    },

    // 郵便番号の文字形式（***-****）からハイフンを取り除き、数値化する
    postCodeChangeToNumber: function(source) {
        let result = parseInt(source.replace('-', ''));
        console.log(result);
        return result;
    }


};