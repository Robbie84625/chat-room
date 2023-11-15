const token = localStorage.getItem('token');

//打開邀請好友頁面
document.getElementById("openAddFriend").addEventListener("click", () => {
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

            let htmlContent = createSelectFriendElement(data.newFriendData,data.message);

            let containerDiv = document.querySelector('.selectFriendContainer.bg-white');
            containerDiv.innerHTML = htmlContent;
        }
        
        else{
            let htmlContent = createSelectFriendElement(data.newFriendData,data.message);

            let containerDiv = document.querySelector('.selectFriendContainer.bg-white');
            containerDiv.innerHTML = htmlContent;
            
            return data.newFriendData;
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
    
}

//搜尋夥伴
document.getElementById("findFriend-btn").addEventListener("click",  async () =>  {
    let  newFriendData = await selectNewFriendData_in_database();
    console.log(newFriendData)
    controlSelectFriendBtn(newFriendData);
});

//好友存在，建立相關資訊
function createSelectFriendElement(newFriendData,status) {
    let headShotURL = newFriendData.headshot || '/images/head-shot-default.png';
    if(status==="請問是你要找的夥伴嗎?"){
        return `
        <div class="selectFriendExist">
            <img class="selectFriendExist__headShot" src="${headShotURL}" alt="head shot">
            <div class="selectFriendExist__nickName">${newFriendData.nickName}</div>
            <div class="selectFriendExist__status text-gray text-16">${status}</div>
            <div class="selectFriendExist__checkBar">
                <button class="selectFriendExist__checkBar__btn bg-green" id="confirmInvite">確認</button>
                <button class="selectFriendExist__checkBar__btn bg-white" id="cancelInvite">取消</button>
            </div>
            <div class="selectFriendExist__status text-gray text-16" id="inviteStatus"></div>
        </div>`;
    }
    else{
        return `
        <div class="selectFriendExist">
            <img class="selectFriendExist__headShot" src="${headShotURL}" alt="head shot">
            <div class="selectFriendExist__nickName">${newFriendData.nickName}</div>
            <div class="selectFriendExist__status text-gray text-16">${status}</div>
            <button class="selectFriendExist__checkBar__btn bg-green" style="display:block; margin: 30px auto 0px auto; width: 85px;" id="got_it">確認</button> 
            
        </div>`;
    }
}

//賦予搜尋好友頁面按鈕控制函式
function controlSelectFriendBtn(newFriendData) {
    try {
        const cancelInvite = document.getElementById('cancelInvite');
        if (cancelInvite) {
            cancelInvite.addEventListener('click', clearSelectFriendContainer);
        }

        const gotIt = document.getElementById('got_it');
        if (gotIt) {
            gotIt.addEventListener('click', clearSelectFriendContainer);
        }

        
        const confirmInvite = document.getElementById('confirmInvite');
        if (confirmInvite) {
            confirmInvite.addEventListener('click', () => {
                sendFriendInvitation(newFriendData);
            });
        }
    } catch (e) {
        console.error("錯誤設置: ", e);
    }
}

function clearSelectFriendContainer() {
    const selectFriendContainer = document.querySelector('.selectFriendContainer.bg-white');
    if (selectFriendContainer) {
        selectFriendContainer.innerHTML = "";
    }

    const inviteFriendEmail = document.getElementById('inviteFriendEmail');
    if (inviteFriendEmail) {
        inviteFriendEmail.value = "";
    }
}

function clearSelectFriendContainer() {
    const selectFriendContainer = document.querySelector('.selectFriendContainer.bg-white');
    if (selectFriendContainer) {
        selectFriendContainer.innerHTML = "";
    }

    const inviteFriendEmail = document.getElementById('inviteFriendEmail');
    if (inviteFriendEmail) {
        inviteFriendEmail.value = "";
    }
}

async function sendFriendInvitation(newFriendData){
    console.log(newFriendData)
    const response = await fetch("/sendFriendInvitation", {
        method: "POST",
        body: JSON.stringify({
            "data": newFriendData
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    inviteStatus= document.getElementById('inviteStatus')
    
    if(response.status === 200){
        inviteStatus.style.color="green";
        inviteStatus.innerHTML=`✅${data.message}!` 
    }
    else{
        inviteStatus.style.color="red";
        inviteStatus.innerHTML=`⚠${data.message}!`
    }
    
}

