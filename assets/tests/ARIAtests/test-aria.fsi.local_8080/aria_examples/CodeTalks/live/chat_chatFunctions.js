function takeName(){
   userName = document.getElementById("sendText").value;
   document.getElementById("sendText").value = "";
   }

function startChat(){
   setupUserList();
   targetNode = document.getElementById("userListRegion");
   liNode = document.createElement("li");
   liNode.textContent = userName;
   liNode.innerText = userName; //User innerText for IE compatibility
   targetNode.appendChild(liNode);

   targetNode = document.getElementById("chatRegion");
   while (targetNode.childNodes.length > 0){
      targetNode.removeChild(targetNode.firstChild);
      }

   liNode = document.createElement("li");
   liNode.textContent = "Welcome " + userName + " to AJAX Chat."
   liNode.innerText = "Welcome " + userName + " to AJAX Chat." //User innerText for IE compatibility
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "Please respect the other users on this channel."
   liNode.innerText = "Please respect the other users on this channel."
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "Rules:"
   liNode.innerText = "Rules:"
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "No flaming, trolling, or flooding allowed."
   liNode.innerText = "No flaming, trolling, or flooding allowed."
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "And absolutely no spam bots!"
   liNode.innerText = "And absolutely no spam bots!"
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "Have fun!"
   liNode.innerText = "Have fun!"
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = ""
   liNode.innerText = ""
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "PS - Firefox rocks!"
   liNode.innerText = "PS - Firefox rocks!"
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "There are currently " + (1+userArray.length) + " users online." 
   liNode.innerText = "There are currently " + (1+userArray.length) + " users online." 
   targetNode.appendChild(liNode);

   liNode = document.createElement("li");
   liNode.textContent = "Users: ";
   liNode.innerText = "Users: ";
   usernamesList = getUserList(); 
   for (i=0; i<usernamesList.length; i++){
      liNode.textContent = liNode.textContent + usernamesList[i] + ". ";
      liNode.innerText = liNode.textContent + usernamesList[i] + ". ";
      }
   targetNode.appendChild(liNode);

   window.setTimeout(sendMessageFromAI,2000);
   }

function putStringInChat(messageStr){
   targetNode = document.getElementById("chatRegion");
   while (targetNode.childNodes.length > (maxLines-1)){
      targetNode.removeChild(targetNode.firstChild);
      }
   liNode = document.createElement("li");
   liNode.textContent = messageStr;
   liNode.innerText = messageStr;
   targetNode.appendChild(liNode);   
   }

function takeMessage(){
   clearStatus();
   if (userName == ""){
      if (userNameOK()){
         takeName();
         startChat();
         }
      else{
         alert(document.getElementById("statusRegion").textContent);
         }
      return;
      }
   inputStringNode = document.getElementById("sendText");
   messageString = inputStringNode.value;
   if (!inputMessageOK()){
      alert(document.getElementById("statusRegion").textContent);
      return;
      }
   putStringInChat(userName + ": " + messageString);
   inputStringNode.value = "";
   aiResponse = getAIResponse(messageString);
   if (aiResponse != ""){
      aiResponses.push(aiResponse);  
      }
   }

function sendMessageFromAI(){
   if (aiResponses.length > 0){
      if (Math.random() > .5){
         putStringInChat(aiResponses.shift());   
         }
      }
   if (Math.random() > .9){
      putStringInChat(getRandomAIMessage());
      }
   window.setTimeout(sendMessageFromAI,2000);
   }

function scrambleInputString(messageStr){
   var scrambledStr = "";
   for(i=0;i<messageStr.length;i++){
      scrambledStr = scrambledStr + String.fromCharCode(13^messageStr.charCodeAt(i));
      }
   return scrambledStr;
   }

function descrambleOutputString(messageStr){
   var descrambledStr = "";
   for(i=0;i<messageStr.length;i++){
      descrambledStr = descrambledStr + String.fromCharCode(4^messageStr.charCodeAt(i));
      }
   return descrambledStr;
   }

function getAIResponse(messageStr){
   if (!additionalUsersActive){
      if (messageStr.toLowerCase().indexOf("more users") != -1){
         additionalUsersActive = true;
         moreUsers();
         }
      }
   if (additionalUsersActive){
      if (messageStr.toLowerCase().indexOf("fewer users") != -1){
         additionalUsersActive = false;
         fewerUsers();
         }
      }
   inputStr = scrambleInputString(messageStr.toLowerCase());
   for (i=0; i < userArray.length; i++){
      for (j=0; j < userArray[i].keywords.length; j++){
         if (inputStr.indexOf(userArray[i].keywords[j]) != -1){
            return (userArray[i].name + ": " + descrambleOutputString(userArray[i].responses[j]));
            }
         }
      }
   return "";
   }
