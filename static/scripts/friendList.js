document.getElementById("friend-btn").addEventListener("click", () => {
    change_friendBtn_bg();
    friendAppear();
});

function friendAppear(){
    let friendPage = document.getElementById("friendPage");
    let groupContainer = document.getElementById("groupContainer");
    let noticePage=document.getElementById("noticePage");

    friendPage.style.display="block";
    groupContainer.style.display="none";
    noticePage.style.display="none";
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