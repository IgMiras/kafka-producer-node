import express from 'express';
import controllers from './controller.js';
import KafkaConfig from './config.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import redis from 'redis';
import { promisify } from 'node:util';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);

const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const lpushAsync = promisify(redisClient.lPush).bind(redisClient);
const lrangeAsync = promisify(redisClient.lRange).bind(redisClient);

app.post('/api/send', controllers.sendMessageToKafka);

// Evento de conexão do Socket.io
io.on('connection', async (socket) => {
	console.log('A user connected');

	// Carregar todas as ocorrências existentes do Redis
	const ocorrencias = await lrangeAsync('ocurrences', 0, -1);
	const parsedOccurrences = ocorrencias.map((occ) => JSON.parse(occ));

	socket.emit('loadOcurrences', parsedOccurrences);

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

// consume from topic "test-topic"
const kafkaConfig = new KafkaConfig();
kafkaConfig.consume('my-topic', (value) => {
	console.log('valor consumido: ', value);
	io.emit('newOcurrence', value);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
