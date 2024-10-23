let userQuestions = [];  // Armazena as perguntas do usuário
let aiResponses = [];    // Armazena as respostas da IA
let canSendMessage = true; // Controla se o envio de mensagem é permitido
let shouldScroll = true; // Controla se o chat deve rolar automaticamente para o fim
let ai_mode = 'normal'

// Adicionando a verificação do Local Storage
if (!localStorage.getItem('questionCount')) {
  localStorage.setItem('questionCount', 0);
}

// Monitorar o evento de rolagem no chatArea
const chatArea = document.getElementById('chatArea');
chatArea.addEventListener('scroll', function() {
  const isAtBottom = Math.abs(chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight) < 10;
  shouldScroll = isAtBottom;
});

// Adiciona event listener para o botão e tecla Enter
document.getElementById('sendButton').addEventListener('click', function() {
  if (canSendMessage) {
    sendMessage();
  }
});

document.getElementById('userInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && canSendMessage && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const message = userInput.value.trim();
  if (!message) return;

  // Verificar o número de perguntas feitas
  let questionCount = parseInt(localStorage.getItem('questionCount'));

  if (questionCount >= 4) {


    const firstOverflow = document.getElementById('firstOverflow');
    if (firstOverflow.style.display != 'none') {
      firstOverflow.style.display = 'none';
    }
    
    document.getElementById('viewerSection').style.display = 'none'
    document.getElementById('funnelsViewer').classList.remove('ghost') 

    return; 
  }

  // Desabilita o envio de novas mensagens
  canSendMessage = false;
  sendButton.style.opacity = '0.5';

  // Limpa o input e a mensagem de boas-vindas
  userInput.value = '';
  const messageBox = document.getElementById('messageBox');
  if (messageBox) {
    messageBox.style.display = 'none';
    chatArea.style.display = 'flex';
  }

  // Exibe a mensagem do usuário no chat
  const userMessage = document.createElement('div');
  userMessage.classList.add('user-message');
  userMessage.innerHTML = `
    <div class="text">${message}</div>
  `;
  chatArea.appendChild(userMessage);

  // Adiciona o loading
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('bot-response');
  loadingDiv.innerHTML = `
  <div class="text">
    <div class="loading">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>
     </div>
  `;
  chatArea.appendChild(loadingDiv);

  // Adiciona a pergunta do usuário no array de perguntas
  userQuestions.push(message);

  // Atualiza o contador de perguntas no Local Storage
  questionCount += 1;

  const firstOverflow = document.getElementById('firstOverflow');
  if (firstOverflow.style.display != 'none') {
    firstOverflow.style.display = 'none';
  }
  

  localStorage.setItem('questionCount', questionCount);

  // Envia a mensagem e os arrays de perguntas e respostas para o webhook do n8n
  fetch('https://webhook.workez.online/webhook/obizillaFunnels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      userQuestions: userQuestions,
      aiResponses: aiResponses,
      ai_mode: ai_mode,
      questionCount: questionCount
    })
  })
  .then(response => response.json())
  .then(data => {
    chatArea.removeChild(loadingDiv);

    const botResponse = document.createElement('div');
    botResponse.classList.add('bot-response');
    botResponse.innerHTML = 
      `<div class="text"></div>`;
    chatArea.appendChild(botResponse);

    let botText;
    
    if (data.choices && data.choices[0].message && data.choices[0].message.content) {
      botText = data.choices[0].message.content;
      chatArea.scrollTop = chatArea.scrollHeight;
    } else if (data.message && data.message.content) {
      botText = data.message.content;
    } 
    else if ( data.trialEnded ){
      
      const firstOverflow = document.getElementById('firstOverflow');
      if (firstOverflow.style.display != 'none') {
        firstOverflow.style.display = 'none';
      }

      document.getElementById('viewerSection').style.display = 'none'
      document.getElementById('funnelsViewer').classList.remove('ghost')
      return 
    }
    else {
      botText = "Texto não disponível";
    }


/*     let botHtml = convertMarkdownToHtml(botText.replace(/\\n/g, '\n'));
 */

ai_mode = (data.obizillaSettings && data.obizillaSettings.ai_mode) ? data.obizillaSettings.ai_mode : "normal";

    
    aiResponses.push(botText);

    typeHtml(botResponse.querySelector('.text'), botText, 5);

    canSendMessage = true;
    sendButton.style.opacity = '1';
  })
  .catch(error => {
    console.error('Erro:', error);
    chatArea.removeChild(loadingDiv);

    const botResponse = document.createElement('div');
    botResponse.classList.add('bot-response');
    botResponse.innerHTML = `
      <div class="icon"></div>
      <div class="text">Ocorreu um erro. Tente novamente.</div>
    `;
    chatArea.appendChild(botResponse);

    canSendMessage = true;
    sendButton.style.opacity = '1';
  });

  setTimeout(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 100);
}

function convertMarkdownToHtml(markdown) {
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n\s*\n/g, '<br><br>');
  return html.trim();
}

function typeHtml(element, html, delay) {
  let i = 0;
  element.innerHTML = '';
  const interval = setInterval(() => {
    element.innerHTML = html.substring(0, i) + '_';
    i++;
    if (shouldScroll) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    if (i > html.length) {
      clearInterval(interval);
      element.innerHTML = html;
      if (shouldScroll) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    }
  }, delay);
}

const userInput = document.getElementById('userInput');

document.querySelector('.chatinput-container').addEventListener('click', function() {
  document.querySelector('#userInput').focus();
});


userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  const scrollHeight = this.scrollHeight;

  if (scrollHeight <= 600) {
    this.style.height = scrollHeight + 'px';
    this.style.overflowY = 'hidden';
  } else {
    this.style.height = '600px';
    this.style.overflowY = 'auto';
  }
});



