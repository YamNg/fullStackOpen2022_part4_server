const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response, next) => {
    try {
      const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
      response.json(blogs)
    } catch (error) {
      next(error)
    }
})
  
blogRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    ...body,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {

  const user = request.user

  const blog = await Blog.findById(request.params.id)
  if ( blog.user.toString() === user._id.toString() ){
    await Blog.findByIdAndRemove(request.params.id)
    user.blogs = user.blogs.filter(blog => blog.toString() !== request.params.id )
    await user.save()

    return response.status(204).end()
  } else {
    return response.status(401).json({ error: 'Unauthorised resource' })
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  try{
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})


module.exports = blogRouter