# Tourify Backend Server

## Description

This is the backend server for the [Tourify](https://github.com/BorhanSaflo/tourify) project. It is built using Node.js and Express.js. It is used to handle the API requests from the frontend and interact with the database.

## API Endpoints

### Authentication

The server uses JWT for authentication. The following endpoints are used for authentication:

1.  **`/api/auth/register`**

    - **Method**: POST
    - **Description**: Creates a new user account.
    - **Body**:
      ```json
      {
        "name": "string",
        "email": "string",
        "password": "string"
      }
      ```

1.  **`/api/auth/login`**

    - **Method**: POST
    - **Description**: Logs in a user and returns a JWT token.
    - **Body**:

    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```

1.  **`/api/auth/logout`**

    - **Method**: POST
    - **Description**: Logs out a user by invalidating the JWT token.

1.  **`/api/auth/refresh`** - **Method**: POST - **Description**: Refreshes the JWT token.

### Destination

1. **`/api/destination/:id`**

   - **Method**: GET
   - **Description**: Returns the details of a destination with the specified id. The details include the destination's name, country, description, images, likes, dislikes, isLiked, isDisliked, isSaved, and reviews.

1. **`/api/destination/:id/like`**

   - **Method**: POST
   - **Description**: Likes a destination with the specified id. If the destination is already liked by the user, the like will be removed.

1. **`/api/destination/:id/dislike`**

   - **Method**: POST
   - **Description**: Dislikes a destination with the specified id. If the destination is already disliked by the user, the dislike will be removed.

1. **`/api/destination/:id/save`**

   - **Method**: POST
   - **Description**: Saves a destination with the specified id. If the destination is already saved by the user, the save will be removed.

### User

1. **`/api/user/info`**

   - **Method**: GET
   - **Description**: Returns the details of the currently logged-in user.

1. **`/api/user/saved`**

   - **Method**: GET
   - **Description**: Returns a list of destinations that the user has saved.

1. **`/api/user/liked`**

   - **Method**: GET
   - **Description**: Returns a list of destinations that the user has liked.

1. **`/api/user/disliked`**
   - **Method**: GET
   - **Description**: Returns a list of destinations that the user has disliked.

### Home

1. **`/api/home/featured`**

   - **Method**: GET
   - **Description**: Returns a featured destination. Featured destinations are updated every day.

1. **`/api/home/trending`**

   - **Method**: GET
   - **Description**: Returns a list of the trending destinations. Trending destinations are those that have been viewed the most in the last 7 days.

1. **`/api/home/most-liked`**

   - **Method**: GET
   - **Description**: Returns a list of the most liked destinations.

1. **`/api/home/most-viewed`**

   - **Method**: GET
   - **Description**: Returns a list of the most viewed destinations.

### Search

1. **`/api/search/:query`**

   - **Method**: GET
   - **Description**: Returns a list of destinations (name, country, and description) that match the search query.

### Explore

1. **`/api/explore?tags=tag1,tag2,tag3`**

   - **Method**: GET
   - **Description**: Returns a list of destinations that the user might like based on their preferences.
