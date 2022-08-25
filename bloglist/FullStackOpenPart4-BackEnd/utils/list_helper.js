const dummy = (blogs) => {
    console.log('dummy blogs:', blogs)
    return 1
}

const totalLikes = (blogs) => {
    let total = 0
    blogs.forEach((blog) => {
        total += blog.likes
    })
    return total
}

const favoriteBlog = (blogs) => {
    let max = 0
    let maxBlog = blogs[0]
    blogs.forEach((blog) => {
        if (blog.likes > max) {
            max = blog.likes
            maxBlog = blog
        }
    })
    console.log('favoriteBlog:', maxBlog)
    // Remove unnecessary properties from the object
    delete maxBlog.__v && delete maxBlog._id && delete maxBlog.url
    return maxBlog
}

const mostBlogs = (blogs) => {
    const lodash = require('lodash')
    let maxBlogs = 0
    let maxAuthor = ''

    // Create a list of authors and their number of occurrences using Lodash
    let authors = lodash.countBy(blogs, 'author')
    console.log('authors:', authors)

    for (let author in authors) {
        if (authors[author] > maxBlogs) {
            maxBlogs = authors[author]
            maxAuthor = author
        }
    }

    console.log('mostBlogs:', maxAuthor, ',', maxBlogs)
    return {
        author: maxAuthor,
        blogs: maxBlogs,
    }
}

const mostLikes = (blogs) => {
    const lodash = require('lodash')
    // Create a list of unique authors using Lodash
    const authors = lodash.uniq(blogs.map((blog) => blog.author))
    console.log('authors:', authors)

    let maxAuthor = ''
    let maxLikes = 0

    // For each author, sum the total likes of their blogs
    authors.forEach((author) => {
        // Create a list of blogs for the current author
        const blogsForAuthor = blogs.filter((blog) => blog.author === author)
        console.log('blogsForAuthor:', blogsForAuthor)

        let authorLikes = 0
        blogsForAuthor.forEach((blog) => {
            authorLikes += blog.likes
        })

        // Check if the current author has more likes than the previous author
        if (authorLikes > maxLikes) {
            maxLikes = authorLikes
            maxAuthor = author
        }
    })

    console.log('mostLikes:', maxAuthor, ',', maxLikes)
    return {
        author: maxAuthor,
        likes: maxLikes,
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}
