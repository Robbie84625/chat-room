document.getElementById("signUp-btn").addEventListener("click", () => {
    checkSignupBuffer();
    if (checkSignupData()) {
        signUpData_to_database();
    }
})

async function signUpData_to_database() {
    let signUpRemind = document.getElementById("signUpRemind");
    let response = await fetch("/signUp", {
        method: 'POST',
        body: JSON.stringify({
            "email": signUpEmail,
            "password": signUpPassword,
            "name": signUpName,
            "nickName": signUpNickName
        })
        , headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });
    let data = await response.json();
    if (data.status === "success") {
        signUpRemind.innerHTML = '<span style="color: #00FF00">✅註冊成功</span>';

    }

    else if (data.status === "error" && data.message === "email已被註冊過了") {
        signUpRemind.innerHTML = "⚠信箱已經被註冊過了";
        
        clearSignupInputValues();
    }
}


// 檢查註冊資訊
function checkSignupData(){
    signUpEmail=document.getElementById("signUpEmail").value;
    signUpPassword=document.getElementById("signUpPassword").value;
    checkPassword=document.getElementById("checkPassword").value;
    signUpName=document.getElementById("signUpName").value;
    signUpNickName=document.getElementById("signUpNickName").value;

    let inputElements = {
        signUpEmail: signUpEmail,
        signUpPassword: signUpPassword,
        checkPassword: checkPassword,
        signUpName: signUpName,
        signUpNickName: signUpNickName
    };

    let emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let signUpRemind = document.getElementById("signUpRemind");
    
    let errorMessages = {
        signUpEmail: "⚠信箱不可為空",
        signUpPassword: "⚠密碼不可為空",
        signUpName: "⚠姓名不可為空",
        signUpNickName: "⚠暱稱不可為空"
    };
    
    for (let key in errorMessages) {
        if (inputElements[key] === "") {
            signUpRemind.innerHTML = errorMessages[key];
            clearSignupInputValues();
            return false;
        }
    }
    
    if (inputElements.signUpPassword !== inputElements.checkPassword) {
        signUpRemind.innerHTML = "⚠密碼不相同";
        clearSignupInputValues();
        return false;
    } else if (!emailRule.test(inputElements.signUpEmail)) {
        signUpRemind.innerHTML = "⚠信箱格式錯誤";
        clearSignupInputValues();
        return false;
    } else if (inputElements.signUpPassword.length < 5) {
        signUpRemind.innerHTML = "⚠密碼長度需大於五";
        clearSignupInputValues();
        return false;
    }
    return true;
}

function clearSignupInputValues() {
    document.getElementById("signUpEmail").value = "";
    document.getElementById("signUpPassword").value = "";
    document.getElementById("checkPassword").value = "";
    document.getElementById("signUpName").value = "";
    document.getElementById("signUpNickName").value = "";
}

function checkSignupBuffer(){
    signUpRemind.innerHTML = `
    <div style="display:flex;align-items: center;justify-content: center;" >
        <span style="color: black">正在檢查</span>
        <img src="/images/checkBuffer.gif" alt="examineBuffer" style="height: 22px;"/>
    </div>
`;
}