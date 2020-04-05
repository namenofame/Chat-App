const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages.js')
const {adduser,removeUser,getUser,getUsersInRoom}=require('./utils/users')


const app=express()
const server=http.createServer(app);
const port=process.env.PORT||3000
const io=socketio(server)

publicPath=path.join(__dirname,'../public')
app.use(express.static(publicPath));

let count=0;
io.on('connection',(socket)=>{
    console.log('new connection is done')
    
    socket.on('sendMessage',function (message,callback){
        const filter=new Filter()
        if(filter.isProfane(message))
        {
            return callback('profanity is not allowed')
        }
        const user=getUser(socket.id)
        if(user)
        {

            io.to(user.room).emit('sendMessageToAll',generateMessage(user.username,message))
        }
        
        
        callback()
    })
    socket.on('disconnect',()=>{

        const user=removeUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('sendMessageToAll',generateMessage('Admin',user.username+' has left'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

       
    })
    socket.on('shareLocation',(coord,callback)=>{
        const user=getUser(socket.id)
        if(user)
        {
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,'https://google.com/maps?q='+coord.latitude+','+coord.longitude))
        }
        callback()
    })
    socket.on('join',({username,room},callback)=>{
        console.log(room)
        const {error,user}=adduser({id:socket.id,username,room})
        if(error)
        {
            return callback(error)
        }
        socket.join(user.room)
        let welcome_message='Welcome!'
        socket.emit('sendMessageToAll',generateMessage('Admin',welcome_message))
        socket.broadcast.to(user.room).emit('sendMessageToAll',generateMessage('Admin',user.username+' has joined'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    // socket.emit('updatedCount',count)
    // socket.on('increment',()=>{
    //     count++;
    //     io.emit('updatedCount',count)
    // })
})



server.listen(port,()=>{
    console.log('server is up on port :',port)
})