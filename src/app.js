const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// Configurando view engine
app.set('view engine', 'ejs')
app.set('views', 'src/views')
// Configurando o caminho de arquivos estativos
app.use(express.static('src/public'))
// Configurando body-parser (captura de dados do formulario)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json())

// Usando exports de rotas, para vizualização de endpoints
const admin = require('./routes/admin')

// Definindo os endpoints da aplicação
app.get('/', (req, res) => {
  res.send('Rota definida')
})

app.use('/admin', admin)

// Definindo porta para escultar as requisições
const port = 8080
app.listen(port, () => console.log(`Listening port ${port}`))
