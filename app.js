const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blog')
const logger = require('./utils/logger')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(express.json())
app.use('/api/blogs', blogRouter)


module.exports = app