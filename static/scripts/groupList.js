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
        for(let detail of data['data']){
            createGroupData(detail);
        }
    } catch (error) {
        console.error("Error during login:", error);
        friendListStatus.isLoading = false;
    }
}

function createGroupData(detail){
    let groupItemDiv = document.createElement('div');
    groupItemDiv.className = 'groupList__item';

    groupItemDiv.innerHTML = 
        `
        <div class="groupList__item__avatarContainer">
            <img class="groupList__item__avatar"/>
        </div>
        <div class="groupList__item__Nickname"></div>
        `;
    let groupName = groupItemDiv.querySelector('.groupList__item__Nickname');
    let groupAvatar = groupItemDiv.querySelector('.groupList__item__avatar');
    
    groupName.textContent = detail.guildName;
    groupAvatar.src = detail.guildAvatar || "/images/head-shot-default.png";

    let groupListDiv = document.getElementById('groupList');
    groupListDiv.appendChild(groupItemDiv);

    
}