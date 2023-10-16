// settingChange.html、およびuserRegistration.htmlにて、パスワード関係のフォームの内容が一致しているかをチェックする
// ※今回は、両ページともに「アラート関係のフォーム類は同じid名にしている」為、id名はそのままコードに直打ちしてあります。
function passwordCheck(caller) {

    console.log(caller.value);
    console.log(caller.id);

    // フォームの入力内容を取得し返却する
    const getValues = function() {
        let result = [],
        idName = ["input_password", "input_passwordConfirm"];
        for (let _id of idName) {
            dom = document.getElementById(_id);
            result.push(dom.value);
        }

        return {pass : result[0], confirm : result[1]};
    };

    // アラートメッセージの表示切替
    const alertMessage_showSwitch = function(order) {
        dom = document.getElementById('alert_passwordConfirm');
        dom.style.display = order;
    };

    const isMatch = function() {
        return (stat.pass === stat.confirm) ? true : false;
    };

    // ----- ----- ----- ----- 

    // 1. パスとパス確認用の入力内容を取得する
    const stat = getValues();

    // 2. パスとパス確認用がともに空欄でないことを確認する
    // ※どちらかが空欄の場合、アラート表示を解除して本関数を抜ける
    if (stat.pass === '' || stat.confirm === '') {
        alertMessage_showSwitch('none');
        return;
    }

    // 3. パスとパス確認用が一致しているか？
    if (isMatch()) alertMessage_showSwitch('none');
    else alertMessage_showSwitch('block');

}