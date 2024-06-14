import 'dotenv/config';
import express from 'express';
import controllers from './controller.js';
import KafkaConfig from './kafkaConfig.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import connectRedis from './redisClient.js';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server);

const init = async () => {
	try {
		const client = await connectRedis();
		controllers.init(client);
	} catch (err) {
		console.error('Failed to connect to Redis:', err);
		process.exit(1);
	}
};

init();

app.post('/api/send', controllers.sendMessageToKafka);

// Evento de conexão do Socket.io
io.on('connection', async (socket) => {
	console.log('A user connected');

	try {
		// Carregar todas as ocorrências existentes do Redis
		const ocorrencias = await client.lRange('occurrences', 0, -1); // Usando o método assíncrono nativo lRange
		const parsedOccurrences = ocorrencias.map((occ) => JSON.parse(occ));

		socket.emit('loadOcurrences', parsedOccurrences);
	} catch (err) {
		console.error('Error loading occurrences from Redis:', err);
	}

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

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
