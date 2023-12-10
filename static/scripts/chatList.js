document.getElementById("chat-btn").addEventListener("click", () => {
    change_chatBtn_bg();
    chatListAppear();
    let chatListLoading= document.getElementById("chatListLoading");
    chatListLoading.style.display="block";
    document.getElementById('chatList').innerHTML='';
    fetch_firstPage_chatList(chatListLoading);
});

function change_chatBtn_bg(){
    let chatBtn=document.getElementById("chat-btn")
    chatBtn.style.backgroundColor = "#9370db";

    let userInfoBtn=document.getElementById("userInfo-btn")
    let noticeBtn=document.getElementById("notice-btn")
    let groupBtn=document.getElementById("group-btn")
    let friendBtn = document.getElementById("friend-btn")


    changeButtonColor(userInfoBtn);
    changeButtonColor(noticeBtn);
    changeButtonColor(groupBtn);
    changeButtonColor(friendBtn);
    
}

function chatListAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");
    let chatContainer=document.getElementById("chatContainer");

    friendPage.style.display="none";
    groupContainer.style.display="none";
    noticePage.style.display="none";
    chatContainer.style.display="block";
}

let chatListStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};

function fetch_firstPage_chatList(chatListLoading){
    chatListStatus.page=0;
    page = chatListStatus.page;
    chatListStatus.lastPage=false;
    chatListLoading.style.display="black";
    chatListAppear();
    getChatList_from_database(page,chatListLoading);
}

let chatListLoading= document.getElementById("chatListLoading");
fetch_firstPage_chatList(chatListLoading);

