[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Pyo_xd80)

# Mobile App Store

## Deployment
- Render is used for deployment
- URL: https://web-app-store.onrender.com

## User Credentials
1. User 1
    - Email: test@test.com
    - Password: 123
2. User 2
    - Email: test2@test2.com
    - Password: 123

## Main Features
1. File Upload:
    - Used Multer and GridFS to handle file uploads and storage in MongoDB.
    - Screenshots and APK files are stored in different collections.
2. User Authentication:
    - Implemented login, logout, and registration functionality.
    - Users must be logged in to upload or delete apps.
3. Session Management:
    - Implemented using 'cookie-session' to track logged-in users.
    - Users are redirected to the page they were trying to access after logging in.
4. Navigation:
    - Navigation links are displayed based on the user's login status.
5. App Management:
    - Users can upload apps, view details, and delete their own apps.
    - Uploaded apps include details, screenshots, and a downloadable APK file.

## Description for files

**1. Models**
- File: 'models/app.js'
    - Description: Mongoose schema for apps cluding name, description, details, apk file, screenshots, and creator to store information about uploaded new apps and associate with their respective creators.
- File: 'models/user.js'
    - Description: Mongoose schema for users cluding email and password to manage user accounts and authentication.

**2. Routes**
- File: 'routes/index.js'
    - Lines: 14-23
    - Description: Connection to MongoDB files for fetching files (used Grid)
    - Lines: 26-51
    - Description: Fetching screenshots from MongoDB for home page and app detail page (used GridFS)
    - Lines: 57-80
    - Description: 'GET /' - rendering home page using user authentication to give different home page displays based on the user's login status
        - By 'views/home.hbs' =>
            - A list of uploaded apps with a brief description and a screenshot preview of each
            - Each app has a link to the app detail page (by clicking either the name of an app or 'View Details')
            - Not logged in:
                - Navigation to 'Login' page
            - Logged in:
                - Navigation to 'My apps' and 'Upload a new app' page
    - Lines: 83-88
    - Description: 'GET /login' - rendering login page
        - If a logged in user tries to access to the login page, it redirects the user to the home page
        - By 'views/login.hbs' =>
            - Navigation to register page for the users who don't have an account
            - Navigation to home page
    - Lines: 91-105
    - Description: 'POST /login' - accepts a form with email and password and validates user's password using password validation utility('validatePassword')
        - After logging in, the user is returned to the home page with a cookie
        - If a user tries to log in from a certain page other than home page, it redirects the user with a cookie to the page that the user was trying to access after logging in.
        - By 'views/login.hbs' =>
            - If Email or password are incorrect, the page gives a message to the user about it.
    - Lines: 108-112
    - Description: 'POST /logout' - signs out the authenticated user and removes the cookie session and redirects to the home page.
    - Lines: 115-118
    - Description: 'GET /new' - rendering 'newApp' page
        - Displays a form for a new app for authenticated users
        - The size of screenshots are specified for 388px x 300px in the form
        - Navigation to home page and 'My apps' page
    - Lines: 121-162
    - Description: 'POST /new' - accepts a form of a new app including its name, descripton, detials, apk file, screenshots from authenticated users and stores them in MongoDB
        - After submitting the form, it redirects the user to the App Detail page.
    - Lines: 165-191
    - Description: 'GET /download/apk/:id' - fetching a requested apk file from MongoDB using GridFS so that users can download an apk file they requested
        - By 'views/appDetail.hbs' =>
            - When downloading an apk file, the filename is named as its app's name instead of its id
    - Lines: 194-218
    - Description: 'GET /app/:id' - rendering 'appDetail' page for an app with a requested id
        - By 'views/appDetail.hbs' =>
            - Displays the full details of the app with the id of the app including a full description and screenshot if available.
            - Navigation to home page, my app page, new app form page
                - Not logged in:
                    - No download link for apk file is shown for users not logged in
                - Logged in:
                    - A download link for apk file is shown for logged in users
    - Lines: 221-236
    - Description: 'GET /my' - rendering my app page for logged in users using user authentication
        - By 'views/myApps.hbs' =>
            - Displays a list of apps uploaded by this user
            - A delete button for each app
            - Navigation to home page, new app form page
            - Navigation('View Details') to app detail page for each app
            - If a user has no apps uploaded, the page shows a navigation button to 'upload a new app' page
    - Lines: 239-283
    - Description: 'POST /app/delete/:id' - to delete an app with a requested id
        - By clicking a delete button for a specific app, it removes the app and also all details fo the app and associated files.
    - Lines: 286-291
    - Description: 'GET /register' - rendering registeration page with a form including email and password field
        - If a logged in user tries to access to the registeration page, it redirects to home page
        - By 'views/register.hbs' =>
            - Displays register form with email and password field
            - Navigation to home page
    - Lines: 294-318
    - Description: 'POST /register' - accepts a from with email and password and creates a new user infomation with it and stores in MongoDB.
        - If a user submits a form with an existed email, it gives the user a message to re-type their email infomation.
        - After successful registering, it directs to the home page.


**3. Authentication/middleware/utility**
- File: 'utils&middleware/auth.js'
    - Description: Authentication middleware to check for a valid session for certain route handlers that are only accessible by authenticated users. Failed authentication redirects the user to login page
- File: 'utils&middleware/validatePassword.js'
    - Description: Password validation utility to verify if a user is logging in with a valid and correct passwrd that's stored in MongoDB. It's used for the 'POST /login' request.
- File: 'routes/redirectUrl.js'
    - Description: Middleware to store the redirect URL
        - This is specifically used in the post /login request so that after logging in, the user can be directed to the page that they were trying to access to.

**5. File upload**
- File: 'utils&middleware/upload.js'
    - Description: Used 'multer' and 'GridFS' middleware to handle the file uploads and store in MongoDB.
        - Apk files and screenshots are stored in different collections
        - Specific type of file is set to both apk and screenshot
            - apk should be either 'application/vnd.android.package-archive' or 'application/octet-stream'
            - Any type of screenshots are acceptable as long as their file starts with 'image/'
        - When storing the files, the filename will be named as uploaded Date + original file name

## Extra Features
1. CSS Styling for Front-end design
2. Registration page and form for a new user (login page has a link to the registration page as well)
3. Navigation bar for each page (displaying different navigations based on the user's login status)
4. Redirect functionality for users to be able to access to the page they were trying to access after logging in
5. 


