async function userMsg_to_database() {
    try {
        const response = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({
                "email": loginEmail,
                "password": loginPassword
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const data = await response.json();

        if (data.status === "success") {
            loginRemind.innerHTML = '<span style="color: #00FF00">✅登陸成功</span>';
            localStorage.setItem('token', data.token);
            window.location.href = "/chatRoom";
        } else {
            loginRemind.innerHTML = "⚠登入失敗:帳號或密碼錯誤";
            clearLoginInputValues();
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

// 檢查變更資訊
function checkChangeMsgData(){
    userName=document.getElementById("userName").value;
    userNickName=document.getElementById("userNickName").value;

    let userMsgRemind = document.getElementById("userMsgRemind");
    
    if (!userName || !userNickName) {
        userMsgRemind.innerHTML = !loginEmail ? "⚠信箱不可為空" : (!loginPassword ? "⚠密碼不可為空" : "");
        clearLoginInputValues();
        return false;
    }
    else if (!emailRule.test(loginEmail)) {
        loginEmail.innerHTML = "⚠信箱格式錯誤";
        clearLoginInputValues();
        return false;
    } 
    return true;
}
