var ws;

const messagesDiv = document.getElementById("websocket");

function startMessage() {
  ws = new WebSocket("ws://localhost:3000");
  ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
      reader = new FileReader();

      reader.onload = () => {
        console.log("Result: " + reader.result);
        document.getElementById("websocketReceive").value = reader.result;
        messagesDiv.value = "";
      };

      reader.readAsText(event.data);
    } else {
      console.log("Result: " + event.data);
      console.log(event);
      document.getElementById("websocketReceive").value = event.data;
      messagesDiv.value = "";
    }
  };
  startbtn.disabled = true;
  sendbtn.disabled = false;
  closebtn.disabled = false;
  messagesDiv.disabled = false;
  messagesDiv.focus();
  messagesDiv.placeholder = "";
}

function closeMessage() {
  ws.close(1000, "Connection closed by client");
  startbtn.disabled = false;
  sendbtn.disabled = true;
  closebtn.disabled = true;
  messagesDiv.value = "";
  document.getElementById("websocketReceive").value = "";
  messagesDiv.disabled = true;
  messagesDiv.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}

function sendMessage() {
  const message = messagesDiv.value;

  if (message) {
    ws.send(message);
  }
}

var startbtn = document.getElementById("_startButton");
var sendbtn = document.getElementById("_sendButton");
var closebtn = document.getElementById("_closeButton");

startbtn.disabled = false;
sendbtn.disabled = true;
closebtn.disabled = true;

startbtn.onclick = startMessage;
sendbtn.onclick = sendMessage;
closebtn.onclick = closeMessage;
