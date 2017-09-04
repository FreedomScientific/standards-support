function userNameOK(){
   inputStringNode = document.getElementById("sendText");
   messageString = inputStringNode.value;
   if (userName == ""){
      if (messageString.length > 16){
         giveWarning("Warning: The user name that you have chosen is too long.");
         return false;
         }
      if ((messageString.indexOf(" ") != -1) || (messageString.indexOf("\t") != -1)){
         giveWarning("Warning: The user name may not contain whitespace.");
         return false;
         }
      }
   return true;
   }

function inputMessageOK(){
   inputStringNode = document.getElementById("sendText");
   messageString = inputStringNode.value;
   if (userName != ""){
      if (messageString.length > 72){
         giveWarning("Warning: The message you are attempting to send is too long and would flood the other users. Please shorten your message before sending it.");
         return false;
         }
      if (messageString.length < 1){
         giveWarning("Warning: You may not send a blank message.");
         return false;
         }
      }
   return true;
   }

function runValidator(){
   clearStatus();
   userNameOK();
   inputMessageOK();
   }