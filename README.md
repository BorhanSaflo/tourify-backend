# Tourify Backend Server

## Description

This is the backend server for the [Tourify](https://github.com/BorhanSaflo/tourify) project. It is built using Node.js and Express.js. It is used to handle the API requests from the frontend and interact with the database.

## API Endpoints

1. **`/api/destinations/trending`**

   - **Method**: GET
   - **Description**: Returns a list of the trending destinations. Trending destinations are those that have been viewed the most in the last 7 days.

2. **`/api/destinations/most-liked`**

   - **Method**: GET
   - **Description**: Returns a list of the most liked destinations.

3. **`/api/destinations/most-viewed`**

   - **Method**: GET
   - **Description**: Returns a list of the most viewed destinations.

4. **`/api/destination/:id`**

   - **Method**: GET
   - **Description**: Returns the details of a destination with the specified id. The details include the destination's name, country, description, images, and reviews.

5. **`/api/search`**
   - **Method**: POST
   - **Description**: Returns a list of destinations (name, country, and description) that match the search query.
   - **Body**:
     ```json
     {
       "query": "string"
     }
     ```
