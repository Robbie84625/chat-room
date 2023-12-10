document.getElementById("group-btn").addEventListener("click", () => {
    change_groupBtn_bg();
    groupListAppear();
    let groupListLoading= document.getElementById("groupListLoading");
    groupListLoading.style.display="block";
    document.getElementById('groupList').innerHTML='';
    fetch_firstPage_groupList(groupListLoading)
});

function change_groupBtn_bg(){
    let groupBtn = document.getElementById("group-btn")
    groupBtn .style.backgroundColor = "#9370db";

    let userInfoBtn=document.getElementById("userInfo-btn")
    let noticeBtn=document.getElementById("notice-btn")
    let friendBtn=document.getElementById("friend-btn")
    let chatBtn=document.getElementById("chat-btn")


    changeButtonColor(userInfoBtn);
    changeButtonColor(noticeBtn);
    changeButtonColor(friendBtn);
    changeButtonColor(chatBtn);
    
}

function groupListAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");
    let chatContainer=document.getElementById("chatContainer");

    friendPage.style.display="none";
    groupContainer.style.display="block";
    noticePage.style.display="none";
    chatContainer.style.display="none";
}

let groupListStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};

let groupListLoading = document.getElementById("groupListLoading");

async function fetch_firstPage_groupList(groupListLoading){
    groupListStatus.page=0;
    page = groupListStatus.page;
    groupListStatus.lastPage=false;
    groupListLoading.style.display="black";
    getGroupList_from_database(page,groupListLoading);
}

