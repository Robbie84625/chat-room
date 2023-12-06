document.getElementById("friend-btn").addEventListener("click", () => {
    change_friendBtn_bg();
    friendAppear();
    let friendListLoading= document.getElementById("friendListLoading");
    friendListLoading.style.display="block";
    document.getElementById('friendList').innerHTML='';
    fetch_firstPage_friendList(friendListLoading);
});

document.getElementById('friendInput').addEventListener('input', function() {
    let friendListLoading = document.getElementById("friendListLoading");
    friendListLoading.style.display="block";
    document.getElementById('friendList').innerHTML='';
    fetch_firstPage_friendList(friendListLoading);
});

function friendAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");
    let chatContainer=document.getElementById("chatContainer");

    friendPage.style.display="block";
    groupContainer.style.display="none";
    noticePage.style.display="none";
    chatContainer.style.display="none";
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
        noFriend.style.display = data['data'].length < 1 && data['nextPage']===null ? 'block' : 'none';
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
    friendItemDiv.onlineStatus = detail.onlineStatus;
    friendItemDiv.innerHTML=
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
    
    friendItemDiv.setAttribute('data-friend-id', `f_${detail.friendId}`);
    friendItemDiv.setAttribute('data-online-status', detail.onlineStatus);

    friendItemDiv.addEventListener('click', function() {
        document.getElementById('friendChatRoom').style.display='block';
        document.getElementById('groupChatRoom').style.display='none';
        let onlineStatus = friendItemDiv.getAttribute('data-online-status');
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
        document.getElementById('messageInput').value = '';
        fetch_firstPage_personalMessage();
        //根據雙方id生成room
        let roomId = generateRoomId(requesterID, recipientID);
        room_manager.roomId=roomId;
        room_manager.data=detail;
        socket.emit('joinRoom', roomId);
    });
}

socket.on('userOnline', (data) => {
    let friendId = data.memberId;

    let friendItemDiv = document.querySelector(`[data-friend-id="f_${friendId}"]`);
    if (friendItemDiv) {
        // 更新 friendItemDiv 的 data-online-status 屬性
        friendItemDiv.setAttribute('data-online-status', 'online');
        
        document.getElementById('onlineStatusEmoji').textContent = '😀';
        document.getElementById('onlineStatus').style.backgroundColor = 'green';

    }
});

socket.on('userOffline', (data) => {
    let friendId = data.memberId;

    let friendItemDiv = document.querySelector(`[data-friend-id="f_${friendId}"]`);
    if (friendItemDiv) {
        friendItemDiv.setAttribute('data-online-status', 'offline');
        
        document.getElementById('onlineStatusEmoji').textContent = '😴';
        document.getElementById('onlineStatus').style.backgroundColor = 'gray';

    }
});
chooseFile_to_friend();

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
    let contentType='text';
    let data = {
        contentType:contentType,
        requesterID: requesterID,
        recipientID: recipientID,
        requesterNickName: requesterNickName,
        friendNickName: friendNickName,
        message: message
    };
    
    socket.emit('sendMessage', data, roomId);
    const memberReceiveId = `m${recipientID}`;
    socket.emit('getMessage', data, memberReceiveId);
};

socket.on('receiveMessage', (data) => {
    appendMessageToBox(data);
});

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
    if (user_info.user_id === messageData.requesterID) {
        messageScroll();
    }
}

