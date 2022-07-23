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
;('')
router.get('/categories', async (req, res) => {
  const category = await CategoryModel.find({}).sort({ date: 'desc' })

  res.render('admin/categories', { category })
})

router.get('/categories/add', (req, res) => {
  res.render('admin/categoriesAdd')
})

router.get('/categories/add/new', (req, res) => {
  console.log(res.locals.err)
  res.render('admin/categoriesAdd')
})

router.post('/categories/add', async (req, res) => {
  // Validando inputs do formulario, caso haja erro seta valor no array de erros
  const err = []
  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    err.push({
      message: 'Nome invalido!'
    })
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    err.push({
      message: 'Slug invalido!'
    })
  }

  if (err.length > 0) {
    // Caso exista erros adiciona todos nas variaveis globais
    err.push({
      message: 'Categoria não foi cadastrada!'
    })
    // Inserindo erros na variavel global de erros, definida no meu middleware
    err.forEach(e => {
      req.flash('err', e)
    })

    res.redirect('/admin/categories/add')
  } else {
    // Caso contrario salva valores no banco
    const category = {
      name_category: req.body.name,
      slug: req.body.slug
    }

    // Categoria cadastrada com sucesso
    await CategoryModel.create(category)
      .then(() => {
        req.flash('success', 'Categoria criada com sucesso!')
        res.redirect('/admin/categories')
      })
      // Categoria não foi cadastrada
      .catch(err => {
        console.log('Categoria não criada' + err.message)
      })
  }
})

module.exports = router
