const mongoose = require('mongoose')

const connectionDataBase = async () => {
  await mongoose.connect(
    `mongodb+srv://Jaum_https:HesoyamH123@cursonodejs.a2ouj.mongodb.net/NodePostsApp?retryWrites=true&w=majority`,
    err => {
      if (err) {
        return console.log('Erro ao tentar se conectar com o banco ' + erro)
      }

      return console.log('Conexão realizada com sucesso!')
    }
  )
}

module.exports = connectionDataBase
