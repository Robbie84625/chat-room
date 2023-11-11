document.getElementById("notice-btn").addEventListener("click", () => {
    change_noticeBtn_bg();
    clearContainer();
    fetch_firstPage_notice();
});

function noticeAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");

    friendPage.style.display="none";
    groupContainer.style.display="none";
    noticePage.style.display="block";
}

async function getInviteData_from_database(page,contact__loading){
    let token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    try {
        const response = await fetch(`/getInviteData?page=${page}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        contact__loading.style.display="none";

        if(data['data'].sendInvite){
            createSendInvite(data['data'].sendInvite)
        }
        if(data['data'].receiveInvite){
            createReceiveInvite(data['data'].receiveInvite)
        }
    
    } catch (error) {
        console.error("Error during login:", error);
    }
    
}

function createSendInvite(data){
    const noticeContainer = document.getElementById('noticeContainer');
    

    for(let detail of data){
        if(detail.invitationStatus==="PendingConfirmation"){
            handlePendingConfirmation(detail, noticeContainer );
        }
        else if(detail.invitationStatus==="Confirmed"){
            handleConfirmed(detail, noticeContainer );
        }
    }
}

function createReceiveInvite(data){
    const noticeContainer = document.getElementById('noticeContainer');


    for(let detail of data){
        if(detail.invitationStatus==="PendingConfirmation"){
            handleReceiveInvite(detail, noticeContainer);
        }
    }
}

function change_noticeBtn_bg(){
    let noticeBtn = document.getElementById("notice-btn")
    noticeBtn.style.backgroundColor = "#9370db";

    let userMsgBtn=document.getElementById("userMsg-btn")
    let friendBtn=document.getElementById("friend-btn")
    let groupBtn=document.getElementById("group-btn")
    let chatBtn=document.getElementById("chat-btn")


    changeButtonColor(userMsgBtn);
    changeButtonColor(friendBtn);
    changeButtonColor(groupBtn);
    changeButtonColor(chatBtn);
    
}

function date_transformation(systemTime){
    const dateObject = new Date(systemTime);

    // 提取日期部分（YYYY-MM-DD 格式）
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');

    // 構建日期字符串
    const date = `${year}-${month}-${day}`;

    return date;
}

async function cancel_invitation(invitationId){
    try {
        const response = await fetch("/cancelInvitation", {
            method: "POST",
            body: JSON.stringify({
                "invitationId": invitationId
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();

        if (data.status === "success") {
            const noticeContainer = document.getElementById('noticeContainer');
            noticeContainer.innerHTML='';
            fetch_firstPage_notice();
        }else {
            alert("取消失敗")
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

function fetch_firstPage_notice(){
    let contact__loading = document.querySelector(".contact__loading");
    contact__loading.style.display="block";

    let page=0;
    noticeAppear();
    getInviteData_from_database(page,contact__loading);
}

function handlePendingConfirmation(detail, noticeContainer){
    let invitationId = detail.id;
            
    let date = date_transformation(detail.createdTime)
    let headShot = detail.friendHeadShot || "/images/head-shot-default.png";
    
    const newContactItem = document.createElement('div');
    newContactItem.classList.add('contact__container__item');
    newContactItem.innerHTML = `
        <img src="${headShot}" class="contact__container__item__img"/>
        <div>
            <div class="contact__container__notice">你邀請<span style="font-weight:700"> ${detail.friendNickname}  ( ${detail.friendName}  ) </span>成為你的夥伴</div>
            <button class="cancelInvitation">取消邀請</button>
            <div class="contact__container__time">${date}</div>
        </div>
    `;
    noticeContainer.appendChild(newContactItem);
    const cancelButton = newContactItem.querySelector('.cancelInvitation');
    cancelButton.addEventListener('click', async function () {
        await cancel_invitation(invitationId);
    });
}

function handleConfirmed(detail, noticeContainer){
    let date = date_transformation(detail.createdTime)
    let headShot = detail.friendHeadShot || "/images/head-shot-default.png";
    
    const newContactItem = document.createElement('div');
    newContactItem.classList.add('contact__container__item');
    newContactItem.innerHTML = `
        <img src="${headShot}" class="contact__container__item__img"/>
        <div>
            <div class="contact__container__notice">恭喜<span style="font-weight:700"> ${detail.friendNickname}  ( ${detail.friendName}  ) </span>已經成為你的夥伴</div>
            <div class="cancelInvitation" style="background-color: transparent;">&nbsp;</div>
            <div class="contact__container__time">${date}</div>
        </div>
    `;
    noticeContainer.appendChild(newContactItem);

    // 為新創建的按鈕元素添加點擊事件監聽器
    const cancelButton = newContactItem.querySelector('.cancelInvitation');

    // 將事件監聽器函式改成異步函式 
    cancelButton.addEventListener('click', async function () {
        // 當按鈕被點擊時，呼叫 cancel_invitation 函式，傳遞 invitationId
        await cancel_invitation(invitationId);
    });
}

function handleReceiveInvite(detail, noticeContainer){
    let invitationId = detail.id;

    let date = date_transformation(detail.createdTime)
    let headShot = detail.requesterHeadShot || "/images/head-shot-default.png";

    const newContactItem = document.createElement('div');
    newContactItem.classList.add('contact__container__item');
    newContactItem.innerHTML = `
        <img src="${headShot}" class="contact__container__item__img"/>
        <div>
            <div class="contact__container__notice"><span style="font-weight:700"> ${detail.requesterName}  ( ${detail.requesterNickname}  ) </span>發送好友邀請給你</div>
            <div class="receiveCheckBar">
                <button class="receiveCheckBar__accept">確認</button>
                <button class="receiveCheckBar__reject">現在還不要</button>
            </div>
            <div class="contact__container__time">${date}</div>
        </div>
    `;
    noticeContainer.appendChild(newContactItem);

    // 為新創建的按鈕元素添加點擊事件監聽器
    const rejectButton = newContactItem.querySelector('.receiveCheckBar__reject');
    rejectButton.addEventListener('click', async function () {
        await cancel_invitation(invitationId);
    });

    const acceptButton = newContactItem.querySelector('.receiveCheckBar__accept');
    acceptButton.addEventListener('click', async function () {
        await build_friendship(detail.requesterID,detail.friendID,invitationId);
    });
}

async function build_friendship(requesterID,friendID,invitationId){
    try {
        const response = await fetch("/buildFriendship", {
            method: "POST",
            body: JSON.stringify({
                "requesterID": requesterID,
                "friendID": friendID,
                "invitationId":invitationId
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();

        if (data.status === "success") {
            let noticeContainer = document.querySelector('.contact__container');
            noticeContainer.innerHTML='';
            fetch_firstPage_notice();
        }else {
            alert("取消失敗")
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}
