    // global class.
    let map = new LeafletObject();      // Leaflet管理用クラス
    let geo = undefined;               // ジオコーディングAPIとのやり取りを行うクラス
    let ui = undefined;

    // global items.
    const defaultParams = {
        lat: 35.875981, lng: 139.300744,
        zoomLevel: 16
    };
    let pageType = undefined;

function initialize(_pageType) {
    pageType = _pageType;
    map.leafletActivate([defaultParams.lat, defaultParams.lng], defaultParams.zoomLevel);

    if (pageType === 'parkingRegistration') {
        geo = new geocorder(); }

    UI_Init();
}

function UI_Init() {
    switch(pageType) {
        case 'parkingRegistration':     ui = new UI_parkingReg(); break;
        case 'mainForm':                ui = new UI_mainForm(parks, reserve); ui.systemRun(); break;
        // case 'mainForm':                ui = new UI_mainForm(parks); ui.systemRun(); break;
    }
}




