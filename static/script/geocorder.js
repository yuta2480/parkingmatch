let geocorder = function() {
    this.body = undefined;

    this.param = {
        package : undefined,
        job : undefined, 
        callback : undefined};

    this.apiURL = {
        postalcode : 'https://zipcloud.ibsnet.co.jp/api/search?zipcode=',
        normal : 'https://nominatim.openstreetmap.org/search/jp/', 
        reverse : 'https://nominatim.openstreetmap.org/reverse'};


    // API監視用 -----
    this.watcher = () => {
        /*console.log(' ----- + ----- + ----- ');
        console.log('server status', this.body.status);
        console.log('server readyState', this.body.readyState);*/

        if (this.body.readyState == 4 && this.body.status == 200) {
            // console.log('this.body :: ', this.body);
            this.param.callback(this.param.job, this.body);
        } else if (this.body.readyState == 4) {
            alert('先方のサーバーが応答しませんでした。恐れ入りますが1分程待ってから、再度、ボタンを押下してください。');
            this.param.callback(this.param.job, 'ERR', 'sessionTimeout');
        } else {
            setTimeout(this.watcher, 200);
        }
    };

};

geocorder.prototype = {

    jobOrder: function(_param) {
        this.param = _param;

        ui.geoButtonsDisabledChange(this.param.job, 'DEACTIVATE');
        this.runDecording();
    },

    runDecording: function() {
        const url = this.getAPI_URL(this.getGeoQuery());
        // console.log('■ query url ', url);

        this.body = new XMLHttpRequest();
        this.body.open('GET', url, true);
        this.body.onreadystatechange = this.watcher();

        this.body.send();
    },

    getAPI_URL: function(query) {
        return this.apiURL[this.param.job] + query;
    },

    // ----- ----- ジオコーディング（API）へ発行するクエリの作成 ----- -----
    getGeoQuery: function() {
        let query = undefined;
        switch(this.param.job) {
            case 'normal':      query = this.getGeoQuery_normal(); break;
            case 'reverse':     query = this.getGeoQuery_reverse(); break;
            case 'postalcode':  query = this.getGeoQuery_zipcloud();
        }
        return query;
    },
    getGeoQuery_normal: function() {

        // console.log('>> QUERY_NORMAL', this.param.package);

        const createQueryNormal = function(P) {
            let result = '', flag = false;

            if (P.address1 === '' || P.address1 === undefined) result += '';
            else {result += '+' + P.address1; flag = true;}

            if (P.address2 === '' || P.address2 === undefined) result += '';
            else {
                const attr = (flag) ? ',+': '+';
                result += attr + P.address2;
                flag = true;}

            if (P.postalcode === '' || P.postalcode === undefined) result += '';
            else {
                const attr = (flag) ? ',+': '+';
                result += attr + P.postalcode;
                flag = true;}

            return result;
        };

        let query = '';
        query += (this.param.job === 'normal') ? ''+createQueryNormal(this.param.package): '+'+this.param.package.postalcode;

        let attribute = 'format=xml&polygon=1&addressdetails=1';
        return query+'?'+attribute;
        
        // 参考
        // http://nominatim.openstreetmap.org/search/gb/birmingham/pilkington%20avenue/135?format=xml&polygon=1&addressdetails=1
    },
    getGeoQuery_reverse: function() {
        let query = '?format=xml'
        + '&lat='+this.param.package.lat
        + '&lon='+this.param.package.lng
        + '&zoom=18'
        + '&addressdetails=1';

        return query;
    },
    getGeoQuery_zipcloud: function() {
        return this.param.package.postalcode + '&limit=100';
    }




};
