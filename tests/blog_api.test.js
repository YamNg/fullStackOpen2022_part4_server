const mongoose = require('mongoose')
const helper = require('./blog_api_test_helper')
const userHelper = require('./user_api_test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await userHelper.initUsersToDb()
    const users = await User.find({})

    await Blog.deleteMany({})
    const blogObjects = helper.initBlogs.map((blog, idx) => {
        return new Blog({
            ...blog,
            user: users[(idx % (users.length))]._id
        }) 
    })
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})


describe('when there is initially some notes saved', () => {
    test('blogs are returned as json', async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('blogs unique identifier property is named id', async () => {
        const blogs = (await api.get('/api/blogs')).body
        blogs.forEach((blog) => expect(blog.id).toBeDefined())
    })
})


describe('addition of a new blog', () => {
    test('a blog can be added', async () => {

        const user = userHelper.initUsers[0]
        const result = await api.post('/api/login')
            .send({
                username: user.username,
                password: user.password
            })
        const token = JSON.parse(result.text).token
        
        const newBlog = {
            title: "Test Save Blog Post",
            author: "Yam Ng",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
        }
        
        await api
            .post('/api/blogs')
            .send(newBlog)
            .auth(token, { type: 'bearer' })
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const resultingBlogList = await helper.blogsInDb()
        expect(resultingBlogList).toHaveLength(helper.initBlogs.length + 1)
    
        const titles = resultingBlogList.map(n => n.title)
        expect(titles).toContain(
            'Test Save Blog Post'
        )
    })
    
    test('blogs likes property default to value 0', async () => {
        const blogs = (await api.get('/api/blogs')).body
    
        const titles = blogs.map(n => n.title)
        expect(titles).toContain(
            'Test Blog Post'
        )
    
        blogs.forEach((blog) => {
            expect(blog.likes).toBeDefined()
    
            if(blogs.title === 'Test Blog Post'){
                expect(blog.likes).toEqual(0)
            }
        })
    })
    
    test('blogs creation return fail response when missing required fields', async () => {

        const user = userHelper.initUsers[0]
        const result = await api.post('/api/login')
            .send({
                username: user.username,
                password: user.password
            })
        const token = JSON.parse(result.text).token

        const newBlogWithoutTitle = {
            author: "Yam Ng",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
        }
        await api
            .post('/api/blogs')
            .send(newBlogWithoutTitle)
            .auth(token, { type: 'bearer' })
            .expect(400)
    
        const newBlogWithoutUrl = {
            title: "Test Save Blog Post",
            author: "Yam Ng"
        }
        await api
            .post('/api/blogs')
            .send(newBlogWithoutUrl)
            .auth(token, { type: 'bearer' })
            .expect(400)
    
        const newBlogWithoutAll = {
            author: "Yam Ng"
        }
        await api
            .post('/api/blogs')
            .send(newBlogWithoutAll)
            .auth(token, { type: 'bearer' })
            .expect(400)
    })
})


describe('deletion of a note', () => {
    test('blog can be deleted', async () => {
        const blogAtStart = await helper.blogsInDb()
        const blogToDelete = blogAtStart[0]

        const user = userHelper.initUsers[0]
        const result = await api.post('/api/login')
            .send({
                username: user.username,
                password: user.password
            })
        const token = JSON.parse(result.text).token
      
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .auth(token, { type: 'bearer' })
          .expect(204)
      
        const blogsAtEnd = await helper.blogsInDb()
      
        expect(blogsAtEnd).toHaveLength(
          helper.initBlogs.length - 1
        )
      
        const contents = blogsAtEnd.map(r => r.title)
      
        expect(contents).not.toContain(blogToDelete.title)
    })
})

describe('update of a note', () => {
    test('blog likes can be updated', async () => {
        const blogAtStart = await helper.blogsInDb()
        const blogToUpdate = blogAtStart[0]
    
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send({ likes: 100 })
            .expect(200)
    
        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlog = blogsAtEnd.filter((blog) => blog.id === blogToUpdate.id)[0]
        expect(updatedBlog.likes).toEqual(100)
    })
})

afterAll(() => {
    mongoose.connection.close()
})