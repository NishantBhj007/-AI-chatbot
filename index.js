let chatBody=document.querySelector('.chat-body')
let messageInput=document.querySelector('.message-input')
let sendMessageButton=document.querySelector('#send-message')
let fileInput=document.querySelector('#file-input')
let fileUploadWrapper=document.querySelector('.file-upload-wrapper')
let fileCancelButton=document.querySelector('#file-cancel')
let chatbotToggler=document.querySelector('#chatbot-toggler')
let closeChatbot=document.querySelector('#close-chatbot')

 let newapi='AIzaSyAWOLTDJeyJ9_gVLA2AoVG21StPoQVU-bI'
const GEMINI_API_KEY='AIzaSyCBF8PALgF35fpY2YsAWUotR1PfZdF-CY4';

const api=`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
 
let userData={
    message:null,
    file:{
        data:null,
        mime_type:null
    }
}
const chatHistory=[];
const initialInputHeight=messageInput.scrollHeight;


const createMessageElement=(content,...classes)=>{
const div=document.createElement('div');
div.classList.add('message',...classes);
div.innerHTML=content; 
return div;
}

const generateBotResponse=async(incomingMessageDiv)=>{
    const messageElement=incomingMessageDiv.querySelector('.message-text')
    chatHistory.push({
        role:'user',
        parts:[{text: userData.message}, ...(userData.file.data?[{inline_data:userData.file}]:
[])]
})
    const requestOption={
        method:'POST',
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            contents:chatHistory
    })
    }
try {
    const response=await fetch(api,requestOption);
    const data= await response.json()
    if(!response.ok) throw new Error(data.error.message)
        console.log(data);
        const apiResponseText=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        messageElement.innerText=apiResponseText;

        chatHistory.push({
            role:'model',
            parts:[{text: userData.message}, ...(userData.file.data?[{inline_data:userData.file}]:
    [])]})


} catch (error) {
    console.log(error);    
    messageElement.innerText=error.message;
    messageElement.style.color="#ff0000";
} finally{
    userData.file={};
    incomingMessageDiv.classList.remove('thinking')
    chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
}
}


const handleOutgoingMessage=(e)=>{
    e.preventDefault();
    userData.message=messageInput.value.trim();
    messageInput.value='';
    fileUploadWrapper.classList.remove('file-uploaded');
    messageInput.dispatchEvent(new Event('input'))


    // create and display user message
const messageContent=` <div class="message-text"></div>
${userData.file.data ?`<img src="data:${userData.file.mime_type};base64,${userData.file.data}"class="attachment"/>`:""}`;
                          
 const outgoingMessageDiv=createMessageElement(messageContent,'user-message')
 outgoingMessageDiv.querySelector('.message-text').innerText=userData.message;
chatBody.appendChild(outgoingMessageDiv)
chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});

setTimeout(()=>{
    const messageContent=` <svg  class="bot-avatar"  xmlns="http://www.w3.org/2000/svg"  width="50"  height="50"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-chatbot"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" /><path d="M9.5 9h.01" /><path d="M14.5 9h.01" /><path d="M9.5 13a3.5 3.5 0 0 0 5 0" /></svg>
    
        <div class="message-text"> 
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>`;


    const incomingMessageDiv=createMessageElement(messageContent,'bot-message','thinking')
   chatBody.appendChild(incomingMessageDiv);
   chatBody.scrollTo({top:chatBody.scrollHeight,behavior:"smooth"});
   generateBotResponse(incomingMessageDiv);
},600)
}




messageInput.addEventListener('keydown',(e)=>{
const userMessage=e.target.value.trim();
if(e.key=='Enter' && userMessage && !e.shiftKey &&window.innerWidth >768){
    handleOutgoingMessage(e);   
}
})

messageInput.addEventListener('input',()=>{
    messageInput.style.height=`${initialInputHeight}px`
    messageInput.style.height=`${messageInput.scrollHeight}px`;
    document.querySelector('.chat-form').style.borderRadius=messageInput.scrollHeight > initialInputHeight ?"15px" :'32px';
})

fileInput.addEventListener('change',()=>{
    const file=fileInput.files[0];
    if(!file)return;
    
    const reader=new FileReader();
    reader.onload=(e)=>{
        fileUploadWrapper.querySelector("img").src=e.target.result;
        fileUploadWrapper.classList.add('file-uploaded');
        const base64string=e.target.result.split(',')[1];
        userData.file={
            data:base64string,
            mime_type:file.type
        }
        fileInput.value='';
        
    }
    reader.readAsDataURL(file)
    
})
fileCancelButton.addEventListener('click',()=>{
    userData.file={};
    fileUploadWrapper.classList.remove('file-uploaded')
})

const picker=new EmojiMart.Picker({
  theme:'light',
  skinTonePosition:'none',
  previewPosition:'none',
  onEmojiSelect:(emoji)=>{
    const{selectionStart:start,selectionEnd:end}=messageInput;
    messageInput.setRangeText(emoji.native,start,end,'end');
    messageInput.focus();
  },
  onClickOutside:(e)=>{
    if(e.target.id==='emoji-picker'){
        document.body.classList.toggle('show-emoji-picker')
    }else{
        document.body.classList.remove('show-emoji-picker')
    }
  }
});

document.querySelector('.chat-form').appendChild(picker);

sendMessageButton.addEventListener('click',(e)=>handleOutgoingMessage(e))
document.querySelector('#file-upload').addEventListener('click',()=>fileInput.click());

chatbotToggler.addEventListener('click',()=>document.body.classList.toggle('show-chatbot'))
closeChatbot.addEventListener('click',()=>document.body.classList.remove('show-chatbot'))