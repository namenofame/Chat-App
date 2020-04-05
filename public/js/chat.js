const socket=io()



const input=document.querySelector('input')
const messagetemplate=document.querySelector('#message-template').innerHTML
const messages=document.querySelector('#messages')
const form=document.querySelector('#message-form')
const formButton=form.querySelector('#send_btn')
const shareLocationBtn=document.querySelector('#send-location')
const locationtemplate=document.querySelector('#location-template').innerHTML
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML
const sidebar=document.querySelector('#sidebar')

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
socket.on('message',(message)=>{
    console.log(message.text)
   
})

const autoscroll=()=>{
    const newmessage=messages.lastElementChild

    const newmessagestyles=getComputedStyle(newmessage)
    const newmessagemargin=parseInt(newmessagestyles.marginBottom)
    const newmessageheight=newmessagemargin+newmessage.offsetHeight

    const visibleHeight=messages.offsetHeight
    const containerHeight=messages.scrollHeight
    const scrolloffset=messages.scrollTop+visibleHeight
    if(containerHeight-newmessageheight<=scrolloffset)
    {
        messages.scrollTop=messages.scrollHeight
    }
}

form.addEventListener('submit',(e)=>{
    e.preventDefault()
    formButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage',input.value,function(error){
       formButton.removeAttribute('disabled')
       input.value=''
       input.focus()
        if(error)
        {
           return console.log(error)
        }
        console.log('new message delivered! ')
    })
})

socket.on('locationMessage',(locationurl)=>{
    //console.log(locationurl)
    const html=Mustache.render(locationtemplate,{
        username:locationurl.username,
        locationurl:locationurl.url,
        createdAt:moment(locationurl.createdAt).format('h:m a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('sendMessageToAll',(message)=>{
    //console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:m a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
   // messageField.value=message
})

shareLocationBtn.addEventListener('click',()=>{
   
    if(!navigator.geolocation)
    {
        return alert('Your browser does not support location share')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        const coor={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        shareLocationBtn.setAttribute('disabled','disabled')
        socket.emit('shareLocation',coor,function(){
            shareLocationBtn.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join',{
    username,
    room
},function(error){
    if(error)
    {
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,users
    })
    sidebar.innerHTML=html
})

// socket.on('updatedCount',(count)=>{
//     console.log('count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     socket.emit('increment')
// })