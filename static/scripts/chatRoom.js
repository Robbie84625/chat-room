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

const socket = io('https://chat-room.robbieliu.com');

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); 

    if (token) {
        try {
            const response = await fetch('/userOnlineStatus', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.status === 'success') {
                socket.emit('login', { memberId: data.memberId });
            } 
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }
});

async function changeOnlineStatus(){
    try {
        const response = await fetch('/signOut', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${checkToken}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (response.ok) {
            socket.emit('preDisconnect', { memberId: data.userId });
        } else {
            return false;
        }
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}