async function getChatList_from_database(page,chatListLoading = null){
    if (chatListLoading) {
        chatListLoading.style.display = "block";
    }

    if (chatListStatus.isLoading|| chatListStatus.lastPage || !localStorage.getItem('token')) {
        return ;
    }

    chatListStatus.isLoading = true;
    let noChat=document.getElementById('noChat');
    noChat.style.display='none';
    try {
        const response = await fetch(`/getMessageData?page=${page}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        noChat.style.display = data['data'].length < 1 && data['nextPage']===null ? 'block' : 'none';
        chatListStatus.isLoading = false;
        if (chatListLoading) {
            chatListLoading.style.display = "none";
        }
        if (data.nextPage !== null) {
            chatListStatus.page = data.nextPage;
        } else {
            chatListStatus.lastPage = true; 
        }
        for(let detail of data['data']){
            createChatData(detail)
        }
    } catch (error) {
        console.error("Error during login:", error);
        friendListStatus.isLoading = false;
    }
}

function createChatData(detail){
    let chatItemDiv = document.createElement('div');
    chatItemDiv.className = 'chatList__item';
    chatItemDiv.onlineStatus = detail.onlineStatus;
    chatItemDiv.innerHTML=
        `<img class="chatList__item__avatar"/>
        <div style='margin:auto 0px;'>
            <div class="chatList__item__name"></div>
            <div class="chatList__item__message"></div>
        </div>`;
    let name = chatItemDiv.querySelector('.chatList__item__name');
    let message = chatItemDiv.querySelector('.chatList__item__message');
    let avatar = chatItemDiv.querySelector('.chatList__item__avatar');
    name.textContent = detail.name;
    let Avatar;
    if(detail.isGroup===1){
        Avatar = detail.avatar|| "/images/group.png";
    }
    else{
        Avatar = detail.avatar|| "/images/head-shot-default.png";
    }
    avatar.src = Avatar;
    if (detail.contentType === 'text') {
        if (detail.isMe === 1) {
            message.textContent = `你:${detail.content}`;
        } else {
            let displayName = detail.isGroup === 1 ? detail.senderNickName : detail.name;
            message.textContent = `${displayName}:${detail.content}`;
        }
    } else if (detail.contentType === 'image') {
        let text = detail.isMe === 1 ? '你:發送一個圖片' : `${detail.isGroup === 1 ? detail.senderNickName : detail.name}:發送一個圖片`;
        message.textContent = text;
    } else if (detail.contentType === 'video') {
        let text = detail.isMe === 1 ? '你:發送一個影片' : `${detail.isGroup === 1 ? detail.senderNickName : detail.name}:發送一個影片`;
        message.textContent = text;
    }

    let chatListDiv = document.getElementById('chatList');
    chatListDiv.appendChild(chatItemDiv);

    let emailIcon;
    if (detail.isMe === 0 && detail.readStatus === 0) {
        emailIcon = document.createElement('div');
        emailIcon.className = "chatList__item__emailIcon";
        chatItemDiv.appendChild(emailIcon); 
        message.style.color='black';
    }
    if (detail.isGroup === 1) {
        chatItemDiv.setAttribute('data-group-id',`g_${detail.recipientID}`);
    } else if (detail.isGroup === 0) {
        const friendID = detail.isMe === 1 ? detail.recipientID : detail.requesterID;
        chatItemDiv.setAttribute('data-friend-id', `f_${friendID}`);
        chatItemDiv.setAttribute('data-online-status', detail.onlineStatus);
    }
    chatItemDiv.addEventListener('click',async function() {
        document.getElementById("firstPage").style.display='none';
        if (emailIcon && chatItemDiv.contains(emailIcon)) {
            chatItemDiv.removeChild(emailIcon);
            message.style.color='gray';
        }
        if (detail.isGroup === 0) {
            document.getElementById('friendChatRoom').style.display = 'block';
            document.getElementById('groupChatRoom').style.display = 'none';
            let emailPrefix=detail.email.split('@')[0];
            let moodText=detail.moodText || '心情小語';
            let friendNickName=detail.name;
            let avatar=detail.avatar|| "/images/head-shot-default.png";  
            let onlineStatus=detail.onlineStatus;
            show_friendDetails(friendNickName,emailPrefix,moodText,avatar,onlineStatus);

            if (detail.isMe === 1) {
                room_manager.userId=detail.requesterID;
                room_manager.friendId=detail.recipientID;
            }
            if (detail.isMe === 0) {
                room_manager.userId=detail.recipientID;
                room_manager.friendId=detail.requesterID;
            }

            let roomId = generateRoomId(room_manager.userId, room_manager.friendId);
            room_manager.roomId=roomId;

            user_info.user_nickName=detail.name;
            document.getElementById('messageBox').innerHTML='';
            document.getElementById('messageInput').value = '';
            
            fetch_firstPage_personalMessage();
            //根據雙方id生成room
            
            
            groupRoom_manager.groupRoomId=0;
            
            let roomData={
                requesterID:room_manager.userId,
                friendId:room_manager.userId,
                requesterNickName:detail.otherNickName,
                friendNickName:detail.name,
                friendEmail:detail.email,
                friendMoodText:detail.moodText,
                friendAvatar:detail.avatar,
                friendOnlineStatus:detail.onlineStatus
            }
            
            room_manager.data=roomData;

            socket.emit('joinRoom', roomId);
            socket.emit('updateReadStatus', { roomId: roomId,friendId:room_manager.friendId,userId:room_manager.userId});
        } else {
            document.getElementById('friendChatRoom').style.display = 'none';
            document.getElementById('groupChatRoom').style.display = 'block';

            document.getElementById('groupName').textContent=detail.name;
            document.getElementById('groupAvatar').src= detail.avatar || "/images/group.png";
            document.getElementById('groupMessageBox').innerHTML='';
            document.getElementById('groupMessageInput').value='';

            let guildID=detail.recipientID;
            let guildName=detail.name;
            let guildAvatar=detail.avatar;

            groupMember=await get_groupMember(guildID);
            fetch_firstPage_groupMessage(guildID,user_info.user_id);
            //根據群組id來生成Room id
            let groupRoomId = `g${guildID}`;
            room_manager.roomId=0
            groupRoom_manager.groupRoomId=groupRoomId;
            groupRoom_manager.groupMember=groupMember;
            groupRoom_manager.data={guildID:guildID,guildName:guildName,guildAvatar:guildAvatar};
            socket.emit('joinGroupRoom', groupRoomId);
            socket.emit('updateGroupReadStatus', { roomId: groupRoomId, guildID: guildID ,userId:user_info.user_id});
        }
    });
}
socket.on('receiveFriendMessage', (data) => {
    let noChat=document.getElementById('noChat');
    noChat.style.display='none';
    let friendDivId = `f_${data.requesterID}`;
    let chatListDiv = document.getElementById('chatList');
    // 尋找並移除現有的 div
    let existingDiv = chatListDiv.querySelector(`div[data-friend-id="${friendDivId}"]`);
    if (existingDiv) {
        chatListDiv.removeChild(existingDiv);
    }
    getNewChatData(data);
});

function getNewChatData(data){
    let chatItemDiv = document.createElement('div');
    chatItemDiv.className = 'chatList__item';
    chatItemDiv.onlineStatus = data.onlineStatus;
    chatItemDiv.innerHTML=
        `<img class="chatList__item__avatar"/>
        <div style='margin:auto 0px;'>
            <div class="chatList__item__name"></div>
            <div class="chatList__item__message"></div>
        </div>`;
    let name = chatItemDiv.querySelector('.chatList__item__name');
    let message = chatItemDiv.querySelector('.chatList__item__message');
    let avatar = chatItemDiv.querySelector('.chatList__item__avatar');
    name.textContent = data.requesterNickName;
    let Avatar;
    
    Avatar = data.headshot|| "/images/head-shot-default.png";

    avatar.src = Avatar;
    if (data.contentType === 'text') {
        message.textContent = `${data.requesterNickName}:${data.message}`;
    } else if (data.contentType === 'image') {
        message.textContent = `${data.requesterNickName}:發送一個圖片`;
    } else if (data.contentType === 'video') {
        message.textContent = `${data.requesterNickName}:發送一個影片`;
    }

    let chatListDiv = document.getElementById('chatList');
    let onlineStatus=data.onlineStatus;
    let requesterID = data.recipientID;
    let recipientID = data.requesterID;
    let requesterNickName = data.friendNickName;
    let friendNickName = data.requesterNickName;
    
    chatItemDiv.setAttribute('data-friend-id', `f_${recipientID}`);
    chatItemDiv.setAttribute('data-online-status', onlineStatus);
    
    if (chatListDiv.firstChild) {
        chatListDiv.insertBefore(chatItemDiv, chatListDiv.firstChild);
    } else {
        chatListDiv.appendChild(chatItemDiv);
    }
    

    let emailIcon;
    if (data.roomId!==room_manager.roomId) {
        emailIcon = document.createElement('div');
        emailIcon.className = "chatList__item__emailIcon";
        chatItemDiv.appendChild(emailIcon); 
        message.style.color='black';
    }
    
    let roomId = generateRoomId(recipientID, requesterID);
    socket.emit('joinRoom', roomId);

    chatItemDiv.addEventListener('click',async function() {
        document.getElementById("firstPage").style.display='none';
        if (emailIcon && chatItemDiv.contains(emailIcon)) {
            chatItemDiv.removeChild(emailIcon);
            message.style.color='gray';
        }

        document.getElementById('friendChatRoom').style.display = 'block';
        document.getElementById('groupChatRoom').style.display = 'none';
        let emailPrefix=data.email.split('@')[0];
        let moodText=data.moodText || '心情小語';

        let avatar=data.headshot|| "/images/head-shot-default.png";  
        
        show_friendDetails(friendNickName,emailPrefix,moodText,avatar,onlineStatus);

        document.getElementById('messageBox').innerHTML='';
        document.getElementById('messageInput').value = '';
        //根據雙方id生成room
        let roomId = generateRoomId(recipientID, requesterID);
        room_manager.userId=requesterID;
        room_manager.friendId=recipientID;
        room_manager.roomId=roomId;

        fetch_firstPage_personalMessage();
        
        let roomData={
            requesterID:requesterID,
            friendId:recipientID,
            requesterNickName:requesterNickName,
            friendNickName:friendNickName,
            friendEmail:data.email,
            friendMoodText:data.moodText,
            friendAvatar:data.headshot,
            friendOnlineStatus:data.onlineStatus
        }
        room_manager.data=roomData;
    });
}

socket.on('receiveFromGroup', (data) => {
    let noChat=document.getElementById('noChat');
    noChat.style.display='none';
    let groupDivId = `g_${data.guildID}`;
    let chatListDiv = document.getElementById('chatList');
    // 尋找並移除現有的 div
    let existingDiv = chatListDiv.querySelector(`div[data-group-id="${groupDivId}"]`);
    if (existingDiv) {
        chatListDiv.removeChild(existingDiv);
    }
    getNewGroupChatData(data);
});

function getNewGroupChatData(data){
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
    name.textContent = data.guildName;
    let Avatar;
    
    Avatar = data.guildAvatar|| "/images/group.png";

    avatar.src = Avatar;
    if (data.contentType === 'text') {
        message.textContent = `${data.requesterNickName}:${data.message}`;
    } else if (data.contentType === 'image') {
        message.textContent = `${data.requesterNickName}:發送一個圖片`;
    } else if (data.contentType === 'video') {
        message.textContent = `${data.requesterNickName}:發送一個影片`;
    }

    let chatListDiv = document.getElementById('chatList');

    let guildID = data.guildID;
    
    chatItemDiv.setAttribute('data-group-id',`g_${guildID}`);
    
    if (chatListDiv.firstChild) {
        chatListDiv.insertBefore(chatItemDiv, chatListDiv.firstChild);
    } else {
        chatListDiv.appendChild(chatItemDiv);
    }
    

    let emailIcon;
    if (data.groupRoomId!==groupRoom_manager.groupRoomId) {
        emailIcon = document.createElement('div');
        emailIcon.className = "chatList__item__emailIcon";
        chatItemDiv.appendChild(emailIcon); 
        message.style.color='black';
    }
    socket.emit('joinGroupRoom', data.groupRoomId);

    chatItemDiv.addEventListener('click',async function() {
        document.getElementById("firstPage").style.display='none';
        if (emailIcon && chatItemDiv.contains(emailIcon)) {
            chatItemDiv.removeChild(emailIcon);
            message.style.color='gray';
        }

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

let chatListDiv = document.getElementById('chatList');
chatListDiv.addEventListener('scroll', async function() {
    if (chatListDiv.scrollTop + chatListDiv.clientHeight >= chatListDiv.scrollHeight) {
        await getChatList_from_database(chatListStatus.page, null);
    }
}); 