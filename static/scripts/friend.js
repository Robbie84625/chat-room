const token = localStorage.getItem('token');

async function selectNewFriendData_in_database() {
    try {
        let email = document.getElementById("inviteFriendEmail").value;
        const response = await fetch("/selectNewFriend", {
            method: "POST",
            body: JSON.stringify({
                "email": email
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();

        let selectFriendExist=document.getElementById("selectFriendExist");
        let newFriendData=data.newFriendData[0]
        
        if(newFriendData){
            selectFriendExist.style.display="block";
            document.getElementById("newFriendNickName").textContent=newFriendData.nickName
            document.getElementById("newFriendHeadShot").src = newFriendData.headshot === null ? 'images/head-shot-default.png' : newFriendData.headshot;
        }

    } catch (error) {
        console.error("Error during login:", error);
    }
    
}

document.getElementById("sendInvite-btn").addEventListener("click", () => {
    selectNewFriendData_in_database();
});