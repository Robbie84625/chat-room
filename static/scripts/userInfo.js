async function fetchMemberData() {
    try {
        if (!token) {
            return;
        }
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        let loading__userInfo = document.getElementById("loadingUserInfo");
        loading__userInfo .style.display='block';

        const response = await fetch('/getMemberData', { headers });
        
        const userData = await response.json();
        if (response.ok) {
            loading__userInfo .style.display='none';

            myHeadShot = userData.headshot === null ? 'images/head-shot-default.png' : userData.headshot;
            myNickName=userData.nickName;
            myName=userData.name;
            myMoodText= userData.moodText === null ? '心情小語' : userData.moodText;
            
            create_user_information(myHeadShot,myNickName, myName,myMoodText)
            

        } else {
            console.error('無法獲取資料');
        }
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}


//open個人檔案頁面
document.getElementById("userInfo-btn").addEventListener("click", () => {
    let userInfo=document.getElementById("userInfo");
    let mask=document.getElementById("mask");
    userInfo.style.display="block";
    mask.style.display="block";

    fetchMemberData();
});

//exit個人頁面loadHeadShot
document.getElementById("exitUserInfo").addEventListener("click", () => {
    let userInfo=document.getElementById("userInfo");
    let mask=document.getElementById("mask");

    userInfo.style.display="none";
    mask.style.display="none";
});

let userInfo_oldValue = {
    oldMoodText: "",
    oldNickName: ""
};
function control_userInfo(){
    document.getElementById('headShotContainer').addEventListener('click', function () {
        document.getElementById('headShotInput').click();
    });
    
    document.getElementById("headShotInput").addEventListener("change", function() {
        const headShotFile = this.files[0];
    
        if (headShotFile) {        
            const reader = new FileReader();
    
            reader.onload = function(e) {
                // 將預覽圖片顯示在 img 元素中
                let headShot = document.getElementById("myHeadShot");
                headShot.src = e.target.result;
            };
    
            reader.readAsDataURL(headShotFile); // 讀取選擇的圖片
        }
    });
    let moodTextDiv = document.getElementById('myMoodText');
    let nickNameDiv = document.getElementById('myNickName');
    let editNickNameIcon = document.getElementById('userInfo__nickNameContainer__editIcon');
    let editMoodTextIcon = document.getElementById('userInfo__moodTextContainer__editIcon');

    setupMoodTextEditing(moodTextDiv, editMoodTextIcon);
    setupMoodTextEditing(nickNameDiv, editNickNameIcon);
    
    document.getElementById("userInfoUpdate").addEventListener('click', function () {
        const formData = new FormData();
        const myHeadShot = document.getElementById("headShotInput").files[0];
        const myNickName = document.getElementById("myNickName").textContent;
        const myMoodText = document.getElementById("myMoodText").textContent;
    
        if (myHeadShot) {
            formData.append('file', myHeadShot);
        }
        if (myNickName !== "" ||myNickName !==userInfo_oldValue.oldNickName) {
            formData.append('myNickName', myNickName);
        }
        if (myMoodText !== userInfo_oldValue.oldMoodText) {
            formData.append('myMoodText', myMoodText);
        }
        
        if (myHeadShot || (myNickName !== "" && myNickName !== userInfo_oldValue.oldNickName) || myMoodText !== userInfo_oldValue.oldMoodText) {
            let loading__userInfoStatus=document.getElementById("loading__userInfoStatus");
            loading__userInfoStatus.style.display="block";
            upload_userInfo(formData);
        }
    });
}


async function upload_userInfo(formData){
    
    let token=localStorage.getItem('token');
    
    const response = await fetch('/uploadUserInfo', {
        method: "POST",
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    data=await response.json();
    let loading__userInfoStatus=document.getElementById("loading__userInfoStatus");
    let userInfoStatus=document.getElementById("userInfoStatus");
    if(response.ok){
        loading__userInfoStatus.style.display="none";
        userInfoStatus.style.display="block";
        userInfoStatus.innerHTML=data.message;
    }
    else{
        loading__userInfoStatus.style.display="none";
        userInfoStatus.style.display="block";
        userInfoStatus.innerHTML=data.message;
    }
    document.getElementById("exitUserInfo").addEventListener("click", () => {
        const userInfoStatus = document.getElementById("userInfoStatus");
    
        userInfoStatus.style.display="none";
    });
}


function setupMoodTextEditing(moodTextDiv, editIcon) {
    if(moodTextDiv.id==='myMoodText')
    {
        userInfo_oldValue.oldMoodText=moodTextDiv.textContent;
    }
    else if(moodTextDiv.id==='myNickName'){
        userInfo_oldValue.oldNickName=moodTextDiv.textContent; 
    }
    // userInfo_oldValue.oldNickName=moodTextDiv.textContent;
    
    // 設置編輯圖標的點擊事件
    editIcon.addEventListener('click', function() {
        if (moodTextDiv.isContentEditable) {
            moodTextDiv.contentEditable = "false";
            this.textContent = "編輯";
        } else {
            moodTextDiv.contentEditable = "true";
            this.textContent = "完成";
            moodTextDiv.focus();
        }
        moodTextDiv.classList.add('apply-ellipsis-style');
    });

    // 監聽整個文檔的點擊事件
    document.addEventListener('click', function(event) {
        if (!moodTextDiv.contains(event.target) && event.target !== editIcon) {
            if (moodTextDiv.isContentEditable) {
                moodTextDiv.contentEditable = "false";
                editIcon.textContent = "編輯";
            }
        }
    });

    // 阻止在 div 中按下 Enter 鍵時的換行
    moodTextDiv.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
}

function create_user_information(myHeadShot,myNickName, myName,myMoodText){
    let userInfo__container= document.getElementById("userInfo__container");
    let headShotImage = new Image();
    headShotImage.src = myHeadShot;
    headShotImage.onload = function() {
        
        userInfo__container.innerHTML=`
            <div class="userInfo__headShotContainer" id="headShotContainer">
                <img alt="head shot" class="userInfo__headShotContainer__img" id="myHeadShot"/>
                <img src="images/image-editing.png" alt="image editing" class="userInfo__headShotContainer__editIcon" />
            </div>
            <input type="file" name="file" id="headShotInput" style="display:none">
            <div class="userInfo__nickNameContainer">
                <div class="userInfo__nickNameContainer__nickName" id="myNickName"></div>
                <img src="images/edit.svg" alt="edit mood text icon" class="userInfo__nickNameContainer__editIcon" id="userInfo__nickNameContainer__editIcon"/>
            </div>
            <div class="userInfo__container__name" id='myName'></div>
            <div class="userInfo__moodTextContainer">
                <div class="userInfo__moodTextContainer__moodText" id="myMoodText"></div>
                <img src="images/edit.svg" alt="edit mood text icon" class="userInfo__moodTextContainer__editIcon" id="userInfo__moodTextContainer__editIcon"/>
            </div>
            <img src="images/update.png" alt="update icon" class="userInfo__updateIcon" id="userInfoUpdate"/>
            <img src="images/checkBuffer.gif" alt="loading status" class="loading__userInfoStatus" id="loading__userInfoStatus"/>
            <div class="userInfo__status" id="userInfoStatus"></div>
            `;
        let myHeadShotDiv=document.getElementById('myHeadShot');
        myHeadShotDiv.src=myHeadShot;
        let myNickNameDiv=document.getElementById('myNickName');
        myNickNameDiv.textContent=myNickName;
        let myNameDiv=document.getElementById('myName');
        myNameDiv.textContent=myName;
        let myMoodTextDiv=document.getElementById('myMoodText');
        myMoodTextDiv.textContent=myMoodText;
        control_userInfo();
    }
}