async function getGroupList_from_database(page,groupListLoading = null){
    if (groupListLoading) {
        groupListLoading.style.display = "block";
    }

    if ( groupListStatus.isLoading||  groupListStatus.lastPage || !localStorage.getItem('token')) {
        return ;
    }
    let groupInput = document.getElementById("groupInput").value;
    groupListStatus.isLoading = true;
    try {
        const response = await fetch(`/getGroupData?page=${page}&keyword=${groupInput}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        groupListStatus.isLoading = false;
        if (groupListLoading) {
            groupListLoading.style.display = "none";
        }
        if (data.nextPage !== null) {
            groupListStatus.page = data.nextPage;
        } else {
            groupListStatus.lastPage = true; 
        }
        user_info.nickName=data.userInfo.userNickName;
        user_info.memberId=data.userInfo.userId;
        for(let detail of data['data']){
            createGroupData(detail);
        }
    } catch (error) {
        console.error("Error during login:", error);
        friendListStatus.isLoading = false;
    }
}

let groupRoom_manager={
    "groupRoomId":"",
    "data":{},
    "groupMember":[]
}

function createGroupData(detail){
    let groupItemDiv = document.createElement('div');
    groupItemDiv.className = 'groupList__item';

    groupItemDiv.innerHTML = 
        `
        <div class="groupList__item__avatarContainer">
            <img class="groupList__item__avatar"/>
        </div>
        <div class="groupList__item__name"></div>
        `;
    let groupName = groupItemDiv.querySelector('.groupList__item__name');
    let groupAvatar = groupItemDiv.querySelector('.groupList__item__avatar');
    
    groupName.textContent = detail.guildName;
    groupAvatar.src = detail.guildAvatar || "/images/group.png";

    let groupListDiv = document.getElementById('groupList');
    groupListDiv.appendChild(groupItemDiv);

    groupItemDiv.addEventListener('click',async function() {
        document.getElementById("firstPage").style.display='none';
        document.getElementById('friendChatRoom').style.display='none';
        document.getElementById('groupChatRoom').style.display='block';
        document.getElementById('groupName').textContent=detail.guildName;
        document.getElementById('groupAvatar').src= detail.guildAvatar || "/images/group.png";
        document.getElementById('groupMessageBox').innerHTML='';
        document.getElementById('groupMessageInput').value='';
        groupMember=await get_groupMember(detail.guildID);
        fetch_firstPage_groupMessage(detail.guildID,user_info.memberId);
        //根據群組id來生成Room id
        let groupRoomId = `g${detail.guildID}`;
        groupRoom_manager.groupRoomId=groupRoomId;
        groupRoom_manager.data=detail;
        groupRoom_manager.groupMember=groupMember;
        socket.emit('joinGroupRoom', groupRoomId);
    });
    
}
chooseFile_to_group();

async function get_groupMember(guildID){
    const response = await fetch('/getGroupMember', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            guildID: guildID,
        })
    });
    const data = await response.json();
    return data['groupMemberData'];
}

document.getElementById('sendGroupMessage-btn').addEventListener('click', function(){
    let userNickName=user_info.nickName;
    let guildID=groupRoom_manager.data.guildID;
    let userId=user_info.memberId;
    let groupRoomId=groupRoom_manager.groupRoomId;
    let message = document.getElementById('groupMessageInput').value.trim();
    let groupMemberIDs=groupRoom_manager.groupMember.map(member => member.memberID);
    if (message !== '') { 
        sendMessage_to_group(guildID,userId,userNickName, message,groupRoomId,groupMemberIDs);
        document.getElementById('groupMessageInput').value = '';
    }
    socket.emit('updateGroupReadStatus', { roomId: groupRoomId, guildID: guildID ,userId:userId});
});

function sendMessage_to_group(guildID,userId,userNickName, message,groupRoomId,groupMemberIDs){
    let contentType='text';
    let data = {
        contentType:contentType,
        guildID:guildID,
        groupMember:groupMemberIDs,
        userId:userId,
        userNickName:userNickName,
        message:message,
        groupRoomId:groupRoomId
    };
    
    let socketData = {
        contentType:contentType,
        requesterID: userId,
        guildID:guildID,
        groupMember:groupRoom_manager.groupMember,
        requesterNickName: userNickName,
        guildName: groupRoom_manager.data.guildName,
        guildAvatar:groupRoom_manager.data.guildAvatar,
        message: message,
        groupRoomId:groupRoomId
    };
    socket.emit('sendGroupMessage', data, groupRoomId);
    for(let member of groupRoom_manager.groupMember){
        const memberReceiveId = `m${member.memberID}`;
        if(memberReceiveId !==`m${userId}`){
            socket.emit('sendMessageToGroup', socketData, memberReceiveId);
        }
    }
    updateGroupChatList(socketData);
};

function updateGroupChatList(socketData){
    let noChat=document.getElementById('noChat');
    noChat.style.display='none';
    let groupDivId = `g_${socketData.guildID}`;
    let chatListDiv = document.getElementById('chatList');
    let existingDiv = chatListDiv.querySelector(`div[data-group-id="${groupDivId}"]`);
    if (existingDiv) {
        chatListDiv.removeChild(existingDiv);
    }
    sendNewGroupChatData(socketData);
}

function sendNewGroupChatData(socketData){
    let chatItemDiv = document.createElement('div');
    chatItemDiv.className = 'chatList__item';
    
    chatItemDiv.innerHTML=
        `<img class="chatList__item__avatar"/>
        <div style='margin:auto 0px;'>
            <div class="chatList__item__name"></div>
            <div class="chatList__item__message"></div>
        </div>`;
    let name = chatItemDiv.querySelector('.chatList__item__name');
    let message = chatItemDiv.querySelector('.chatList__item__message');
    let avatar = chatItemDiv.querySelector('.chatList__item__avatar');
    
    name.textContent = socketData.guildName;
    let Avatar;
    Avatar = socketData.guildAvatar||"/images/group.png";

    avatar.src = Avatar;
    if (socketData.contentType === 'text') {
        message.textContent = `你:${socketData.message}`;
    } else if (socketData.contentType === 'image') {
        message.textContent = '你:發送一個圖片';
    } else if (socketData.contentType=== 'video') {
        message.textContent = '你:發送一個影片';
    }

    let chatListDiv = document.getElementById('chatList');
    let guildID = socketData.guildID;
    
    chatItemDiv.setAttribute('data-group-id',`g_${guildID}`);
    
    if (chatListDiv.firstChild) {
        chatListDiv.insertBefore(chatItemDiv, chatListDiv.firstChild);
    } else {
        chatListDiv.appendChild(chatItemDiv);
    }
    
    let emailIcon;
    if (socketData.groupRoomId!==groupRoom_manager.groupRoomId) {
        emailIcon = document.createElement('div');
        emailIcon.className = "chatList__item__emailIcon";
        chatItemDiv.appendChild(emailIcon); 
        message.style.color='black';
    }

    socket.emit('joinRoom', socketData.groupRoomId);
}

document.getElementById('groupMessageInput').addEventListener('keydown', (event) => {
    let userNickName=user_info.nickName;
    let guildID=groupRoom_manager.data.guildID;
    let userId=user_info.memberId;
    let groupRoomId=groupRoom_manager.groupRoomId;
    let message = document.getElementById('groupMessageInput').value.trim();
    let groupMemberIDs=groupRoom_manager.groupMember.map(member => member.memberID);
    if (event.key === 'Enter') {
        messageBoxStatus.enterCount++;
        // 如果按了兩次Enter，模擬點擊發送按鈕
        if (messageBoxStatus.enterCount=== 2) {
            if (message !== '') { 
                sendMessage_to_group(guildID,userId,userNickName, message,groupRoomId,groupMemberIDs);
                document.getElementById('groupMessageInput').value = '';
            }
            else{
                messageBoxStatus.enterCount = 0;
                document.getElementById('groupMessageInput').value = '';
            }
        }
    } else {
        messageBoxStatus.enterCount = 0;
    }
    socket.emit('updateGroupReadStatus', { roomId: groupRoomId, guildID: guildID ,userId:userId});
});

let groupRingStatus = {
    isRing:false
}
document.getElementById('groupDoorbell').addEventListener('click', function(){
    let data={
        groupRoomId:groupRoom_manager.groupRoomId,
        guildID:groupRoom_manager.data.guildID,
        guildName:groupRoom_manager.data.guildName,
        guildAvatar:groupRoom_manager.data.guildAvatar,
        groupMember:groupRoom_manager.groupMember,
        message: '叮咚!有人在家嗎 ? '
    }
    if (! groupRingStatus.isRing) {
        socket.emit('ringGroup', data, data.groupRoomId);
        groupRingStatus.isRing = true;

        for(let member of groupRoom_manager.groupMember){
            const memberReceiveId = `m${member.memberID}`;
            if(memberReceiveId !==`m${user_info.memberId}`){
                socket.emit('ring_group', data, memberReceiveId);
            }
        }

        setTimeout(function() {
            ringStatus.isRing = false;
        }, 300000);

    } else {
        alert('你壞壞!請稍後再試！');
    }
});

socket.on('receive_ring_group', (data) => {
    if(groupRoom_manager.groupRoomId!==data.groupRoomId){
        const doorbellNotice = document.querySelector('.doorbellNotice');
        doorbellNotice.style.display = 'none';
        doorbellNotice.innerHTML=`叮咚 !  <span style="color: blue;">${data.guildName}</span>  有人在家嗎 ? `;
        
        setTimeout(() => {
            doorbellNotice.style.display = 'block';

            setTimeout(() => {
                doorbellNotice.style.display = 'none';
            }, 5000); 
        }, 10); 

        doorbellNotice.addEventListener('click',async function() {
            doorbellNotice.style.display='none';
            document.getElementById("firstPage").style.display='none';

            document.getElementById('friendChatRoom').style.display = 'none';
            document.getElementById('groupChatRoom').style.display = 'block';

            document.getElementById('groupName').textContent = data.guildName;
            document.getElementById('groupAvatar').src= data.guildAvatar || "/images/group.png";
            document.getElementById('groupMessageBox').innerHTML='';
            document.getElementById('groupMessageInput').value='';

            fetch_firstPage_groupMessage(data.guildID,user_info.memberId);
            let groupRoomId =data.groupRoomId;
            groupRoom_manager.groupRoomId=groupRoomId;
            groupRoom_manager.data=data;
            groupRoom_manager.groupMember = data.groupMember;
            socket.emit('joinGroupRoom', groupRoomId);
        });
    }
});

socket.on('receiveGroupRing', (data) => {
    let audio = new Audio('music/doorbell.mp3');
    audio.play()
    appendGroupNoticeToBox(data);
});

function appendGroupNoticeToBox(messageData) {
    const messageBox = document.getElementById('groupMessageBox');

    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');

    messageItem.innerHTML = `
        <div class="messageBox__item__ringNotice">${messageData.message}</div>
    `;
    messageBox.appendChild(messageItem);
}

socket.on('receiveGroupMessage', (data) => {
    appendGroupMessageToBox(data);
    document.getElementById('groupMessageInput').value = '';
});

function appendGroupMessageToBox(messageData) {
    const messageBox = document.getElementById('groupMessageBox');

    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');

    const date = new Date();
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = date.toLocaleTimeString('zh-CN', options);

    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${messageData.userNickName} :</div>
        <div class="messageBox__item__content">${messageData.message}</div>
        <div class="messageBox__item__dateAndRead">
            <div>${timeString}</div>
        </div>
    `;

    const messageContent = messageItem.querySelector('.messageBox__item__content');

    if (user_info.memberId!== messageData.userId) {
        messageContent.style.backgroundColor = '#ccffcc';
    } else {
        messageContent.style.backgroundColor = '#E0F7FA';
    }

    messageBox.appendChild(messageItem);
    if (user_info.memberId === messageData.userId) {
        groupMessageScroll(messageBox);
    }
}

function groupMessageScroll(messageBox){
    messageBox.scrollTop = messageBox.scrollHeight;
}

function chooseFile_to_group(){
    let toGroupFile;
    document.getElementById('sendFileToGroup').addEventListener('click', function(){
        document.getElementById('uploadToGroupInput').value = '';
        document.getElementById('uploadToGroupInput').click();
        socket.emit('updateGroupReadStatus', { roomId: groupRoom_manager.groupRoomId, guildID: groupRoom_manager.data.guildID ,userId:user_info.memberId});
    });
    
    document.getElementById("uploadToGroupInput").addEventListener("change", async function() {
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
        document.getElementById('uploadGroupFileLoading').style.display='flex';
        toGroupFile = this.files[0];
        let userNickName=user_info.nickName;
        let guildID=groupRoom_manager.data.guildID;
        let userId=user_info.memberId;
        let groupRoomId=groupRoom_manager.groupRoomId;
        let groupMemberIDs=groupRoom_manager.groupMember.map(member => member.memberID);
        const formData = new FormData();
        formData.append('file', toGroupFile);
        fileData = await uploadFile_to_group(formData);
        fileDataUrl = fileData.url;
        fileType = fileData.fileType.split('/')[0];
        sendFile_to_group(guildID,userId,userNickName,fileDataUrl,fileType,groupRoomId,groupMemberIDs);
    });
}

async function uploadFile_to_group(formData){
    
    let token=localStorage.getItem('token');
    
    const response = await fetch('/uploadToGroup', {
        method: "POST",
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    data=await response.json();
    return data['updateParams'];
    
}

function sendFile_to_group(guildID,userId,userNickName,fileDataUrl,fileType,groupRoomId,groupMemberIDs){
    let contentType=fileType;
    let data = {
        contentType:contentType,
        guildID:guildID,
        groupMember:groupMemberIDs,
        userId:userId,
        userNickName:userNickName,
        message:fileDataUrl,
        groupRoomId:groupRoomId
    };
    
    let socketData = {
        contentType:contentType,
        requesterID: userId,
        guildID:guildID,
        groupMember:groupRoom_manager.groupMember,
        requesterNickName: userNickName,
        guildName: groupRoom_manager.data.guildName,
        guildAvatar:groupRoom_manager.data.guildAvatar,
        message: fileDataUrl,
        groupRoomId:groupRoomId
    };
    socket.emit('sendGroupFile', data, groupRoomId);
    for(let member of groupRoom_manager.groupMember){
        const memberReceiveId = `m${member.memberID}`;
        if(memberReceiveId !==`m${userId}`){
            socket.emit('sendMessageToGroup', socketData, memberReceiveId);
        }
    }
    updateGroupChatList(socketData);
};

socket.on('receiveGroupFile', (data) => {
    appendGroupFileToBox(data);
});

function appendGroupFileToBox(messageData) {
    const messageBox = document.getElementById('groupMessageBox');

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
        <div class="messageBox__item__nickName">${messageData.userNickName} :</div>
        ${fileHtml}
        <div class="messageBox__item__dateAndRead">
            <div class="read-status"></div>
            <div>${timeString}</div>
        </div>
    `;

    messageBox.appendChild(messageItem);

    document.getElementById('uploadGroupFileLoading').style.display='none';

    if (user_info.memberId === messageData.requesterID) {
        messageScroll();
    }
}

document.getElementById('groupInput').addEventListener('input', function() {
    groupListLoading.style.display="black";
    document.getElementById('groupList').innerHTML='';
    fetch_firstPage_groupList(groupListLoading)
});

const groupListDiv = document.getElementById('groupList');
groupListDiv.addEventListener('scroll', async function() {
    if (groupListDiv.scrollTop + groupListDiv.clientHeight >= groupListDiv.scrollHeight) {
        await getFriendList_from_database(friendListStatus.page, null);
    }
}); 

let groupMessageStatus={
    page: 1,
    lastPage: false,
    isLoading:false
}

function fetch_firstPage_groupMessage(guildID,userID){
    groupMessageStatus.page=0;
    page =  groupMessageStatus.page;
    groupMessageStatus.lastPage=false;
    
    getGroupMessage__from__database(guildID,userID,page);

}

async function getGroupMessage__from__database(guildID,userID,page){
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let group_data = {
        userID:userID,
        guildID:guildID,
        timezone:timezone
    }; 
    if (groupMessageStatus.lastPage || !localStorage.getItem('token')||groupMessageStatus.isLoading===true) {
        return ;
    }
    groupMessageStatus.isLoading=true;
    const response = await fetch(`/getGroupMessage?page=${page}`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(group_data)
    });
    let result = await response.json();
    groupMessageStatus.isLoading = false;
    for(let message of result.data){
        loadGroupMsgToBox(message)
    }
    if (result.nextPage !== null) {
        groupMessageStatus.page = result.nextPage;
    } else {
        groupMessageStatus.lastPage = true;
    }
}

function loadGroupMsgToBox(message) {
    let htmlContent;
    if (message.contentType === 'image') {
        htmlContent = `<img src="${message.content}" class="messageBox__item__file" alt="Image">`;
    } else if (message.contentType === 'video') {
        htmlContent = `<video src="${message.content}" class="messageBox__item__file" controls></video>`;
    }
    else{
        htmlContent =`<div class="messageBox__item__content">${message.content}</div>`;
    }

    const groupMessageBox = document.getElementById('groupMessageBox');
    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');
    
    dateTime=toTaiwanTime(message.timestamp);

    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${message.senderNickName} :</div>
        ${htmlContent}
        <div class="messageBox__item__dateAndRead">
            <div>${dateTime}</div>
        </div>
    `;

    const messageContent = messageItem.querySelector('.messageBox__item__content');
    if(messageContent){
        messageContent.style.backgroundColor = user_info.nickName !== message.senderNickName ? '#ccffcc' : '#E0F7FA';
    }
    if (groupMessageBox.firstChild) {
        groupMessageBox.insertBefore(messageItem, groupMessageBox.firstChild);
    } else {
        groupMessageBox.appendChild(messageItem); 
    }
}
let groupMessageBox = document.getElementById('groupMessageBox');
groupMessageBox.addEventListener('scroll', function () {
    if (groupMessageBox.scrollTop === 0) {
        let page=groupMessageStatus.page;
        let userID=user_info.memberId;
        let guildID=groupRoom_manager.data.guildID;
        getGroupMessage__from__database(guildID,userID,page)
    }
});

document.getElementById('exitGroupMember').addEventListener('click', function() {
    document.getElementById("whiteMask").style.display='none';
    document.getElementById("groupMemberContainer").style.display='none';
});

document.getElementById('groupMember-btn').addEventListener('click', function() {
    document.getElementById("whiteMask").style.display='block';
    document.getElementById("groupMemberContainer").style.display='block';
    let groupMemberList=document.getElementById("groupMemberList");
    groupMemberList.innerHTML = '';
    createGroupMemberList(groupRoom_manager.groupMember)
}); 

function createGroupMemberList(groupMember){
    for (let member of groupMember){
        const memberItem = document.createElement('div');
        memberItem.classList.add('groupMemberContainer__list__item');
        memberItem.innerHTML = 
        `<img class="groupMemberContainer__list__item__headShot"/>
        <div>
            <div class="groupMemberContainer__list__item__nickname" ></div>
            <div class="groupMemberContainer__list__item__position" ></div>
        </div>`;
        memberItem.querySelector('.groupMemberContainer__list__item__headShot').src = member.headshot ? member.headshot : 'images/head-shot-default.png';
        memberItem.querySelector('.groupMemberContainer__list__item__nickname').textContent=member.nickName;
        memberItem.querySelector('.groupMemberContainer__list__item__position').textContent=member.isAdmin === 0 ? 'Acolyte' : 'BOSS';
        groupMemberList.appendChild(memberItem);
    }
    
}

document.getElementById('groupEmoji').addEventListener('click', function(event) {
    let emojiBox = document.querySelector('.emojiBox');
    if (emojiBox.style.display === 'flex') {
        emojiBox.style.display = 'none';
    } else {
        emojiBox.style.display = 'flex';
    }

    event.stopPropagation();
});