var sendChannel, receiveChannel;

var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function createConnection() {
  // Chrome
  if (navigator.webkitGetUserMedia) {
    RTCPeerConnection = webkitRTCPeerConnection;
    // Firefox
  } else if (navigator.mozGetUserMedia) {
    RTCPeerConnection = mozRTCPeerConnection;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCIceCandidate = mozRTCIceCandidate;
  }
  log("RTCPeerConnection object: " + RTCPeerConnection);

  var servers = null;
  var pc_constraints = {
    optional: [{ DtlsSrtpKeyAgreement: true }],
  };
  localPeerConnection = new RTCPeerConnection(servers, pc_constraints);
  log("Created local peer connection object, with Data Channel");
  try {
    sendChannel = localPeerConnection.createDataChannel("sendDataChannel", {
      reliable: true,
    });
    log("Created reliable send data channel");
  } catch (e) {
    alert("Failed to create data channel!");
    log("createDataChannel() failed with following message: " + e.message);
  }

  localPeerConnection.onicecandidate = gotLocalCandidate;
  sendChannel.onopen = handleSendChannelStateChange;
  sendChannel.onclose = handleSendChannelStateChange;
  window.remotePeerConnection = new RTCPeerConnection(servers, pc_constraints);
  log("Created remote peer connection object, with DataChannel");
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
  remotePeerConnection.ondatachannel = gotReceiveChannel;

  localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
  startButton.disabled = true;
  closeButton.disabled = false;
}

function gotLocalDescription(desc) {
  localPeerConnection.setLocalDescription(desc);
  log("localPeerConnection's SDP: \n" + desc.sdp);
  remotePeerConnection.setRemoteDescription(desc);
  remotePeerConnection.createAnswer(gotRemoteDescription, onSignalingError);
}

function onSignalingError(error) {
  console.log("Failed to create signaling message : " + error.name);
}

function gotRemoteDescription(desc) {
  remotePeerConnection.setLocalDescription(desc);
  log("Answer from remotePeerConnection's SDP:" + desc.sdp);
  localPeerConnection.setRemoteDescription(desc);
}

function sendData() {
  var data = document.getElementById("dataChannelSend").value;
  sendChannel.send(data);
  log("Sent data: " + data);
}
function closeDataChannels() {
  log("Closing data channels");
  sendChannel.close();
  log("Closed data channel with label: " + sendChannel.label);
  receiveChannel.close();
  log("Closed data channel with label: " + receiveChannel.label);
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  log("Closed peer connections");
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = "";
  dataChannelReceive.value = "";
  dataChannelSend.disabled = true;
  dataChannelSend.placeholder = "1: Press Start; 2: Enter text; 3: Press Send.";
}

function log(text) {
  console.log(
    "At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text
  );
}

function gotLocalCandidate(event) {
  log("local ice callback");
  if (event.candidate) {
    // send candidate via http or socket to the other peer
    remotePeerConnection.addIceCandidate(event.candidate);
    log("Local ICE candidate: \n" + event.candidate.candidate);
  }
}

function gotRemoteIceCandidate(event) {
  log("remote ice callback");
  if (event.candidate) {
    // send candidate via http or socket to the other peer
    localPeerConnection.addIceCandidate(event.candidate);
    log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}

function gotReceiveChannel(event) {
  log("Receive Channel Callback: event --> " + event);
  receiveChannel = event.channel;
  receiveChannel.onopen = handleReceiveChannelStateChange;
  receiveChannel.onmessage = handleMessage;
  receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
  log("Received message: " + event.data);
  document.getElementById("dataChannelReceive").value = event.data;
  document.getElementById("dataChannelSend").value = "";
}

function handleSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  log("Send channel state is: " + readyState);
  if (readyState == "open") {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    dataChannelSend.placeholder = "";
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function handleReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  log("Receive channel state is: " + readyState);
}

/*

Certainly! The ICE (Interactive Connectivity Establishment) process in WebRTC involves several steps to establish a direct peer-to-peer connection between two peers, even when they are behind NAT (Network Address Translation) devices or firewalls. Here are the detailed steps of the ICE process:

Gathering Local ICE Candidates:
Each peer (browser) gathers a list of potential network addresses and ports through which it can be reached. These potential addresses are known as ICE candidates.
The local ICE candidates include local IP addresses, public IP addresses, and ports associated with the peer's network interfaces.
Exchange of ICE Candidates:
The peers exchange their local ICE candidates with each other through a signaling mechanism. This signaling can be done using WebSocket, HTTP, or any other suitable method.
The exchanged ICE candidates include information about the network addresses and ports of each peer.
Remote ICE Candidate Gathering:
Upon receiving the remote peer's ICE candidates, each peer attempts to gather additional information about the remote peer's network connectivity.
The peer sends connectivity checks to the remote peer's ICE candidates to determine their reachability and connectivity status. These checks involve sending STUN (Session Traversal Utilities for NAT) binding requests to the candidate addresses and waiting for responses.
Connectivity Checks:
The peers perform connectivity checks with the remote ICE candidates to assess their suitability for establishing a direct peer-to-peer connection.
Each peer evaluates the success of the connectivity checks and selects the remote ICE candidate that offers the most efficient and reliable connection path.
If direct communication is not possible (e.g., due to symmetric NAT or firewall restrictions), the peers may fall back to using TURN (Traversal Using Relays around NAT) servers as relay candidates.
Establishment of Peer Connection:
Once the best ICE candidate is determined, the peers initiate the connection process using the selected candidate.
The peers establish a direct peer-to-peer connection over the chosen ICE candidate, enabling real-time communication.
Subsequent data transmission occurs directly between the peers over the established connection.
In summary, the ICE process in WebRTC involves the gathering, exchange, and evaluation of ICE candidates to establish a direct peer-to-peer connection between peers, overcoming network obstacles such as NAT and firewalls for efficient and reliable communication.


*/
