let UI_mainForm = function(parks, reserveData) {

    this.systemFormIDs = {
        multipleDays :  'checkbox_multipleDays',
        calendar_from : 'input_calendarFrom',
        calendar_to :   'input_calendarTo',
        timestamp_from :'input_timeStamp_From',
        timestamp_to:   'input_timeStamp_To',
        usableTypeNum : 'select_usableTypeNum',
        usableSize :    'select_usableSize',
        // input_address : 'input_address', 
        garage_in :     'input_in',
        garage_out:     'input_out',
    
        plot_mustcall:  'input_mustcall',
        plot_reservable:'input_reservable' };

    this.collectTargetFormIDs = ['input_calendarFrom', 'input_calendarTo', 
        'input_timeStamp_From', 'input_timeStamp_To',
        'select_usableTypeNum', 'select_usableSize',
        /*'input_address',*/ 'input_in', 'input_out',
    
        'input_mustcall', 'input_reservable' ];

    this.system = {
        park : new parkingInfo(parks),
        reserve : new reserveMaster(reserveData)
    }; 

    this.defaultStatusSetup();
    this.eventSetup();

};

UI_mainForm.prototype = {

    defaultStatusSetup: function() {

        // 1. カレンダーへ今日の日付をセット
        this.calendar_from_setToday(true);

        // 2. to側のカレンダーのmin値を設定
        this.calendar_to_setMinDate();

        // 3. timeStampのセット
        this.setTimeStamp();
    },

    eventSetup: function() {

        // フォーム類へのイベント付与（選択内容に変更があった場合に反応するもの）
        for (let prop in this.systemFormIDs) {
            let _dom = document.getElementById(this.systemFormIDs[prop]);
            _dom.addEventListener('change', {value: prop, parent : this, handleEvent : this.formChange });
        }
    },


    /* ----- DOM操作 ----- ----- ----- --- ----- ----- ----- */


    /* ----- DOM操作・カレンダー操作関係 ----- */
    calendarControl: function(name, param) {
        if (name === 'calendar_from') {
            this.calendar_from_setToday(false);
            this.calendar_to_setMinDate();

        } else if (name === 'calendar_to') {
            const value = document.getElementById(this.systemFormIDs[name]).value;
            if (value === '') this.calendar_displayChange(false);
        }

        this.setTimeStamp();
    },
    calendar_from_setToday: function(forceFlag) {
        // 'calendar_from'側の日付を今日の日付にする（forceFlag がtrueの場合、現在の内容に関係なく今日の日付で上書きする）
        let dom = document.getElementById(this.systemFormIDs.calendar_from);

        if (forceFlag || dom.value === '') {
        const todayCode = getDatecodeFromDateObj();
            dom.value = todayCode;
            dom.min = todayCode;    // これは必要？
        }
    },
    calendar_to_setMinDate: function(order) {
        // 'calendar_to'側のmin設定をFromの翌日にする
        let dateObj = getDateObjFromDatecode( document.getElementById(this.systemFormIDs['calendar_from']).value );
        let tomorrowDateCode = getDatecodeFromDateObj(dateObj, 1);

        // ・orderがtrueのとき
        // ・calendar_to側の現在の入力内容が空欄以外、且つ、tomorrowDateより小さい場合
        // ⇒ calendar_to値をtomorrowDateCodeで上書きする。
        const judge = function(current, tomorrow) {
            return (parseInt(current.replace('-', '')) <= parseInt(tomorrow.replace('-', '')))
        };

        let dom = document.getElementById(this.systemFormIDs['calendar_to']);
        dom.min = tomorrowDateCode;
        if (order || judge(dom.value, tomorrowDateCode)) dom.value = tomorrowDateCode;

    },

    calendar_displayChange: function(param) {
        let doms = document.getElementsByClassName('calendarBox');
        for (let D of doms) {
            let row = parseInt(D.style.gridRow.replace(/[^0-9]/g, '')); // grid-row の内容が 「1/auto」になるため、半角数字のみ抽出（※HTMLの仕様変更でエラーになる可能性あり）

            (row === 1) ? this.calendar_displayChange_from(param, D) : this.calendar_displayChange_to(param, D);
        }

        this.setTimeStamp();  
    },
    calendar_displayChange_from: function(param, parentDom) {
        for (let node of parentDom.children) {

            switch(node.tagName) {
                case 'LABEL':   node.textContent = (param) ? '予約希望日：開始日': '予約希望日'; break;
                case 'P':       node.style.display = (param) ? 'none' : 'flex'; break;
            }

        }
    },
    calendar_displayChange_to: function(param, parentDom) {
        parentDom.style.display = (param) ? 'block' : 'none';

        if (param) this.calendar_to_setMinDate(true);
        else {
            let dom = document.getElementById(this.systemFormIDs['multipleDays']);
            dom.checked = param;
        }
    },

    setTimeStamp: function() {
        let value = {
            from : document.getElementById(this.systemFormIDs.calendar_from).value,
            to : document.getElementById(this.systemFormIDs.calendar_to).value };

        // 1. カレンダーの値の加工（YYYY-MM-DD を yyyymmddhhmmss へ）
        let material = {
            from : datecodeFormat(value.from, 'start'),
            to : (value.to === '') ? datecodeFormat(value.from, 'end'): datecodeFormat(value.to, 'end')};

        // 2. TimeStampを格納している不可視のフォームの取得
        let dom = {
            from : document.getElementById(this.systemFormIDs.timestamp_from),
            to : document.getElementById(this.systemFormIDs.timestamp_to) };

        // 3. 「1.」の値をtimeStamp型へ変換して、「2.」へ反映する。（変換はcommon関数を経由する）
        dom.from.value = changeToTimeStamp(material.from);
        dom.to.value = changeToTimeStamp(material.to);
    },

    /* ----- DOM操作・マーカーポップアップ部分の作成 ----- */
    generateMarkerPopup: function(_obj) {

        //console.log('_obj :: ', _obj);
        getInoutDoor =  function(source) { return (source === '0') ? '屋外' : '屋内' };
        getMustCall =   function(source) { return (source === '0') ? '不要' : '必要' };
        getTypeNum =    function(source) { return (source === '0') ? '3ナンバー' : '5ナンバー' };
        getTypeSize =   function(source) { return (source === '0') ? '155cm未満' : '155 ～ 170cm' };

        // const screenshot = "../source/picture/"+_obj.picturePath;
        const htmlCode = '<div class="popup">'+
            // '<img src="'+screenshot+'" alt="'+_obj.title+'" />'+
            '<table>'+
            '<tr><td>駐車場名 </td><td>'+_obj.title+'</td></tr>'+
            '<tr><td>郵便番号 </td><td>'+_obj.postal_code+'</td></tr>'+
            '<tr><td>住所 </td><td>' + _obj.address1 + " " + _obj.address2 + '</td></tr>'+
            // '<tr><td>屋内・屋外 </td><td>' + _obj.inoutdoor + ' ' + getInoutDoor(_obj.inoutdoor) + '</td></tr>'+ 
            '<tr><td>屋内・屋外 </td><td>' + getInoutDoor(_obj.inoutdoor) + '</td></tr>'+
            '<tr><td>入出庫時の連絡 </td><td>' + getMustCall(_obj.mustcall) + '</td></tr>'+
            '<tr><td>駐車可能ナンバー </td><td>' + getTypeNum(_obj.usableTypeNum) + '</td></tr>'+
            '<tr><td>駐車可能な車高 </td><td>' + getTypeSize(_obj.usableSize) + '</td></tr>'+
            '</table>'+
            // '<button onClick="popup_selectButtonClick(\''+_obj.name+'\')">func 1</button>'+
            '</div>';

        return htmlCode;
    },


    /* ----- SYSTEM ----- ----- ----- --- ----- ----- ----- */
    systemRun: function() {
        this.markerPlotUpdate();

        // 他に初期設定が必要ならこちらに記述する
    },

    markerPlotUpdate: function() {
        let package = this.collectStatus();

        this.system.reserve.setPeriod(package);
        this.system.park.reservedStatusUpdate(this.system.reserve);

        map.leafletMarkerUpdate(this.system.park.plotStatusUpdate(package), this.generateMarkerPopup.bind(this));
    },

    collectStatus: function() {

        let package = {};
        const picking = function(dom) {
            switch(dom.type) {
                case 'date':
                case 'select-one':  return dom.value;
                case 'checkbox':    return {value : dom.value, stat : dom.checked};
            }
            return undefined;
        };

        for (let ID of this.collectTargetFormIDs) {
            const dom = document.getElementById(ID);

            package[ID] = {
                type : dom.type,
                value : picking(dom)
            };
        }

        return package;
    },







    /* ----- Event ----- ----- ----- --- ----- ----- ----- */
    formChange: function() {
        let dom = document.getElementById(this.parent.systemFormIDs[this.value]);
        switch(this.value) {
                       
            case 'multipleDays':
                this.parent.calendar_displayChange(dom.checked); break;
            case 'calendar_from':
            case 'calendar_to':
                this.parent.calendarControl(this.value, dom.checked);   // ※breakなし（意図的なfall through）
            default:
                this.parent.markerPlotUpdate();
        }


    }, 





};