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

    friendPage.style.display="none";
    groupContainer.style.display="block";
    noticePage.style.display="none";
}

let groupListStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};

let groupListLoading = document.getElementById("groupListLoading");

function fetch_firstPage_groupList(groupListLoading){
    groupListStatus.page=0;
    page = groupListStatus.page;
    groupListStatus.lastPage=false;
    groupListLoading.style.display="black";
    groupListAppear();
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
        user_info.user_nickName=data.userInfo.userNickName;
        user_info.user_id=data.userInfo.userId;
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
    groupAvatar.src = detail.guildAvatar || "/images/head-shot-default.png";

    let groupListDiv = document.getElementById('groupList');
    groupListDiv.appendChild(groupItemDiv);
    groupItemDiv.addEventListener('click',async function() {
        document.getElementById('friendChatRoom').style.display='none';
        document.getElementById('groupChatRoom').style.display='block';
        document.getElementById('groupName').textContent=detail.guildName;
        document.getElementById('groupAvatar').src= detail.guildAvatar || "/images/group.png";
        document.getElementById('groupMessageBox').innerHTML='';
        groupMember=await get_groupMember(detail.guildID);
        fetch_firstPage_groupMessage(detail.guildID,user_info.user_id);
        //根據群組id來生成Room id
        let groupRoomId = `g${detail.guildID}`;
        groupRoom_manager.groupRoomId=groupRoomId;
        groupRoom_manager.data=detail;
        groupRoom_manager.groupMember=groupMember;
        socket.emit('joinGroupRoom', groupRoomId);
    });
    
}

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
    let userNickName=user_info.user_nickName;
    let guildID=groupRoom_manager.data.guildID;
    let userId=user_info.user_id;
    let groupRoomId=groupRoom_manager.groupRoomId;
    let message = document.getElementById('groupMessageInput').value;
    let groupMemberIDs=groupRoom_manager.groupMember.map(member => member.memberID);
    if (message !== '') { 
        sendMessage_to_group(guildID,userId,userNickName, message,groupRoomId,groupMemberIDs);
        document.getElementById('messageInput').value = '';
    }
});

function sendMessage_to_group(guildID,userId,userNickName, message,groupRoomId,groupMemberIDs){
    
    let data = {
        guildID:guildID,
        groupMember:groupMemberIDs,
        userId:userId,
        userNickName:userNickName,
        message:message,
        groupRoomId:groupRoomId
    };
    socket.emit('sendGroupMessage', data, groupRoomId);
};

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

    if (user_info.user_id !== messageData.userId) {
        messageContent.style.backgroundColor = '#ccffcc';
    } else {
        messageContent.style.backgroundColor = '#E0F7FA';
    }

    messageBox.appendChild(messageItem);
    if (user_info.user_id === messageData.userId) {
        groupMessageScroll(messageBox);
    }
}
function groupMessageScroll(messageBox){
    messageBox.scrollTop = messageBox.scrollHeight;
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
    const groupMessageBox = document.getElementById('groupMessageBox');
    const messageItem = document.createElement('div');
    messageItem.classList.add('messageBox__item');
    
    dateTime=toTaiwanTime(message.timestamp);
    messageItem.innerHTML = `
        <div class="messageBox__item__nickName">${message.senderNickName} :</div>
        <div class="messageBox__item__content">${message.content}</div>
        <div class="messageBox__item__dateAndRead">
            <div>${dateTime}</div>
        </div>
    `;
    const messageContent = messageItem.querySelector('.messageBox__item__content');
    
    messageContent.style.backgroundColor = user_info.user_nickName !== message.senderNickName ? '#ccffcc' : '#E0F7FA';

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
        let userID=user_info.user_id;
        let guildID=groupRoom_manager.data.guildID;
        getGroupMessage__from__database(guildID,userID,page)
    }
});