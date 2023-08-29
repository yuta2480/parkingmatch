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

    switch(pageType) {
        case 'parkingRegistration':                 geo = new geocorder(); break;
    }

    UI_Init();
}

function UI_Init() {
    switch(pageType) {
        case 'parkingRegistration':                 ui = new UI_parkingReg(); break;
        case 'mainForm':                            ui = new UI_mainForm(parks, reserve); ui.systemRun(); break;
        case 'confirmationOfApplicationDetails':    ui = new UI_confirmationOfApplicationDetails(_lat, _lon, _park_id, _use_start, _use_end); console.log('main.js>>', _lon, _lat);  break; 
    }
}




