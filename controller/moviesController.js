import MovieModel from '../models/movies.js'

// ! GET ALL MOVIES
const getAll = async (req, res) => {
  const allMovies = await MovieModel.find()
  return res.status(200).json(allMovies)
}

// ! GET INDIVIDUAL MOVIE
const getIndividual = async (req, res, next) => {
  const { id } = req.params

  try {
    const foundMovie = await MovieModel.findById(id)

    if (!foundMovie) {
      return res
        .status(404)
        .json({ message: `Movie with id ${id} could not be found.` })
    }

    return res.status(200).json(foundMovie)
  } catch (error) {
    next(error)
  }
}

export default { getAll, getIndividual }
