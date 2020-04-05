const users=[]


const adduser=({id,username,room})=>{
    username=username.trim().toLowerCase()
    console.log(room)
    room=room.trim().toLowerCase()

    if(!username || !room)
    {
        return {error:'Username and Room needed tobe provided!'}
    }

    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    if(existingUser)
    {
        return {error:'Username is in use!'}
    }

    const user={id,username,room}
    users.push(user)
    return {user}
}


const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })
    if(index!=-1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser=(id)=>{
    const user=users.find((user)=>{
        return user.id===id
    })
    return user
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    const usersInRoom=users.filter((user)=>{
        return user.room===room
    })
    if(usersInRoom)
    {
        return usersInRoom
    }
    return []
}

module.exports={
    adduser,
    removeUser,
    getUser,
    getUsersInRoom
}