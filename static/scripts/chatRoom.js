let checkToken =localStorage.getItem('token');

async function checkTokenExist() {
    let token = localStorage.getItem('token');
    if (!token) {
        try {
            await changeOnlineStatus();
            window.location.href = "/";
        } catch (error) {
            console.error('發生錯誤:', error);
        }
    }
}
async function checkTokenPeriodically() {
    setInterval(async function () {
        await checkTokenExist();
    }, 1000);
}
checkTokenPeriodically(); 

//登出
document.getElementById('signOut-btn').addEventListener('click',async function () {
    await changeOnlineStatus();
    localStorage.removeItem('token');
    window.location.reload();
});

//更改按鈕顏色
function changeButtonColor(button) {
    let computedStyle = window.getComputedStyle(button);
    let backgroundColor = computedStyle.backgroundColor;

    if (backgroundColor === "rgb(147, 112, 219)") { 
        button.style.backgroundColor = "#ffffff"; 
    }
}

const socket = io('http://127.0.0.1:4000');

async function changeOnlineStatus(){
    try {
        const response = await fetch('/signOut', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${checkToken}`,
                'Content-Type': 'application/json',
            },
        });
    
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}
