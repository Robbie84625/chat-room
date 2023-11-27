document.getElementById("friend-btn").addEventListener("click", () => {
    change_friendBtn_bg();
    friendAppear();
    let friendListLoading= document.getElementById("friendListLoading");
    friendListLoading.style.display="block";
    document.getElementById('friendList').innerHTML='';
    fetch_firstPage_friendList(friendListLoading);
});

document.getElementById('friendInput').addEventListener('input', function(event) {
    let friendListLoading = document.getElementById("friendListLoading");
    friendListLoading.style.display="block";
    document.getElementById('friendList').innerHTML='';
    fetch_firstPage_friendList(friendListLoading);
});

function friendAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");

    friendPage.style.display="block";
    groupContainer.style.display="none";
    noticePage.style.display="none";
}

let friendListStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};

function fetch_firstPage_friendList(friendListLoading){
    friendListStatus.page=0;
    page = friendListStatus.page;
    friendListStatus.lastPage=false;
    friendListLoading.style.display="black";
    friendAppear();
    getFriendList_from_database(page,friendListLoading);
}

let user_info={
    "user_id":0,
    "friend_id":0,
    "user_nickName":''
}

async function getFriendList_from_database(page,friendListLoading = null){
    if (friendListLoading) {
        friendListLoading.style.display = "block";
    }

    if (friendListStatus.isLoading|| friendListStatus.lastPage || !localStorage.getItem('token')) {
        return ;
    }
    let friendInput = document.getElementById("friendInput").value;
    friendListStatus.isLoading = true;
    let noFriend=document.getElementById('noFriend');
    noFriend.style.display='none';
    try {
        const response = await fetch(`/getFriendData?page=${page}&keyword=${friendInput}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        noFriend.style.display = data['data'].length < 1 && data['nextPage']!==null ? 'block' : 'none';
        friendListStatus.isLoading = false;
        if (friendListLoading) {
            friendListLoading.style.display = "none";
        }
        if (data.nextPage !== null) {
            friendListStatus.page = data.nextPage;
        } else {
            friendListStatus.lastPage = true; 
        }
        for(let detail of data['data']){
            createFriendData(detail)
        }
    } catch (error) {
        console.error("Error during login:", error);
        friendListStatus.isLoading = false;
    }
}
let room_manager={
    "roomId":"",
    "data":{}
}
function createFriendData(detail){
    let friendItemDiv = document.createElement('div');
    friendItemDiv.className = 'friendList__item';

    friendItemDiv.innerHTML = 
        `<img class="friendList__item__headShot" id="friendHeadShot"/>
        <div>
            <div class="friendList__item__Nickname" id="friendNickname"></div>
            <div class="friendList__item__moodText" id="friendMoodText"></div>
        </div>`;
    let friendNickname = friendItemDiv.querySelector('.friendList__item__Nickname');
    let friendMoodText = friendItemDiv.querySelector('.friendList__item__moodText');
    let friendHeadShot = friendItemDiv.querySelector('.friendList__item__headShot');
    
    friendNickname.textContent = detail.friendNickName;
    friendMoodText.textContent = detail.moodText || '心情小語';
    let headShot = detail.headshot || "/images/head-shot-default.png";
    friendHeadShot.src = headShot;

    let friendListDiv = document.getElementById('friendList');
    friendListDiv.appendChild(friendItemDiv);

    friendItemDiv.addEventListener('click', function() {
        document.getElementById('friendChartRoom').style.display='block';
        let onlineStatus=detail.onlineStatus;
        let emailPrefix=detail.email.split('@')[0];
        let friendNickName=detail.friendNickName;
        let moodText=detail.moodText || '心情小語';
        let headShot=detail.headshot|| "/images/head-shot-default.png";
        
        show_friendDetails(friendNickName,emailPrefix,moodText,headShot,onlineStatus);
        let requesterID = detail.requesterID;
        let recipientID = detail.friendId;
        
        user_info.user_id=requesterID;
        user_info.friend_id=recipientID;
        user_info.user_nickName=detail.requesterNickName;
        document.getElementById('messageBox').innerHTML='';
        fetch_firstPage_personalMessage();
        //根據雙方id生成room
        let roomId = generateRoomId(requesterID, recipientID);
        room_manager.roomId=roomId;
        room_manager.data=detail;
        socket.emit('joinRoom', roomId);
    });
}
document.getElementById('sendMessage-btn').addEventListener('click', function(){
    let requesterID=room_manager.data.requesterID;
    let recipientID= room_manager.data.friendId;
    let requesterNickName=room_manager.data.requesterNickName;
    let friendNickName=room_manager.data.friendNickName;
    let roomId=room_manager.roomId;
    let message = document.getElementById('messageInput').value;
    if (message !== '') { 
        sendMessage_to_friend(requesterID, recipientID, requesterNickName, friendNickName, message, roomId);
        document.getElementById('messageInput').value = '';
    }
    socket.emit('updateReadStatus', { roomId: room_manager.roomId, friendId: user_info.friend_id ,userId:user_info.user_id});
});


let messageBoxStatus={enterCount:0};

document.getElementById('messageInput').addEventListener('keydown', (event) => {

    if (event.key === 'Enter') {
        messageBoxStatus.enterCount++;
    
        // 如果按了兩次Enter，模擬點擊發送按鈕
        if (messageBoxStatus.enterCount=== 2) {
            let requesterID=room_manager.data.requesterID;
            let recipientID= room_manager.data.friendId;
            let requesterNickName=room_manager.data.requesterNickName;
            let friendNickName=room_manager.data.friendNickName;
            let roomId=room_manager.roomId;
            let message = document.getElementById('messageInput').value;
            if (message !== '') { 
                sendMessage_to_friend(requesterID, recipientID, requesterNickName, friendNickName, message, roomId);
                document.getElementById('messageInput').value = '';
            }
            socket.emit('updateReadStatus', { roomId: room_manager.roomId, friendId: user_info.friend_id ,userId:user_info.user_id});
            
            messageBoxStatus.enterCount = 0;
        }
    } else {
        messageBoxStatus.enterCount = 0;
    }
});

function change_friendBtn_bg(){
    let friendBtn = document.getElementById("friend-btn")
    friendBtn.style.backgroundColor = "#9370db";

    let userInfoBtn=document.getElementById("userInfo-btn")
    let noticeBtn=document.getElementById("notice-btn")
    let groupBtn=document.getElementById("group-btn")
    let chatBtn=document.getElementById("chat-btn")


    changeButtonColor(userInfoBtn);
    changeButtonColor(noticeBtn);
    changeButtonColor(groupBtn);
    changeButtonColor(chatBtn);
    
}
let friendListLoading = document.getElementById("friendListLoading");
fetch_firstPage_friendList(friendListLoading);

const friendListDiv = document.getElementById('friendList');
friendListDiv.addEventListener('scroll', async function() {
    if (friendListDiv.scrollTop + friendListDiv.clientHeight >= friendListDiv.scrollHeight) {
        await getFriendList_from_database(friendListStatus.page, null);
    }
}); 

function show_friendDetails(friendNickName,emailPrefix,moodText,headShot,onlineStatus){
    document.getElementById('receiverNickName').textContent=document.getElementById('receiver_nickName').textContent=friendNickName
    document.getElementById('receiverEmailPrefix').textContent=emailPrefix
    document.getElementById('receiverMoodText').textContent=moodText;
    document.getElementById('headShot').src=headShot;
    document.getElementById('onlineStatusEmoji').textContent=(onlineStatus === 'online') ? '😀' : '😴';
    document.getElementById('onlineStatus').style.backgroundColor = (onlineStatus === 'online') ? 'green' : 'gray';
}

function sendMessage_to_friend(requesterID,recipientID,requesterNickName,friendNickName,message,roomId){
    
    let data = {
        requesterID: requesterID,
        recipientID: recipientID,
        requesterNickName: requesterNickName,
        friendNickName: friendNickName,
        message: message
    };
    
    socket.emit('sendMessage', data, roomId);
};
socket.on('receiveMessage', (data) => {
    appendMessageToBox(data);
});

function generateRoomId(requesterID, recipientID) {
    return  `p${[requesterID, recipientID].sort().join('_')}`;
}

function appendMessageToBox(messageData) {
    const messageBox = document.getElementById('messageBox');

    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');

    const date = new Date();
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = date.toLocaleTimeString('zh-CN', options);

    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${messageData.requesterNickName} :</div>
        <div class="messageBox__item__content">${messageData.message}</div>
        <div class="messageBox__item__dateAndRead">
            <div class="read-status"></div>
            <div>${timeString}</div>
        </div>
    `;

    const readStatusElement = messageItem.querySelector(".read-status");

    if (messageData.requesterID === user_info.user_id) {
        readStatusElement.style.display = 'block';
        readStatusElement.textContent = '未讀';
    } else {
        readStatusElement.style.display = 'none';
    }

    const messageContent = messageItem.querySelector('.messageBox__item__content');

    if (user_info.user_id !== messageData.requesterID) {
        messageContent.style.backgroundColor = '#ccffcc';
    } else {
        messageContent.style.backgroundColor = '#E0F7FA';
    }

    messageBox.appendChild(messageItem);

    messageBox.addEventListener('scroll', function () {
        if (messageBox.scrollTop + messageBox.clientHeight >= messageBox.scrollHeight) {
            messageScroll();
        }
    });
}

let messageStatus={
    page: 1,
    lastPage: false,
    isLoading:false
}

async function getPersonalMessage__from__database(requesterID,recipientID,page){
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let userId_data = {
        requesterID: requesterID,
        recipientID: recipientID,
        timezone:timezone
    }; 
    if (messageStatus.lastPage || !localStorage.getItem('token')||messageStatus.isLoading===true) {
        return ;
    }
    messageStatus.isLoading=true;
    const response = await fetch(`/getPersonalMessage?page=${page}`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userId_data)
    });
    let result = await response.json();
    messageStatus.isLoading = false;
    for(let message of result.data){
        
        loadHistoryMsgToBox(message)
    }
    if (result.nextPage !== null) {
        messageStatus.page = result.nextPage;
    } else {
        messageStatus.lastPage = true;
    }
}
function fetch_firstPage_personalMessage(){
    messageStatus.page=0;
    page =  messageStatus.page;
    messageStatus.lastPage=false;
    
    requesterID=user_info.user_id;
    recipientID=user_info.friend_id;
    getPersonalMessage__from__database(requesterID,recipientID,page);

}

