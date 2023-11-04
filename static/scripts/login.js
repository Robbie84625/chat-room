document.getElementById("login-btn").addEventListener("click", () => {
    checkLoginBuffer();
    if (checkLoginData()) {
        loginData_to_database();
    }
});

async function loginData_to_database() {
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

// 檢查登入資訊
function checkLoginData(){
    loginEmail=document.getElementById("loginEmail").value;
    loginPassword=document.getElementById("loginPassword").value;

    let emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let loginRemind = document.getElementById("loginRemind");
    
    if (!loginEmail || !loginPassword) {
        loginRemind.innerHTML = !loginEmail ? "⚠信箱不可為空" : (!loginPassword ? "⚠密碼不可為空" : "");
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

function clearLoginInputValues() {
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
}

function checkLoginBuffer(){
    loginRemind.innerHTML = `
    <div style="display:flex;align-items: center;justify-content: center;" >
        <span style="color: black">正在檢查</span>
        <img src="/images/checkBuffer.gif" alt="examineBuffer" style="height: 22px;"/>
    </div>
`;
}
