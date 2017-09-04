function setupUserList(){
   addUser(setupCLC());
   addUser(setupDShinja());
   addUser(setupELisa());
   document.getElementById('userListRegion').style.visibility = "visible";
   }

function getUserList(){
   var usernamesList = new Array();
   for (i=0; i < userArray.length; i++){
      usernamesList.push(userArray[i].name);
      }
   usernamesList.push(userName);
   return usernamesList;
   }

function addUser(userObj){
   userArray.push(userObj);
   targetNode = document.getElementById("userListRegion");
   liNode = document.createElement("li");
   liNode.textContent = userObj.name;
   liNode.innerText = userObj.name; //Use innerText for IE compatibility
   targetNode.appendChild(liNode);
   }

function moreUsers(){
   addUser(setupKnightmare());
   putStringInChat(userArray[userArray.length-1].name + " joined the channel.");
   addUser(setupStairway2Cali());
   putStringInChat(userArray[userArray.length-1].name + " joined the channel.");
   addUser(setupGlassK());
   putStringInChat(userArray[userArray.length-1].name + " joined the channel.");
   }

function fewerUsers(){
   var numberOfUsersToRemove = 3;
   while (aiResponses.length > 0){
      putStringInChat(aiResponses.shift());   
      }
   for (i=0; i < numberOfUsersToRemove; i++){
      putStringInChat(userArray.pop().name + " left the channel.");
      }
   targetNode = document.getElementById("userListRegion");
   for (i=0; i < numberOfUsersToRemove; i++){
      targetNode.removeChild(targetNode.lastChild);
      }
   }
