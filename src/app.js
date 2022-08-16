const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')

const mongoose = require('mongoose')
const CategoryModel = require('./database/models/category.model')
const PostModel = require('./database/models/post.model')

// Usando exports de rotas, para vizualização de endpoints
const admin = require('./routes/admin')

// Configurando view engine
app.set('view engine', 'ejs')
app.set('views', 'src/views')
// Configurando o caminho de arquivos estativos
app.use(express.static('src/public'))
// Configurando body-parser (captura de dados do formulario)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json())

app.use(
  session({
    secret: 'secretSession',
    saveUninitialized: true,
    resave: true
  })
)

app.use(flash())

// Criando meu middleware para criar variaveis globais que serão usadas pelo flash
app.use('/', (req, res, next) => {
  // Prosseguindo apos definição das variaveis
  res.locals.err = req.flash('err')
  res.locals.success = req.flash('success')
  next()
})

app.get('/', async (req, res) => {
  const posts = await PostModel.find().sort({ date: 'desc' })
    .populate('category')

  posts.forEach(post => {
    if (post.category == null) {
      post.category = {
        name_category: 'Sem categoria'
      }
    }
  })
  res.render('index', { posts })
})

app.get('/categories', async (req, res) => {
  const category = await CategoryModel.find()
  res.render('user/categories', { category })
})

app.get('/post/:id', async (req, res) => {
  const id = req.params.id
  const post = await PostModel.findById(id)
    .populate('category')
    .then( post => {
      if (post.category == null) {
        post.category = { name_category: 'Sem categoria' }
      }
      res.render('user/postReveal', { post })
    }).catch(err => {
      res.send('Erro ao buscar postagem' + err)
    })
    
})

app.get('/posts', async(req, res) => {
  await PostModel.find({})
    .sort({ date: 'desc' })
    .populate('category')
    .then( posts => {
      posts.forEach(post => {
        if (post.category == null) {
          post.category = { name_category: 'Sem categoria'}
        }
      })
      res.render('user/postsRevealAll', { posts })
    }).catch((err)=>{
      res.send('Erro ao listar os posts' + err)
    })
})

app.get('/posts/:id', async (req, res) => {
  // Encontrar a categoria pelo id, depois encontrar o post pelo id da categoria
  const id = req.params.id
  await CategoryModel.findById(id)
    .then( async category => {
      // Caso encontre a categoria pelo id, inicia a busca da categoria em uma postagem
      await PostModel.find({ category: category._id })
        .populate('category')
        .then((posts) => {
          if (posts.length > 0) {
            // Caso exista categoria cadastrada em um post
            res.render('user/postsByCategory', { posts })
          }else {
            res.locals.err = req.flash('err', { message: 'Não existe postagens cadastradas nessa categoria'})
            res.redirect('/categories')
          }
        }).catch(err => {
          console.log('Erro ao buscar postagem: ' + err.message)
        })
    }).catch(err => {
      console.log(err)
    })
})

app.use('/admin', admin)

// Definindo porta para escultar as requisições
const port = 8080
app.listen(port, () => console.log(`Listening port ${port}`))
