const mongoose = require('mongoose')
const helper = require('./user_api_test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
    await helper.initUsersToDb()
})

describe('when there is initially user saved', () => {
    
    test('a user can be added', async () => {
        const validUser =     {
            username: "root4",
            name: "Superuser4",
            password: "9012345"
        }
        const response = await api
                            .post('/api/users')
                            .send(validUser)
                            .expect(201)
    })

    test('return error when username is not unique', async () => {
        const invalidUser = {
            username: helper.initUsers[0].username,
            name: 'invalidUser',
            password: 'testPw'
        }
        const response = await api
                            .post('/api/users')
                            .send(invalidUser)
                            .expect(400)

        expect(response.body.error).toBe('username must be unique')
            
    })

    test('return error when username is undefined', async () => {
        const invalidUser = {
            name: 'invalidUser',
            password: 'testPw'
        }
        const response = await api
                            .post('/api/users')
                            .send(invalidUser)
                            .expect(400)

        expect(response.body.error).toBe('User validation failed: username: Path `username` is required.')
    })

    test('return error when username < 3 characters', async () => {
        const invalidUser = {
            username: 'ro',
            name: 'invalidUser',
            password: 'testPw'
        }
        const response = await api
                            .post('/api/users')
                            .send(invalidUser)
                            .expect(400)

        expect(response.body.error).toBe('User validation failed: username: Path `username` (`ro`) is shorter than the minimum allowed length (3).')
    })

    test('return error when password is undefined', async () => {
        const invalidUser = {
            username: 'root5',
            name: 'invalidUser'
        }
        const response = await api
                            .post('/api/users')
                            .send(invalidUser)
                            .expect(400)

        expect(response.body.error).toBe('password must be defined')
    })

    test('return error when password < 3 characters', async () => {
        const invalidUser = {
            username: 'root5',
            name: 'invalidUser',
            password: '12'
        }
        const response = await api
                            .post('/api/users')
                            .send(invalidUser)
                            .expect(400)

        expect(response.body.error).toBe('password must be at least 3 characters long')
    })
})

afterAll(() => {
    mongoose.connection.close()
})