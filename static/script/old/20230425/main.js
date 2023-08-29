    // global class.
    //let data = new dataObject();    // サンプルデータ管理用のクラス

    // global items.
    let map = undefined;            // Leafletで初期化する

function initialize() {
    leafletActivate();
}

// Leaflet地図の作成
function leafletActivate() {
    map = L.map('leafletObj');  // 地図を表示する対象となるDOM要素の設定

    map.setView([35.875981, 139.300744], 16);   // 地図の中心とズームレベルを指定

    //表示するタイルレイヤのURLとAttributionコントロールの記述を設定して、地図に追加する
    /*L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);*/

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    });
    tileLayer.addTo(map);
}

function UIActivate(param) {
    // param as boolean
    // true … 画面左部のUIのdisplayを活性化（表示）
    
    const stat = (param) ? 'block' : 'none';
    let dom = document.getElementsByTagName('form');    // 本サンプルではform要素が1つなので、idではなくtagNamesで取得
    dom[0].style.display = stat;
}

/* UI操作に対応するイベント */
function popup_selectButtonClick(name) {
    const message = "押された地点：" + name;
    console.log(message);
    alert(message);
}

function plotTargetChange(sender) {
    console.log(sender);
    data.leafletMarkerUpdate();
}