import connectRedis from '../redisClient.js';

const redisMiddleware = async (next) => {
	console.log('passou aq');
	try {
		console.log('Iniciando o middleware Redis');
		const client = await connectRedis();

		if (client.isReady) {
			console.log('passou por aqui deu bom');
			return next();
		}

		console.log('Erro redis (middleware); client: ', client);
		res.status(500).send('Redis client is not ready');
	} catch (err) {
		console.error('Erro no redisMiddleware: ', err);
		res.status(500).send('Redis connection error');
	}
};

export default redisMiddleware;
