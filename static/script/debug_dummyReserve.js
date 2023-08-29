dummyReserve = [
    // 時間の扱いはどういう型（表記が「YYYY/MM/DD」）になるのかが未定…。本ダミーデータは暫定的にYYYYMMDDhhmmss（＝年月日時分秒）として入力
    // ⇒23.5.11 データの扱いは「YYYY/MM/DD hh:mm:ss」（0埋め）とのこと、ダミーデータもその方向で修正

    {id: 1,                      // id (Integer)
    park_id: 1,                  // park_id (Integer)   駐車場DBの主キー
    user_id: 1,                  // user_id (Integer)   ユーザーDBの主キー
    resv_at: '2023/04/27 16:50:30',   // resv_at (DateTime？ Date？)　　予約日
    use_start: '2023/05/12 00:00:00', // use_start (DateTime？ Date？)　利用開始日
    use_end: '2023/05/12 23:59:59',   // use_end (DateTime？ Date？)       
    resv_status: '1'            // resv_status (String)        1 … 予約, 2 … ご利用済み
    },

    {id: 2,
    park_id: 1,
    user_id: 1,
    resv_at: '2023/04/15 20:55:52',   
    use_start: '2023/04/20 00:00:00',
    use_end: '2023/04/21 23:59:59',  
    resv_status: '2'               // resv_status (String)        1 … 予約, 2 … ご利用済み
    },

    {id: 3,
    park_id: 1,
    user_id: 1,
    resv_at: '2023/04/22 09:02:13',   
    use_start: '2023/05/15 00:00:00',
    use_end: '2023/05/17 23:59:59',  
    resv_status: '1'               // resv_status (String)        1 … 予約, 2 … ご利用済み
    },
 
    {id: 4,
    park_id: 2,
    user_id: 1,
    resv_at: '2023/04/25 10:32:30',
    use_start: '2023/05/14 00:00:00',
    use_end: '2023/05/14 23:59:59',  
    resv_status: '1'               // resv_status (String)        1 … 予約, 2 … ご利用済み
    },

    {id: 5,
    park_id: 2,
    user_id: 1,
    resv_at: '2023/04/27 17:20:20',
    use_start: '2023/05/16 00:00:00',
    use_end: '2023/05/17 23:59:59',      
    resv_status: '1'               // resv_status (String)        1 … 予約, 2 … ご利用済み
    },

    {id: 6,
    park_id: 2,
    user_id: 1,
    resv_at: '2023/04/27 17:20:20',
    use_start: '2023/05/19 00:00:00',
    use_end: '2023/05/22 23:59:59',      
    resv_status: '1'               // resv_status (String)        1 … 予約, 2 … ご利用済み
    },
];