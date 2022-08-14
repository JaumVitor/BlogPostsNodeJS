const express = require('express')
const { restart } = require('nodemon')
const router = express.Router()

// Realizando a conexão com o banco de dados
const connectionDataBase = require('../database/connect')
connectionDataBase()

const CategoryModel = require('../database/models/category.model')
const PostModel = require('../database/models/post.model')

const verifyErrorInputFormCategory = req => {
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

const verifyErrorInputFormPost = (req, reqLocal) => {
  const err = []  
  if (
    !req.body.title ||
    typeof req.body.title == undefined ||
    req.body.title == null
  ) {
    err.push({
      message: 'Titulo invalido!'
    })
  }

  if (
    !req.body.description ||
    typeof req.body.description == undefined ||
    req.body.description == null
  ) {
    err.push({
      message: 'Descrição invalida!'
    })
  }

  if (
    !req.body.content ||
    typeof req.body.content == undefined ||
    req.body.content == null
  ) {
    err.push({
      message: 'Conteudo invalido!'
    })
  }

  if (
    !req.body.category ||
    typeof req.body.category == undefined ||
    req.body.category == null || 
    (req.body.category == '0' && reqLocal != 'edit')
  ) {
    err.push({
      message: 'Não existe categoria cadastrada'
    })
  }

  return err
}

// Rotas admin
router.get('/', (req, res) => {
  res.render('admin/index')
})

// ---------------Category---------------
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
  const err = verifyErrorInputFormCategory(req)
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
  const err = verifyErrorInputFormCategory(req)
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

// ---------------Posts---------------
router.get('/posts', async (req, res) => {
  // Populate para trazer os dados referentes a categoria
  const posts = await PostModel.find({})
    .populate('category')
    .sort({ date: 'desc' })

  // Preciso verificar se a categoria não foi excluida, antes de tentar busca-la
  posts.forEach((post, i) => {
    if (post.category == null) {
      post.category = { name_category: 'Categoria indefinida!' }
    }
  })

  res.render('admin/posts', { posts })
})

router.get('/posts/add', async (req, res) => {
  const categories = await CategoryModel.find({}).sort({ date: 'desc' })
  res.render('admin/postsAdd', { categories })
})

router.post('/posts/add', async (req, res) => {
  const err = verifyErrorInputFormPost(req)

  if (err.length > 0) {
    // Caso exista erros adiciona todos nas variaveis globais
    err.push({
      message: 'Postagem não foi cadastrada!'
    })
    // // Inserindo erros na variavel global de erros, definida no meu middleware
    err.forEach(e => {
      req.flash('err', e)
    })
    res.redirect('/admin/posts/add')

  } else {
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
      })
      .catch(err => {
        console.log('Post não criado' + err.message)
      })
  }
})

// Criando a rota de edição de posts
router.get('/posts/edit/:id', async (req, res) => {
  const id = req.params.id
  const post = await PostModel.findById(id).populate('category')
  const categories = await CategoryModel.find({})

  // Vericiando se a categoria foi ecluida, para exibir ao usuario
  if (post.category == null) {
    post.category = { name_category: 'Categoria indefinida!' }
  }
  
  res.render('admin/postsEdit', { post, categories })
})

router.post('/posts/edit/:id', async (req, res) => {
  // Preciso do "edit", para permitir a categoria selecionada possa ser vazia apenas na edição
  const err = verifyErrorInputFormPost(req, 'edit')

  if (err.length == 0 && req.body.category == '0') {
    // Altrando os dados do post, porem a categoria permanece a mesma
    const id = req.params.id
    const postEdited = await PostModel.findById(id).populate( 'category' )

    if (postEdited.category == null) {
      postEdited.category = { name_category: 'Categoria indefinida!' }
    }

    post = { 
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      category: postEdited.category
    }

    await PostModel.findByIdAndUpdate(id, post, { new: true })
      .then(() => {
        req.flash('success', 'Post editado com sucesso!')
        res.redirect('/admin/posts')
      }).catch(err => {
        res.send('error', err.message)
      })

  } else if (err.length > 0) {
    // Caso exista erros nos outros campos do formulario
    err.push({
      message: 'Postagem não foi editada!'
    })
    // Inserindo erros na variavel global de erros, definida no meu middleware
    err.forEach( e => {
      req.flash('err', e)
    })
    res.redirect('/admin/posts/edit/' + req.params.id)
    
  } else {
    // Em casos que existem categorias para serem selecionadas no formulario
    const id = req.params.id
    const idCategory = req.body.category
    const categorySelected = await CategoryModel.findById(idCategory)
    
    post = {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      category: categorySelected
    }

    await PostModel.findByIdAndUpdate(id, post, { new: true })
      .then(() => {
        req.flash('success', 'Post editado com sucesso!')
        res.redirect('/admin/posts')
      }).catch (err => {
        res.send('error', err.message)
      })
  }
})

// Criando rota de deletar posts
router.post('/posts/delete/:id', async (req, res) => {
  const id = req.params.id
  await PostModel.findByIdAndDelete(id)
    .then(() => {
      req.flash('success', `Post ID: ${id} Deletado com sucesso!`)
      res.redirect('/admin/posts')
    })
    .catch(err => {
      res.send('err', error.message)
    })
})

module.exports = router
