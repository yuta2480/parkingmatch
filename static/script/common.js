function zeroPadding(value, digit) {
    // 渡された「値」をdigitで指定された桁数だけゼロ埋めして返却する（value 33, digit 4の場合、文字列「0033」を返却）
    return ( Array(digit).join('0') + value ).slice(-digit);
}

function getDateObjFromDatecode(datecode) {
    // HTMLのcalendarで使用される'YYYY-MM-DD'の日付型を返す（undefinedの場合、今日の日付データを返す）
    if (datecode === undefined) return new Date();

    const code = datecode.split('-');
    for (let i = 0; i < code.length; i++) {
        code[i] = parseInt(code[i]);
    }

    return new Date(code[0], code[1]-1, code[2]);
}
function getDatecodeFromDateObj(dateObj, addDate) {
    // 日付オブジェクトからHTMLのカレンダーで使用されるデータコードを返却する
    if (dateObj === undefined) dateObj = new Date();
    if (addDate !== undefined) dateObj.setDate( dateObj.getDate() + 1 );

    return dateObj.getFullYear() + '-' + zeroPadding(dateObj.getMonth()+1, 2) + '-' + zeroPadding(dateObj.getDate(), 2);
}

function datecodeFormat(source, option) {
    // 'YYYY-MM-DD'からハイフンを除去し、optionに応じた時間情報を付与して返却する
    let datecode = source.replace(/-/g, '');
    let timeline = (option === 'start') ? '000000' : '235959';

    return datecode + timeline;
}

function changeToDT(source) {
    // yyyymmddhhmmss（int型） を （C言語でいう）DateTime型に則した形式へ変換する
    let seed = String(source);
    return {
        year :  seed.slice(0, 4),
        month : seed.slice(4, 6),
        date :  seed.slice(6, 8),
        hour :  seed.slice(8, 10),
        minute :seed.slice(10, 12),
        second :seed.slice(12, 14)
    };
}
function changeToTimeStamp(source) {
    // yyyymmddhhmmss（int型） を yyyy/mm/dd hh:mm:ss（文字列） へ変換
    const package = changeToDT(source)
    return '' + package.year + '/' + package.month + '/' + package.date + ' ' + 
        package.hour + ':' + package.minute + ':' + package.second;
}
function changeToTimecode(source) {
    // yyyy/mm/dd hh:mm:ss（文字列） を yyyymmddhhmmss（int型） へ変換
    let timecode = source.replace(/-| |\/|:/g, '');
    return parseInt(timecode);
}