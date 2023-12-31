document.getElementById("notice-btn").addEventListener("click", () => {
    change_noticeBtn_bg();
    document.getElementById('noticeContainer').innerHTML='';
    let contact__loading = document.getElementById("noticeLoading");
    contact__loading.style.display="block";
    fetch_firstPage_notice(contact__loading);
});

function noticeAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");
    let chatContainer=document.getElementById("chatContainer");

    friendPage.style.display="none";
    groupContainer.style.display="none";
    noticePage.style.display="block";
    chatContainer.style.display="none";
}

async function getInviteData_from_database(noticePageStatus,contact__loading = null){
    let noInvite=document.getElementById('noInvite');
    noInvite.style.display='none';

    if (contact__loading) {
        contact__loading.style.display = "block";
    }

    if (noticePageStatus.isLoading|| noticePageStatus.lastPage || !localStorage.getItem('token')) {
        return ;
    }
    noticePageStatus.isLoading = true;
    try {
        const response = await fetch(`/getInviteData?page=${noticePageStatus.page}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();

        noticePageStatus.isLoading = false;

        if (contact__loading) {
            contact__loading.style.display = "none";
        }
        
        const { sendInvite, receiveInvite } = data['data'];
        if (sendInvite) {
            createSendInvite(sendInvite);
            noInvite.style.display = 'none';
        }
        if (receiveInvite) {
            createReceiveInvite(receiveInvite);
            noInvite.style.display = 'none';
        }
        if (data.nextPage !== null) {
            noticePageStatus.page = data.nextPage;
        } else {
            noticePageStatus.lastPage = true;
        }
        if ((sendInvite && sendInvite.length < 1) && 
            (receiveInvite && receiveInvite.length < 1) && 
            noticePageStatus.lastPage === true) {
            noInvite.style.display = 'block';
        } else if (receiveInvite && !receiveInvite.some(item => item.invitationStatus === "PendingConfirmation")) {
            noInvite.style.display = 'block';
        }
    } catch (error) {
        console.error("Error during login:", error);
        noticePageStatus.isLoading = false;
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

    let userInfoBtn=document.getElementById("userInfo-btn")
    let friendBtn=document.getElementById("friend-btn")
    let groupBtn=document.getElementById("group-btn")
    let chatBtn=document.getElementById("chat-btn")


    changeButtonColor(userInfoBtn);
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

let noticePageStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};

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
            fetch_firstPage_notice(contact__loading);
        }else {
            alert("取消失敗")
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

function fetch_firstPage_notice(contact__loading){
    noticePageStatus.page=0;
    noticePageStatus.lastPage=false;
    
    noticeAppear();
    getInviteData_from_database(noticePageStatus,contact__loading);
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
            let noticeContainer = document.getElementById('noticeContainer')
            noticeContainer.innerHTML='';
            fetch_firstPage_notice();
        }else {
            alert("取消失敗")
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

const noticePageDiv = document.getElementById('noticeContainer');

noticePageDiv.addEventListener('scroll', async function() {
    if (noticePageDiv.scrollTop + noticePageDiv.clientHeight >= noticePageDiv.scrollHeight) {
        await getInviteData_from_database(noticePageStatus, null);
    }
}); 


