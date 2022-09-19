const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  try {

    if(request.body.password === undefined) {
      return response.status(400).json({
        error: 'password must be defined'
      })
    }

    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return response.status(400).json({
        error: 'username must be unique'
      })
    }

    const isValidPassword = password.length >= 3 ? true : false
    if(!isValidPassword) {
      return response.status(400).json({
        error: 'password must be at least 3 characters long'
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter