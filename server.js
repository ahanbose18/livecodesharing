const express = require('express')
const app = express()

// http = require('http');

const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})
const { v4: uuidv4 } = require('uuid')

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    admin=1
	res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room })
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {


        console.log(roomId, userId)

		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId)

		socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message, userId)
        })
        

        socket.on('message', (evt) => {
            socket.broadcast.emit('message', evt)
        })

        // socket.on('code', (evt) =>{
        //     socket.broadcast.emit('code', evt)
        // })

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 2000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))

