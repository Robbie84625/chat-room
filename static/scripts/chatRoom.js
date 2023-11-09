if (!localStorage.getItem('token')) {
    window.location.href = "/";
}

token = localStorage.getItem('token');

async function fetchMemberData() {
    try {
        if (!token) {
            console.error('未找到令牌');
            return;
        }
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch('/getMemberData', { headers });

        let myHeadShot=document.getElementById("myHeadShot");
        let myName=document.getElementById("myName");
        let myNickName=document.getElementById("myNickName");
        let myMoodText=document.getElementById("myMoodText");

        if (response.ok) {
            const userData = await response.json();
            
            myMoodText.value = userData.moodText === null ? '心情小语' : userData.moodText;
            myHeadShot.src = userData.headshot === null ? 'images/head-shot-default.png' : userData.headshot;
            myName.value=userData.name;
            myNickName.value=userData.nickName;

        
        } else {
            console.error('無法獲取資料');
        }
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}

// 執行取得會員資訊函數
fetchMemberData();

document.getElementById("openUserMsg").addEventListener("click", () => {
    let userMsg=document.getElementById("userMsg");
    let mask=document.getElementById("mask");

    userMsg.style.display="block";
    mask.style.display="block";
});

document.getElementById("exitUserMsg").addEventListener("click", () => {
    let userMsg=document.getElementById("userMsg");
    let mask=document.getElementById("mask");

    userMsg.style.display="none";
    mask.style.display="none";
});

//登出
document.getElementById('signOut-btn').addEventListener('click', function () {
    localStorage.removeItem('token');
    
    window.location.reload();
});

