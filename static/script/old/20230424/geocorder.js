let geocorder = function() {
    this.body = undefined;

    this.param = {
        package : undefined,
        job : undefined, 
        callback : undefined};

    this.apiURL = {
        normal : 'https://nominatim.openstreetmap.org/search/jp/', 
        reverse : 'https://nominatim.openstreetmap.org/reverse'};


    // API監視用 -----
    this.watcher = () => {
        console.log(' ----- + ----- + ----- ');
        console.log('koneko status', this.body.status);
        console.log('koneko readyState', this.body.readyState);

        if (this.body.readyState == 4 && this.body.status == 200) {
            console.log('this.body :: ', this.body);
            this.param.callback(this.param.job, this.body);
        } else if (this.body.readyState == 4) {
            alert('先方のサーバーが応答しませんでした。恐れ入りますが1分程待ってから、再度、「地図に反映」ボタンを押下してください。');
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

        this.body = new XMLHttpRequest();
        this.body.open('GET', url, true);
        this.body.onreadystatechange = this.watcher();

        this.body.send();
    },

    getAPI_URL: function(query) {
        // jobが'postalcode'の場合、'normal'としてURLを取得する
        let job = this.param.job;
        if (job === 'postalcode') job = 'normal';

        return this.apiURL[job] + query;
    },

    // ----- ----- ジオコーディング（API）へ発行するクエリの作成 ----- -----
    getGeoQuery: function() {
        return (this.param.job === 'reverse') ? this.getGeoQuery_reverse(): this.getGeoQuery_normal();
    },
    getGeoQuery_normal: function() {

        console.log('>> QUERY_NORMAL', this.param.package);

        const createQueryNormal = function() {
            console.log('■■createQueryNormal');
            let result = '', flag = false;

            if (this.param.package.address1 === '' || this.param.package.address1 === undefined) result += '';
            else {result += '+' + this.param.package.address1; flag = true;}

            if (this.param.package.address2 === '' || this.param.package.address2 === undefined) result += '';
            else {
                const attr = (flag) ? ',+': '+';
                result += attr + this.param.package.address2;
                flag = true;}

            if (this.param.package.postalcode === '' || this.param.package.postalcode === undefined) result += '';
            else {
                const attr = (flag) ? ',+': '+';
                result += attr + this.param.package.postalcode;
                flag = true;}

            return result;
        };

        let query = '';
        query += (this.param.job === 'normal') ? ''+createQueryNormal(): '+'+this.param.package.postalcode;

        //query += '+亀有四丁目,+葛飾区,+125-0061';
        let attribute = 'format=xml&polygon=1&addressdetails=1';
        return query+'?'+attribute;
        
        // 参考
        // http://nominatim.openstreetmap.org/search/gb/birmingham/pilkington%20avenue/135?format=xml&polygon=1&addressdetails=1
    },
    getGeoQuery_reverse: function() {
        let result = '?format=xml'
        + '&lat='+this.param.package.lat
        + '&lon='+this.param.package.lng
        + '&zoom=18'
        + '&addressdetails=1';

        return result;
    }




};
