const express = require('express')
const router = express.Router()

// Realizando a conexão com o banco de dados
const connectionDataBase = require('../database/connect')
connectionDataBase()

const CategoryModel = require('../database/models/category.model')

// Rotas admin
router.get('/', (req, res) => {
  res.render('admin/index')
})

router.get('/categories', async (req, res) => {
  const category = await CategoryModel.find({})

  res.render('admin/categories', { category })
})

router.get('/categories/add', (req, res) => {
  res.render('admin/categoriesAdd')
})

router.post('/categories/add/new', async (req, res) => {
  const category = {
    name_category: req.body.name,
    slug: req.body.slug
  }

  await CategoryModel.create(category)
    .then(() => {
      res.redirect('/admin/categories')
    })
    .catch(() => {
      console.log('Categoria não criada' + err.message)
    })
})

module.exports = router
