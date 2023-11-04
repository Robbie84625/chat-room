// 切換註冊
document.getElementById("switchToSignUp").addEventListener('click', function() {
    let signUp=document.getElementById("signUp")
    signUp.style.display="block";
    let login=document.getElementById("login")
    login.style.display="none";
});

// 切換登入
document.getElementById("switchToLogin").addEventListener('click', function() {
    let login=document.getElementById("login")
    login.style.display="block";
    let signUp=document.getElementById("signUp")
    signUp.style.display="none";
});

