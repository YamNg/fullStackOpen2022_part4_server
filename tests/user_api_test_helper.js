const User = require('../models/user')
const bcrypt = require('bcrypt')

const initUsers = [
    {
        username: "root",
        name: "Superuser",
        password: "123456"
    },
    {
        username: "root2",
        name: "Superuser2",
        password: "234567"
    },
    {
        username: "root3",
        name: "Superuser3",
        password: "345678"
    }
]

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const initUsersToDb = async () => {
    await User.deleteMany({})
    await Promise.all( 
        initUsers.map(async tmpUser => {
            const { username, name, password } = tmpUser
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(password, saltRounds)

            const user = new User({
                username,
                name,
                passwordHash,
            })

            await user.save()
        })
    )
}


module.exports = {
    initUsers, usersInDb, initUsersToDb
}