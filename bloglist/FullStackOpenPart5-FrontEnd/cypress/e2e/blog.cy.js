describe('Blog testing', () => {
    beforeEach(function () {
        cy.visit('http://localhost:3000')
    })

    it('Login for is visible', () => {
        cy.get('#username').should('be.visible')
        cy.get('#password').should('be.visible')
        cy.contains('login').should('be.visible')
    })

    describe('Login', () => {
        beforeEach(function () {
            cy.request('POST', 'http://localhost:3003/api/testing/reset')
            // User that is added to the database before each test
            const user = {
                name: 'root',
                username: 'root',
                password: 'secret',
            }
            cy.request('POST', 'http://localhost:3003/api/users/', user)
        })
        it('succeeds with correct credentials', () => {
            cy.get('#username').type('root')
            cy.get('#password').type('secret')
            cy.contains('login').click()
            cy.contains('root logged in')
        })

        it('fails with wrong credentials', () => {
            cy.get('#username').type('root')
            cy.get('#password').type('wrong')
            cy.contains('login').click()
            cy.get('.error').contains('Wrong username or password')
            // Check that the error is displayed in red
            cy.get('.error').should('have.css', 'color', 'rgb(255, 0, 0)')
        })
    })

    describe('When logged in', () => {
        // Create a user before the tests
        before(function () {
            cy.request('POST', 'http://localhost:3003/api/testing/reset')
            // User that is added to the database before each test
            const user = {
                name: 'root',
                username: 'root',
                password: 'secret',
            }
            cy.request('POST', 'http://localhost:3003/api/users/', user)
        })

        // Login function for the root user
        function loginRoot() {
            cy.get('#username').type('root')
            cy.get('#password').type('secret')
            cy.contains('login').click()
            cy.contains('root logged in')
        }

        it('A blog can be created', () => {
            loginRoot()
            cy.contains('Add a new blog').click()
            cy.get('#title').type('Test title')
            cy.get('#author').type('Robert C. Martin')
            cy.get('#url').type('https://www.robertcmartin.com/')
            // Specify the test to look into the form element for the button
            // There is a title that contains the word 'create' outside the form that the test will default to
            cy.get('form').contains('create').click()
            // Same logic for the article element
            cy.get('article').contains('Test title')
        })

        it('User can like a blog', () => {
            loginRoot()
            cy.contains('Expand').click()
            const initialLikes = 0
            cy.contains('Like').click()
            // Assert that the likes count is increased by 1
            cy.contains(`${initialLikes + 1} likes`)
        })
        it('User can remove their own blog', () => {
            loginRoot()
            cy.contains('Expand').click()
            cy.contains('Remove').click()
            // Check for the notification
            cy.contains('Test title by Robert C. Martin removed')
            // Articles should not exist anymore
            cy.get('article').should('not.exist')
        })
        it('The blogs are sorted by the amount of likes', () => {
            loginRoot()

            // Create the first blog
            cy.contains('Add a new blog').click()
            cy.get('#title').type('The title with the most likes')
            cy.get('#author').type('Robert C. Martin')
            cy.get('#url').type('https://www.robertcmartin.com/')
            cy.get('form').contains('create').click()

            // Create the second blog
            cy.contains('Add a new blog').click()
            cy.get('#title').type('The title with the second most likes')
            cy.get('#author').type('Robert C. Martin')
            cy.get('#url').type('https://www.robertcmartin.com/')
            cy.get('form').contains('create').click()
            cy.wait(500)

            // Like the first blog twice, and the second blog once
            // Wait time is needed to load the DOM elements
            cy.get('article').eq(0).contains('Expand').click()
            cy.get('article').eq(0).contains('Like').click()
            cy.wait(250)
            cy.get('article').eq(0).contains('Expand').click()
            cy.get('article').eq(0).contains('Like').click()
            cy.wait(250)
            cy.get('article').eq(1).contains('Expand').click()
            cy.get('article').eq(1).contains('Like').click()
            // The first blog should be the one with the most likes, and not the most recently liked
            cy.get('article').eq(0).contains('The title with the most likes')
        })

        describe('with multiple users', () => {
            before(function () {
                cy.request('POST', 'http://localhost:3003/api/testing/reset')
                // User that is added to the database before each test
                const user = {
                    name: 'root',
                    username: 'root',
                    password: 'secret',
                }
                cy.request('POST', 'http://localhost:3003/api/users/', user)
            })
            it('The first user can add a blog', () => {
                loginRoot()
                cy.contains('Add a new blog').click()
                cy.get('#title').type('Test title')
                cy.get('#author').type('Robert C. Martin')
                cy.get('#url').type('https://www.robertcmartin.com/')
                // Specify the test to look into the form element for the button
                // There is a title that contains the word 'create' outside the form that the test will default to
                cy.get('form').contains('create').click()
                // Same logic for the article element
                cy.get('article').contains('Test title')
            })

            it('Second user can be added to the database', () => {
                const user2 = {
                    name: 'user2',
                    username: 'user2',
                    password: 'secret',
                }
                cy.request('POST', 'http://localhost:3003/api/users/', user2)
            })

            it("User can not remove another user's blog", () => {
                cy.get('#username').type('user2')
                cy.get('#password').type('secret')
                cy.contains('login').click()
                cy.contains('user2 logged in')
                cy.contains('Expand').click()
                cy.contains('Remove').click()
                cy.contains(
                    'Test title by Robert C. Martin could not be removed'
                )
            })
        })
    })
})
