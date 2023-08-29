let parkingInfo = function(source) {
    this.data = source;

    this.addSystemParams();
    //console.log('>>>this.data', this.data);
};

parkingInfo.prototype = {

    addSystemParams: function() {
        for (let D of this.data) {
            D.marker = undefined;       // LeafletのMarker
            D.plotOrder = undefined;    // true … プロット対象、false … プロット対象外
            D.reserved = false;         // true … calendarが指定する期間で予約されている
        }
    },

    reservedStatusUpdate: function(REV) {
        for (let D of this.data) {
            REV.periodCheck(D);

        }
    },


    plotStatusUpdate: function(rule) {
        // rule（フォームのチェック内容）から、this.dataを描画対象とするか、対象から外すかを決定する。
        // ※具体的には『this.data.plotOrder』のフラグを切り替える ： true（描画対象にする）、false（描画対象から外す）

        const R = this.arrangementFilter(rule);
        for (let D of this.data) {

            let judgementMaterials = {
                usableTypeNum : (R.usableTypeNum === D.usableTypeNum || R.usableTypeNum === 'all'),
                usableSize :    (R.usableSize === D.usableSize || R.usableSize === 'all'),
                
                // 今回は「武蔵台」の住所のみのため、addressでの検索機能は排除し、無条件でtrueとする。
                //address :       this.plotStatusUpdate_addressCheck(R.address, D),   
                address :       true,
                inoutdoor :     (R.inoutdoor === D.inoutdoor || R.inoutdoor === 'all'),

                mustcall :      (R.mustcall === D.mustcall || R.mustcall === 'all')
            };

            //console.log('> judgement materials ', judgementMaterials);
            D.plotOrder = this.plotStatusUpdate_judge(judgementMaterials);
        }

        return this.data;
    },

    plotStatusUpdate_judge: function(JM) {
        // 判断材料（JM … Judgement Materials）から対象を候補とするべきか決定
        // ※ 今は完全一致（＝materialの全てがtrueならOKと判定）とする

        for (let material in JM) {
            if (!JM[material]) return false;
        }
        return true;
    },
    /*plotStatusUpdate_addressCheck: function(address, item) {  // 今回は「武蔵台」の住所のみのため、addressでの検索機能は排除
        for (let prop in address.value) {
            let target = (prop === 'pref' || prop === 'city') ? item.address1: item.address2;

            let judge = target.includes(address.value[prop]);

            if (!judge) return false;
        }

        return (address.checked) ? true : false;
    },*/

    /* ----- filter arrangement ----- ----- ----- --- ----- ----- ----- */
    arrangementFilter: function(baseFilterRule) {

        let rule = {
            usableTypeNum :     this.arrangementFilter_usableTypeNum(baseFilterRule.select_usableTypeNum),
            usableSize :        this.arrangementFilter_usableSize(baseFilterRule.select_usableSize),
            //address :           this.arrangementFilter_address(baseFilterRule.input_address), // 今回は「武蔵台」の住所のみのため、addressでの検索機能は排除
            inoutdoor :         this.arrangementFilter_inoutdoor(baseFilterRule.input_in.value.stat, baseFilterRule.input_out.value.stat),
            mustcall :          this.arrangementFilter_mustcall(baseFilterRule.input_mustcall)
        };

        //console.log('【PLOT RULE】', rule);
        return rule;
    },
    arrangementFilter_usableTypeNum: function(source) {
        switch(source.value) {
            case '1. 3ナンバー':    return '0'; break;
            case '2. 5ナンバー':    return '1'; break;
            default: return 'all';
        }

        return undefined;
    },
    arrangementFilter_usableSize: function(source) {
        switch(source.value) {
            case '1. 155cm未満':        return '0'; break;
            case '2. 155 ～ 170cm':     return '1'; break;
            default: return 'all';
        }

        return undefined;
    },
    /*arrangementFilter_address: function(param) {  // 今回は「武蔵台」の住所のみのため、addressでの検索機能は排除
        console.log('param : ', param);

        let result = {checked : param.value.stat, value : {}}, count = 1,
            placeNames = param.value.value.split(' ');

        for (let name of placeNames) {
            switch(name.slice(-1)) {
                case '都': case '道': case '府': case '県':
                    result.value.pref = name; break;
                case '市': case '区': case '町': case '村':
                    result.value.city = name; break;
                default:
                    result.value[('address'+count)] = name;
                    count++;
            }

        }
        return result;
    },*/
    arrangementFilter_inoutdoor: function(_in, _out) {
        let result = undefined;

        if (_in && _out) result = 'all';
        else if (_in)    result = '1';
        else if (_out)   result = '0';

        return result;
    },
    arrangementFilter_mustcall: function(checkboxStat) {
        return (checkboxStat.value.stat) ? '0': 'all';
    },

};