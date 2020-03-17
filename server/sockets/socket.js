const {
  io
} = require('../server');

const {
  Usuario
} = require('../classes/usuario')


const {
  crearMensaje
} = require('../utils/utilidades')


const usuarios = new Usuario()

io.on('connection', client => {

  client.on('entrarChat', (usuario, callback) => {

    if (!usuario.nombre || !usuario.sala) {
      return callback({
        error: true,
        mensaje: ' El nombre/sala es necesario'
      })
    }

    client.join(usuario.sala)

    usuarios.agregarPersonas(client.id, usuario.nombre, usuario.sala)
    
    client.broadcast.to(usuario.sala).emit('listaPersona', usuarios.getPersonaPorSala(usuario.sala))

    callback(usuarios.getPersonaPorSala(usuario.sala))

  })

  client.on('disconnect', () => {

    let personaBorrada = usuarios.borrarPersona(client.id)
    console.log(personaBorrada)

    client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} Salio`))
    client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonaPorSala(personaBorrada.sala))
  })

  client.on('crearMensaje', data => {
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje)
    console.log(mensaje);
    client.broadcast.to(data.sala).emit('crearMensaje', mensaje)
  })

  client.on('mensajePrivado', data=>{
    let persona = usuarios.getPersona(client.id)
    client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
  })

})