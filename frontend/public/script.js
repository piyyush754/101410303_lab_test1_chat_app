<script src="http://localhost:5000/socket.io/socket.io.js"></script>

async function signup() {
    const username = document.getElementById("username").value.trim();
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !firstname || !lastname || !password) {
        alert("All fields are required!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, firstname, lastname, password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Signup successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Server error");
    }
}


async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Both fields are required!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            alert("Login successful! Redirecting to home...");
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Server error");
    }
}



// ✅ Handle Logout
function logout() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// ✅ Handle Joining a Chat
function joinChat() {
    const chatType = document.getElementById("chatType").value;
    let chatTarget = chatType === "group"
        ? document.getElementById("groupRoom").value
        : document.getElementById("privateUser").value;

    localStorage.setItem("chatType", chatType);
    localStorage.setItem("chatTarget", chatTarget);
    window.location.href = "chat.html";
}

// ✅ Handle Sending Messages
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const username = localStorage.getItem("username");
    const chatType = localStorage.getItem("chatType");
    const chatTarget = localStorage.getItem("chatTarget");

    if (message) {
        if (chatType === "group") {
            socket.emit("sendGroupMessage", { from_user: username, room: chatTarget, message });
        } else {
            socket.emit("sendPrivateMessage", { from_user: username, to_user: chatTarget, message });
        }
        messageInput.value = "";
    }
}

// ✅ Receive Messages
socket.on("message", (data) => {
    const messagesDiv = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
