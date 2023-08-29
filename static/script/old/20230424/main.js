    // global class.
    let map = new LeafletObject();      // Leaflet管理用クラス
    let geo = new geocorder();          // ジオコーディングAPIとのやり取りを行うクラス
    let ui = undefined;
    //let data = new dataObject();    // サンプルデータ管理用のクラス

    // global items.
    let defaultParams = {
        lat: 35.875981, lng: 139.300744,
        zoomLevel: 16
    };
    let pageType = undefined;

function initialize(_pageType) {
    pageType = _pageType;
    map.leafletActivate([defaultParams.lat, defaultParams.lng], defaultParams.zoomLevel);
    UI_Init();
}

function UI_Init() {
    switch(pageType) {
        case 'parkingRegistration':     ui = new UI_parkingReg(); break;
        case 'mainForm':                break;//ui = new UI_mainForm(); break;
    }
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