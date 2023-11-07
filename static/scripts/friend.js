const token = localStorage.getItem('token');

//打開邀請好友頁面
document.getElementById("opneAddFriend").addEventListener("click", () => {
    let addFriendContainer=document.getElementById("addFriendContainer");
    let mask=document.getElementById("mask");

    addFriendContainer.style.display="block";
    mask.style.display="block";
});

//關閉邀請好友頁面
document.getElementById("exitAddFriendContainer").addEventListener("click", () => {
    document.querySelector('.selectFriendContainer.bg-white').innerHTML="";
    document.getElementById('inviteFriendEmail').value="";
    
    document.getElementById("addFriendContainer").style.display="none";
    document.getElementById("mask").style.display="none";
    
    document.getElementById("mask").style.display="none";
});

//查詢存在資料庫要邀請好友的會員
async function selectNewFriendData_in_database() {
    try {
        let email = document.getElementById("inviteFriendEmail").value;
        const response = await fetch("/selectNewFriend", {
            method: "POST",
            body: JSON.stringify({
                "email": email
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        if (data.message == "無此用戶") {
            let containerDiv = document.querySelector('.selectFriendContainer.bg-white');
            containerDiv.innerHTML = `<div class="selectFriendContainer__noExist text-darkPurple">
            ${data.message} !
            </div>`;
        }
        else if(data.status ==="error"){
            let newFriendData = data.newFriendData[0];
            let htmlContent = createSelectFriendElement(newFriendData,data.message);

            let containerDiv = document.querySelector('.selectFriendContainer.bg-white');
            containerDiv.innerHTML = htmlContent;
        }
        else if (data.newFriendData && data.newFriendData.length > 0) {
            let newFriendData = data.newFriendData[0];
            let htmlContent = createSelectFriendElement(newFriendData,data.message);

            let containerDiv = document.querySelector('.selectFriendContainer.bg-white');
            containerDiv.innerHTML = htmlContent;
        } 

    } catch (error) {
        console.error("Error during login:", error);
    }
    
}

//搜尋夥伴
document.getElementById("findFriend-btn").addEventListener("click", () => {
    selectNewFriendData_in_database();
});

function createSelectFriendElement(newFriendData,status) {
    let headshotURL = newFriendData.headshot || '/images/head-shot-default.png';
    return `
        <div class="selectFriendExist">
            <img class="selectFriendExist__headShot" src="${headshotURL}" alt="Headshot">
            <div class="selectFriendExist__nickName">${newFriendData.nickName}</div>
            <div class="selectFriendExist__status text-gray text-16">${status}</div>
            <div class="selectFriendExist__checkBar">
                <button class="selectFriendExist__checkBar__btn bg-green">確認</button>
                <button class="selectFriendExist__checkBar__btn bg-white">取消</button>
            </div>
        </div>`;
}