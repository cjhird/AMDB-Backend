import express from 'express'
import moviesController from './controller/moviesController.js'

const router = express.Router()

router.route('/').get((req, res) => res.status(200).send('API Root Running'))

router.route('/movies').get(moviesController.getAll)

export default router