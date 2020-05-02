const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const port = process.env.PORT || 3000
const fs = require('fs')
people = {}

app = express()
server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))

app.get('/',(req,res)=>{
  fs.createReadStream('public/home.html').pipe(res)
})
server.listen(port,()=>{
  console.log(`Listening on port ${port}`)
})

const io = require('socket.io')(server)

io.on('connection',(socket)=>{
  people[socket.id] = {
    id: socket.id,
    inChat: false,
    waiting: false,
    user: null
  }
  socket.on('message',(data)=>{
    if(data.id == null){
      return
    }
    socket.emit('message',data)
    io.to(data.id).emit('message',data)
  })
  socket.on('new',()=>{
    if(people[socket.id].inChat){
      socket.emit('new',{id: people[socket.id].user})
      return
    }
    people[socket.id].waiting = true
    if(Object.keys(io.sockets.connected).length == 1){
      socket.emit('none')
    }else{
      peoplearray = Object.keys(people).map(key => people[key])
      peoplearray.forEach((context)=>{
        if(context.inChat){
          socket.emit('none')
        }else{
          if(context.id == socket.id){
            socket.emit('none')
            return
          }
          socket.emit('new',{id: context.id})
          io.to(context.id).emit('new',{id: socket.id})
          people[socket.id].inChat = true
          people[context.id].inChat = true
          people[socket.id].user = context.id
          people[context.id].user = socket.id
        }
      })
    }
  })
  socket.on('leave',()=>{
    io.to(people[socket.id].user).emit('disconnect')
    delete people[socket.id]
  })
})
