const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((prev, curr) => {
        return prev + curr.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0)
        return null

    const result = blogs.reduce((prev, curr) => {
        if(prev.likes < curr.likes)
            return curr
        return prev
    })

    const {title, author, likes} = result
    return {title, author, likes}
}

const mostBlogs = (blogs) => {
    if(blogs.length === 0)
        return null
    
    const result = _
        .chain(blogs)
        .groupBy('author')
        .reduce((result, value, key) => {
            if(_.isEmpty(result) || value.length > result.blogs){
                return { author: key, blogs: value.length }
            }
        }, {})
        .value()
        
    return result
}

const mostLikes = (blogs) => {
    if(blogs.length === 0)
        return null

    const result = _
        .chain(blogs)
        .groupBy('author')
        .map((value, key) => {
            return { author: key, likes: _.sumBy(value, 'likes')}
        })
        .maxBy('likes')
        .value()
    
    console.log(result)
    return result
}

module.exports = {
   dummy,
   totalLikes,
   favoriteBlog,
   mostBlogs,
   mostLikes
}