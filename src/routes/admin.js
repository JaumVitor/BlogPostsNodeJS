const express = require('express')
const { restart } = require('nodemon')
const router = express.Router()

// Realizando a conexão com o banco de dados
const connectionDataBase = require('../database/connect')
connectionDataBase()

const CategoryModel = require('../database/models/category.model')
const PostModel = require('../database/models/post.model')

const verifyErrorInputForm = req => {
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
  return err
}

// Rotas admin
router.get('/', (req, res) => {
  res.render('admin/index')
})

router.get('/categories', async (req, res) => {
  const category = await CategoryModel.find({}).sort({ date: 'desc' })

  res.render('admin/categories', { category })
})

// endpoint do get categorias
router.get('/categories/add', (req, res) => {
  res.render('admin/categoriesAdd', {
    title: 'Adicionar',
    submit: 'add'
  })
})

// endpoint da adição de categorias
router.post('/categories/add', async (req, res) => {
  const err = verifyErrorInputForm(req)
  if (err.length > 0) {
    err.push({
      message: 'Categoria não foi cadastrada!'
    })
    // Caso exista erros adiciona todos nas variaveis globais
    // Inserindo erros na variavel global de erros, definida no meu middleware
    err.forEach(e => {
      req.flash('err', e)
    })

    // redirecionando para endpoint get do formulario de adição
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

// Mostrar pagina de edição das categorias
router.get('/categories/edit/:id', async (req, res) => {
  const category = await CategoryModel.findById(req.params.id)
  res.render('admin/categoriesEdit', {
    category,
    title: 'Editar',
    submit: 'edit'
  })
})

// Editando categorias que foram clicadas ("edit")
router.post('/categories/edit/:id', async (req, res) => {
  console.log('Editando categoria')
  const err = verifyErrorInputForm(req)
  const id = req.params.id

  if (err.length > 0) {
    // Caso exista erros adiciona todos nas variaveis globais
    err.push({
      message: 'Categoria não foi editada!'
    })
    // Inserindo erros na variavel global de erros, definida no meu middleware
    err.forEach(e => {
      req.flash('err', e)
    })

    // Redirecinando pagina e emitindo erro
    res.redirect('/admin/categories/edit/' + id)
  } else {
    const updateCategory = {
      name_category: req.body.name,
      slug: req.body.slug
    }

    await CategoryModel.findByIdAndUpdate(id, updateCategory, { new: true })
      .then(() => {
        req.flash('success', 'Categoria editada com sucesso!')
        res.redirect('/admin/categories')
      })
      .catch(error => {
        res.send('error', error.message)
      })
  }
})

router.post('/categories/delete/:id', async (req, res) => {
  // Deletando categorias
  const id = req.params.id
  await CategoryModel.findByIdAndDelete(id)
    .then(() => {
      req.flash('success', `Categoria ID: ${id} Deletada com sucesso!`)
      res.redirect('/admin/categories')
    })
    .catch(error => {
      res.send('error', error.message)
    })
})

router.get('/posts', async (req, res) => {
  // Populate para trazer os dados referentes a categoria
  const posts = await PostModel.find({})
    .populate('category')
    .sort({ date: 'desc' })

  // Preciso verificar se a categoria não foi excluida, antes de tentar busca-la
  posts.forEach((post, i) => {
    if (post.category == null) {
      post.category = { name_category: 'Categoria excluida' }
    }
  })

  res.render('admin/posts', { posts })
})

router.get('/posts/add', async (req, res) => {
  const categories = await CategoryModel.find({})
  res.render('admin/postsAdd', { categories })
})

router.post('/posts/add', async (req, res) => {
  const idCategory = req.body.category
  const category = await CategoryModel.findById(idCategory)

  const post = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    category: category
  }

  await PostModel.create(post)
    .then(() => {
      req.flash('success', 'Post criado com sucesso!')
      res.redirect('/admin/posts')
    }).catch(err => {
      console.log(err.message)
    })
})

module.exports = router
