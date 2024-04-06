const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const initilizeDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
  }
}

initilizeDbandServer()

const convertingDbObjectToResponseObject = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

const convertingDbObjectToResponseObject1 = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertingDbObjectToResponseObject2 = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

const convertingDbObjectToResponseObject3 = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getmovies = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id
    `
  const movies = await db.all(getmovies)
  response.send(
    movies.map(eachmovie => convertingDbObjectToResponseObject(eachmovie)),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieDetails = `
  INSERT INTO
    movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},"${movieName}","${leadActor}")
  
  
  `
  const dbResponse = await db.run(addMovieDetails)
  response.send('Movie Successfully Added')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletemovie = `
  DELETE FROM
    movie
  WHERE
    movie_id=${movieId};
  
  `
  await db.run(deletemovie)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const directorslist = `
  SELECT
     *
  FROM
    director
  ORDER BY
    director_id;
  
  `
  const directorArray = await db.all(directorslist)
  response.send(
    directorArray.map(each => convertingDbObjectToResponseObject3(each)),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const movienames = `
  SELECT
    movie_name
  FROM
    movie
  WHERE
    director_id=${directorId};


  `
  const moviesOfDirector = await db.all(movienames)
  response.send(
    moviesOfDirector.map(each => convertingDbObjectToResponseObject2(each)),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movie = `
  SELECT
     *
  FROM
    movie
  WHERE
    movie_id=${movieId};
  
  `
  const movieDetails = await db.get(movie)

  response.send(convertingDbObjectToResponseObject1(movieDetails))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const update = `
  UPDATE
    movie
  SET
    director_id=${directorId},
    movie_name="${movieName}",
    lead_actor="${leadActor}"
  WHERE
    movie_id=${movieId};
  
  `

  const updatedDetails = await db.run(update)
  response.send('Movie Details Updated')
})

module.exports = app
