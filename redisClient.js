import { createClient } from 'redis';

const connectRedis = async () => {
	console.log('REDIS_PASSWORD: ', process.env.REDIS_PASSWORD);
	console.log('REDIS_URL: ', process.env.REDIS_URL);
	console.log('REDIS_PORT: ', process.env.REDIS_PORT);
	const client = createClient({
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_URL,
			port: process.env.REDIS_PORT,
		},
	});

	client.on('error', (err) => {
		console.error('Redis client error:', err);
	});

	client.on('connect', () => {
		console.log('Redis client connected');
	});

	try {
		await client.connect();

		return client;
	} catch (error) {
		console.error('erro ao conectar redis: ', error);
	}
};

export default connectRedis;