function chooseFile_to_friend(){
    let toFriendFile;
    document.getElementById('sendFileToFriend').addEventListener('click', function(){
        document.getElementById('uploadToFriendInput').value = '';
        document.getElementById('uploadToFriendInput').click();
        socket.emit('updateReadStatus', { roomId: room_manager.roomId, friendId: user_info.friend_id ,userId:user_info.user_id});
    });
    
    document.getElementById("uploadToFriendInput").addEventListener("change", async function() {
        if (!this.files || this.files.length === 0) {
            return;
        }

        const file = this.files[0];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4'];
        const maxFileSize = 100 * 1024 * 1024; // 100MB的限制

        if (!validTypes.includes(file.type)) {
            alert('請選擇有效的圖片或影片檔案（jpg, jpeg, png, gif, mp4）。');
            return;
        }

        if (file.size > maxFileSize) {
            alert('本檔案超出容量上限，請勿上傳。');
            return;
        }
        document.getElementById('uploadFileLoading').style.display='flex';
        toFriendFile = this.files[0];
        let requesterID=room_manager.data.requesterID;
        let recipientID= room_manager.data.friendId;
        let requesterNickName=room_manager.data.requesterNickName;
        let friendNickName=room_manager.data.friendNickName;
        let roomId=room_manager.roomId;
        const formData = new FormData();
        formData.append('file', toFriendFile);
        fileData = await uploadFile_to_friend(formData);
        fileDataUrl = fileData.url;
        fileType = fileData.fileType.split('/')[0];
        sendFile_to_friend(requesterID, recipientID, requesterNickName, friendNickName, fileDataUrl,fileType, roomId);
    });
}

async function uploadFile_to_friend(formData){
    
    let token=localStorage.getItem('token');
    
    const response = await fetch('/uploadToFriend', {
        method: "POST",
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    data=await response.json();
    return data['updateParams'];
    
}

function sendFile_to_friend(requesterID, recipientID, requesterNickName, friendNickName, fileDataUrl,fileType, roomId){
    let contentType=fileType;
    let data = {
        contentType:contentType,
        requesterID: requesterID,
        recipientID: recipientID,
        requesterNickName: requesterNickName,
        friendNickName: friendNickName,
        message:fileDataUrl
    };
    
    socket.emit('sendFile', data, roomId);
};

socket.on('receiveFile', (data) => {
    appendFileToBox(data);
});

function appendFileToBox(messageData) {
    const messageBox = document.getElementById('messageBox');

    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');

    const date = new Date();
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = date.toLocaleTimeString('zh-CN', options);

    let fileHtml;

    if (messageData.contentType === 'image') {
        fileHtml = `<img src="${messageData.message}" class="messageBox__item__file" alt="Image">`;
    } else if (messageData.contentType === 'video') {
        fileHtml = `<video src="${messageData.message}" class="messageBox__item__file" controls></video>`;
    }

    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${messageData.requesterNickName} :</div>
        ${fileHtml}
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

    messageBox.appendChild(messageItem);

    document.getElementById('uploadFileLoading').style.display='none';

    if (user_info.user_id === messageData.requesterID) {
        messageScroll();
    }
}

function generateRoomId(requesterID, recipientID) {
    return  `p${[requesterID, recipientID].sort().join('_')}`;
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
    let htmlContent;
    if (message.contentType === 'image') {
        htmlContent = `<img src="${message.content}" class="messageBox__item__file" alt="Image">`;
    } else if (message.contentType === 'video') {
        htmlContent = `<video src="${message.content}" class="messageBox__item__file" controls></video>`;
    }
    else{
        htmlContent =`<div class="messageBox__item__content">${message.content}</div>`;
    }
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
        ${htmlContent}
        <div class="messageBox__item__dateAndRead">
            <div>${readStatus}</div>
            <div>${dateTime}</div>
        </div>
    `;
    const messageContent = messageItem.querySelector('.messageBox__item__content');
    if(messageContent){
        messageContent.style.backgroundColor = user_info.user_nickName !== message.requesterNickName ? '#ccffcc' : '#E0F7FA';
    }

    if (messageBox.firstChild) {
        messageBox.insertBefore(messageItem, messageBox.firstChild);
    } else {
        messageBox.appendChild(messageItem); 
    }
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

document.addEventListener('click', function(event) {
    let emojiBox = document.querySelector('.emojiBox');
    let personalEmoji = document.getElementById('personalEmoji');

    if (!emojiBox.contains(event.target) && !personalEmoji.contains(event.target)) {
        emojiBox.style.display = 'none';
    }
});

document.getElementById('personalEmoji').addEventListener('click', function(event) {
    let emojiBox = document.querySelector('.emojiBox');
    if (emojiBox.style.display === 'flex') {
        emojiBox.style.display = 'none';
    } else {
        emojiBox.style.display = 'flex';
    }

    event.stopPropagation();
});