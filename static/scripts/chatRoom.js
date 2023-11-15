if (!localStorage.getItem('token')) {
    window.location.href = "/";
}

token = localStorage.getItem('token');


//登出
document.getElementById('signOut-btn').addEventListener('click', function () {
    localStorage.removeItem('token');
    
    window.location.reload();
});

//更改按鈕顏色
function changeButtonColor(button) {
    let computedStyle = window.getComputedStyle(button);
    let backgroundColor = computedStyle.backgroundColor;

    if (backgroundColor === "rgb(147, 112, 219)") { 
        button.style.backgroundColor = "#ffffff"; 
    }
}

//
function clearContainer(){
    let contactContainer = document.querySelector('.contact__container');
    contactContainer.innerHTML='';
}
