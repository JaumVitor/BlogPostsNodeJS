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
  const posts = await PostModel.find( ).sort({ date: 'desc' })
    .populate('category')

  posts.forEach(post => {
    if (post.category == null) {
      post.category = {
        name_category: 'Sem categoria'
      }
    }
  })
  console.log(posts)
  //Fazer validação para categorias vazias
  res.render('index', { posts })
})

app.get('/categories', async (req, res) => {
  
})

app.use('/admin', admin)

// Definindo porta para escultar as requisições
const port = 8080
app.listen(port, () => console.log(`Listening port ${port}`))
