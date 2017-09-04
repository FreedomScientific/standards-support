function giveWarning(warningString){
   statusNode = document.getElementById("statusRegion");
   statusNode.textContent = warningString;
   statusNode.innerText = warningString; //Use innerText for IE compatibility
   return;
   }

function clearStatus(){
   statusNode = document.getElementById("statusRegion");
   statusNode.textContent = "";
   statusNode.innerText = ""; //Use innerText for IE compatibility
   return;
   }