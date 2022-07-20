const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name_category: {
    type: String,
    require: true
  },

  slug: {
    type: String,
    require: true
  },

  date: {
    type: Date,
    default: Date.now()
  }
})

const CategoryModel = mongoose.model('categories', categorySchema)
module.exports = CategoryModel
