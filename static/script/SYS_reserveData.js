let reserveMaster = function(source) {
    this.data = source;

    this.period = undefined;

    this.timecodeIntParse();
};

reserveMaster.prototype = {

    timecodeIntParse: function() {
        const prop = ['resv_at', 'use_start', 'use_end'];

        for (let D of this.data) {
            for (let _prop of prop) {
                D[_prop] = changeToTimecode(D[_prop])
            }
        }
    },

    setPeriod: function(package) {
        this.period = {
            code : {
                from : package.input_calendarFrom.value,
                to : package.input_calendarTo.value },
            timeline : {
                from : undefined, to : undefined }
        };

        this.setTimeline();
    },

    setTimeline : function() {
        const timeline = {
            from : parseInt(datecodeFormat(this.period.code.from, 'start')),
            to : (this.period.code.to === '') ? 
                parseInt(datecodeFormat(this.period.code.from, 'end')):
                parseInt(datecodeFormat(this.period.code.to, 'end'))
        };

        this.period.timeline = timeline;
    },

    collectReservedDataByParkId: function(targetParkID) {
        // ※参照渡しでのコピーとなります。。。
        let result = [];
        for (let D of this.data) {
            if (D.park_id === targetParkID) result.push(D);
        }

        return result;
    },

    periodCheck: function(obj) {
        const regardingData = this.collectReservedDataByParkId(obj.id);

        for (let R of regardingData) {
            const judge = this.compareBothTimelines(this.period.timeline, {from : R.use_start, to : R.use_end});

            if (judge !== 'noMatch') return false;
        }

        return true;
    },

    compareBothTimelines: function(L1, L2) {
        // timelineは{from:YYYYMMDDhhmmss, to:YYYYMMDDhhmmss}で渡すものとする

        if (L1.from === L2.from && L1.to === L2.to) return 'identical';
        else if (L1.from > L2.to || L1.to < L2.from) return 'noMatch';
        else if ((L1.from > L2.from && L1.from < L2.to && L1.to > L2.to) || (L1.to > L2.from && L1.to < L2.to && L1.from < L2.from)) return 'partialMatch';
        else if ((L1.from >= L2.from && L1.to <= L2.to) || (L1.from <= L2.from && L1.to >= L2.to)) return 'fullMatch';

        return undefined;
    },


};