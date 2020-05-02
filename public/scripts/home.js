var chatButton = document.getElementById('chat-button')
let id;
let socket;

function addMessage(content){
  messageDiv = document.createElement('div')
  message = document.createElement('p')
  message.innerText = content
  messageDiv.append(message)
  messageDiv.scrollIntoView(false)
  document.getElementById('messages').append(messageDiv)
}
function something(){
  socket.on('none',()=>{
    addMessage('Retrying...')
    setTimeout(()=>{something()},2000)
    socket.removeListener('none')
  })
  socket.emit('new')
}

chatButton.addEventListener('click',(e)=>{
  e.preventDefault()
  script = document.createElement('script')
  script.src = '/socket.io/socket.io.js'
  script.onload = ()=>{
    socket = io()
    window.onunload = ()=>{
      socket.emit('leave')
    }
    socket.emit('new')
    socket.on('disconnect',()=>{
      addMessage(`The user disconnected. Please reload`)
    })
    socket.on('message',(data)=>{
      addMessage(`Human: ${data.message}`)
    })
    addMessage('SEARCHING FOR SOMEONE')
    socket.on('disconnect',()=>{
      id 
    })
    socket.on('none',()=>{
      addMessage(`Couldn't find anyone, retrying...`)
      socket.removeListener('none')
      something()
    })
    socket.on('new',(data)=>{
      addMessage(`Connected to ${data.id}`)
      id = data.id
    })
    socket.on('error',()=>{
      addMessage('There was an error')
    })
    document.getElementById('home').hidden = true
    document.getElementById('chat').hidden = false
    document.getElementById('message').focus()
  }
  document.body.append(script)
  
})

document.getElementById('messageForm').addEventListener('submit',(e)=>{
  e.preventDefault()
  m = document.getElementById('message').value
  document.getElementById('message').value = ''
  if(id == undefined || id == null){
    return
  }
  if(socket == undefined || socket == null){
    return
  }
  socket.emit('message',{id, message: m})
})
