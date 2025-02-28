const io = require('socket.io')();

io.on('connection', client => {
	client.emit('init', { data: 'Hello world!' })
});

io.listen(3000);
