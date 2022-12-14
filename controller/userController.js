import UserModel from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import CONSTS from './../consts.js'
import auth from '../middleware/auth.js'

// currently working on an error - newUser.password is undefined but shouldn't be.
// ! REGISTER USER
const register = async (req, res, next) => {
  const { body: newUser } = req
  const emailExists = await UserModel.findOne({ email: newUser.email })
  if (emailExists) {
    return res
      .status(400)
      .send({ message: 'User with this email address already exists' })
  }

  const userNameExists = await UserModel.findOne({
    userName: newUser.userName,
  })
  if (userNameExists) {
    return res
      .status(400)
      .send({ message: 'User with this username already exists' })
  }

  if (newUser.password !== newUser.confirmPassword) {
    return res.status(400).send({ message: 'Passwords do not match.' })
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newUser.password, salt)

  const createdUser = await UserModel.create({
    ...newUser,
    password: hashedPassword,
  })

  return res.status(200).json({ createdUser })
}

// ! LOGIN USER
const login = async (req, res, next) => {
  const { userName, password } = req.body
  try {
    const user = await UserModel.findOne({ userName })

    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials.' })
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return res.status(400).send({ message: 'Invalid credentials' })
    }

    const payload = {
      sub: user._id,
      userName: user.userName,
      email: user.email,
    }
    const opts = {
      expiresIn: '2 days',
    }
    const token = jwt.sign(payload, CONSTS.JWT_SECRET, opts)
    console.log(`User logged in with id -> ${user._id}`)
    return res
      .status(200)
      .send({ message: `Welcome back ${user.userName}!`, token })
  } catch (error) {
    next(error)
  }
}

// ! GET USER PROFILE
const getUserProfile = async (req, res, next) => {
  console.log(req.currentUser.userName)

  try {
    const foundUser = await UserModel.findById(req.currentUser._id)

    if (!foundUser) {
      return res
        .status(404)
        .json({
          message: `User with id ${req.currentUser._id} could not be found.`,
        })
    }

    return res.status(200).json(foundUser)
  } catch (error) {
    next(error)
  }
}

export default { register, login, getUserProfile }
