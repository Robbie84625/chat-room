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
        noFriend.style.display = data['data'].length < 1 ? 'block' : 'none';
        
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
    
    friendNickname.textContent = detail.nickName;
    friendMoodText.textContent = detail.moodText || '心情小語';
    let headShot = detail.headshot || "/images/head-shot-default.png";
    friendHeadShot.src = headShot;

    let friendListDiv = document.getElementById('friendList');
    friendListDiv.appendChild(friendItemDiv);

    friendItemDiv.addEventListener('click', function() {
        let emailPrefix=detail.email.split('@')[0];
        let nickName=detail.nickName;
        let moodText=detail.moodText;
        let headShot=detail.headshot;
        show_friendDetails(nickName,emailPrefix,moodText,headShot);


    });
}

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
    // 检查是否滚动到底部
    if (friendListDiv.scrollTop + friendListDiv.clientHeight >= friendListDiv.scrollHeight) {
        // 已经滚动到底部，加载下一页
        await getFriendList_from_database(friendListStatus.page, null);
    }
}); 

function show_friendDetails(nickName,emailPrefix,moodText,headShot){
    document.getElementById('friendNickName').textContent=document.getElementById('friend_nickName').textContent=nickName;
    document.getElementById('friendEmailPrefix').textContent=emailPrefix
    document.getElementById('friendMoodText').textContent=moodText;
    document.getElementById('headShot').src=headShot;
}