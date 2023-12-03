document.querySelector('.groupNameContainer__groupName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});


document.querySelector(".createGroup-btn").addEventListener("click", () => {
    let createGroupPage=document.getElementById("createGroupPage");
    document.querySelector(".groupNameContainer__groupName").innerHTML='';
    document.getElementById("groupHeadShotInput").value = null;
    document.getElementById("groupHeadShot").src='/images/group.png';
    createGroupPage.style.display="block";
    let mask=document.getElementById("mask");
    mask.style.display="block";
    upLoadGroupHeadShot();
    fetch_firstPage_friendToGroup();
});

let friendToGroupStatus = {
    page: 1,
    lastPage: false,
    isLoading:false
};


function fetch_firstPage_friendToGroup(){
    friendToGroupStatus.page=0;
    page = friendToGroupStatus.page;
    friendToGroupStatus.lastPage=false;
    getFriendToGroup_from_database(page);
}

async function getFriendToGroup_from_database(page){
    if (friendToGroupStatus.isLoading|| friendToGroupStatus.lastPage || !localStorage.getItem('token')) {
        return ;
    }
    let friendInput = document.querySelector(".inviteMember__searchContainer__input").value;
    friendToGroupStatus.isLoading= true;

    try {
        const response = await fetch(`/getFriendData?page=${page}&keyword=${friendInput}`, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        friendToGroupStatus.isLoading = false;
        if (data.nextPage !== null) {
            friendListStatus.page = data.nextPage;
        } else {
            friendListStatus.lastPage = true; 
        }
        for (let i = 0; i < data['data'].length; i++) {
            waitToInviteData(data['data'][i], i);
        }
    } catch (error) {
        console.error("Error during login:", error);
        friendListStatus.isLoading = false;
    }
}

function waitToInviteData(detail, index) {
    groupData.memberList=[];
    
    let newItem = document.createElement('div');
    let headShot = detail.headshot || "/images/head-shot-default.png";

    newItem.className = 'inviteMember__container__item';
    newItem.innerHTML = `<img src="${headShot}" class="inviteMember__container__item__headShot"/>
                        <div class="inviteMember__container__item__nickName">${detail.friendNickName}</div>`;

    let inviteMemberContainer = document.querySelector('.inviteMember__container');
    inviteMemberContainer.appendChild(newItem);

    newItem.dataset.index = index;
    newItem.dataset.list = 'left';

    newItem.addEventListener('click', function() {
        let targetContainer, removeContainer;
        if (this.dataset.list === 'left') {
            targetContainer = document.querySelector('.join__container');
            removeContainer = inviteMemberContainer;
            this.dataset.list = 'right';
            groupData.memberList.push(detail.friendId);
        } else {
            targetContainer = inviteMemberContainer;
            removeContainer = document.querySelector('.join__container');
            this.dataset.list = 'left';
            let index = groupData.memberList.indexOf(detail.friendId);
            if (index !== -1) {
                groupData.memberList.splice(index, 1);
            }
        }

        removeContainer.removeChild(this);
        insertAtCorrectPosition(targetContainer, this, parseInt(this.dataset.index));
    });
}
const inviteMemberDiv = document.getElementById('friendList');
inviteMemberDiv.addEventListener('scroll', async function() {
    if (inviteMemberDiv.scrollTop + inviteMemberDiv.clientHeight >= inviteMemberDiv.scrollHeight) {
        await getFriendList_from_database(friendToGroupStatus.page);
    }
}); 

function insertAtCorrectPosition(container, element, index) {
    let beforeItem = getBeforeItem(container, index);
    if (beforeItem) {
        container.insertBefore(element, beforeItem);
    } else {
        container.appendChild(element);
    }
}

function getBeforeItem(container, index) {
    let items = container.children;
    for (let i = 0; i < items.length; i++) {
        if (parseInt(items[i].dataset.index) > index) {
            return items[i];
        }
    }
    return null;
}



document.querySelector(".inviteMember__searchContainer__input").addEventListener('input', function(event) {
    document.querySelector('.inviteMember__container').innerHTML='';
    getFriendToGroup_from_database(page);
});


document.getElementById('exitCreateGroup').addEventListener("click", () => {
    exit_CreateGroup();
});

function exit_CreateGroup(){
    createGroupPage.style.display="none";
    let mask=document.getElementById("mask");
    mask.style.display="none";
    clearContainer('.inviteMember__container');
    clearContainer('.join__container');
}

function clearContainer(selector) {
    let container = document.querySelector(selector);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

let groupData={
    memberList:[]
}

document.getElementById('groupHeadShot').addEventListener('click', function () {
    document.getElementById('groupHeadShotInput').click();
});

async function upLoadGroupHeadShot(){
    document.getElementById("groupHeadShotInput").addEventListener("change", function() {
        if (this.files && this.files[0]) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(this.files[0].type)) {
                alert('請選擇有效的圖片檔案（jpg, jpeg, png, gif）。');
                return;
            }
        }
        let headShotFile = this.files[0];
        if (headShotFile) {        
            const reader = new FileReader();

            reader.onload = function(e) {
                // 將預覽圖片顯示在 img 元素中
                let headShot = document.getElementById("groupHeadShot");
                headShot.src = e.target.result;
            };

            reader.readAsDataURL(headShotFile); // 讀取選擇的圖片
        }
    });

    const sureCreateGroupBtn = document.querySelector(".sureCreateGroup-btn");

    if (sureCreateGroupBtn) {
        sureCreateGroupBtn.removeEventListener('click', handleCreateGroup);
    }

    sureCreateGroupBtn.addEventListener('click', handleCreateGroup);
    
}

async function handleCreateGroup(event) {
    event.target.disabled = true;
    document.getElementById('createGroupLoading').style.display='block';
    headShotFile=document.getElementById("groupHeadShotInput").files[0];
    const formData = new FormData();
    if (headShotFile){
        formData.append('file', headShotFile);
    }
    let groupName = document.querySelector(".groupNameContainer__groupName").textContent;
    if(groupName){
        formData.append('groupName', groupName);
        groupId=await upload_groupInfo(formData);
        let groupMember=groupData.memberList;
        await upload_groupMember(groupId,groupMember);
    }
    else {
        alert('請輸入公會名稱');
    }
}


async function upload_groupInfo(formData){
    const response =await fetch('/uploadGroupInfo', {
        method: "POST",
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.groupId;

}
async function upload_groupMember(groupId,groupMember){
    const data = {
        groupId: groupId,
        groupMember: groupMember
    };
    
    const jsonData = JSON.stringify(data);
    const response =await fetch('/uploadMember', {
        method: "POST",
        body: jsonData,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.ok) {
        document.querySelector(".sureCreateGroup-btn").disabled = false;
        document.getElementById('createGroupLoading').style.display='none';
        exit_CreateGroup();
    } else {
        console.error("錯誤:", responseData.message);
    }

}