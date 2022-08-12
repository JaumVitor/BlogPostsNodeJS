const mongoose = require('mongoose')
const { Schema } = mongoose

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },

  description: {
    type: String,
    require: true
  },

  content: {
    type: String,
    require: true
  },

  date: {
    type: Date,
    default: Date.now()
  },

  category: {
    type: Schema.Types.ObjectId, // referencia ao id da categoria
    ref: 'Categories', // referencia ao modelo de categoria
    require: true
  }
})

const postModel = mongoose.model('Post', postSchema)
module.exports = postModel