let messageBox = document.getElementById('messageBox');
function messageScroll() {
    let messageBox = document.getElementById('messageBox');
    messageBox.scrollTop = messageBox.scrollHeight;
}

function loadHistoryMsgToBox(message) {
    const messageBox = document.getElementById('messageBox');
    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');
    
    let readStatus = '';
    if (user_info.user_nickName === message.requesterNickName) {
        readStatus = message.readStatus === 0 ? '未讀' : '已讀';
    } else {
        readStatus = ' ';
    }
    dateTime=toTaiwanTime(message.dateTime);
    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${message.requesterNickName} :</div>
        <div class="messageBox__item__content">${message.content}</div>
        <div class="messageBox__item__dateAndRead">
            <div>${readStatus}</div>
            <div>${dateTime}</div>
        </div>
    `;
    const messageContent = messageItem.querySelector('.messageBox__item__content');
    
    messageContent.style.backgroundColor = user_info.user_nickName !== message.requesterNickName ? '#ccffcc' : '#E0F7FA';

    if (messageBox.firstChild) {
        messageBox.insertBefore(messageItem, messageBox.firstChild);
    } else {
        messageBox.appendChild(messageItem); 
    }
    messageBox.addEventListener('scroll', function () {
        if (messageBox.scrollTop + messageBox.clientHeight >= messageBox.scrollHeight) {
            messageScroll();
        }
    });
}

function toTaiwanTime(dateTime) {
    let utcDate = new Date(dateTime);
    let taiwanTime = new Intl.DateTimeFormat('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Taipei'
    }).format(utcDate);

    return taiwanTime;
}


// 監聽訊息欄位滾動事件
messageBox.addEventListener('scroll', function () {
    if (messageBox.scrollTop === 0) {
        let page=messageStatus.page
        let requesterID=user_info.user_id;
        let recipientID=user_info.friend_id;
        getPersonalMessage__from__database(requesterID,recipientID,page);
    }
});


socket.on('readStatusUpdated', (roomId) => {
    if (room_manager.roomId === roomId) {
        const unreadMessages = document.querySelectorAll('.read-status');
        
        unreadMessages.forEach(msg => {
            msg.textContent = '已讀';
        });
    }
});