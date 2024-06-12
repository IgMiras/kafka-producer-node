import KafkaConfig from './config.js';
import redis from 'redis';
import { promisify } from 'node:util';

const redisClient = redis.createClient();
const lpushAsync = promisify(redisClient.lPush).bind(redisClient);

const sendMessageToKafka = async (req, res) => {
	try {
		const occurrence = req.body;

		// add occurrence to Redis
		await lpushAsync('ocurrences', JSON.stringify(occurrence));

		const kafkaConfig = new KafkaConfig();
		const messages = [
			{ key: occurrence.id, value: JSON.stringify(occurrence) },
		];

		await kafkaConfig.produce('my-topic', messages);

		res.status(200).json({
			message: 'Message sucessfully send!',
		});
	} catch (err) {
		console.log(err);
	}
};

const controllers = { sendMessageToKafka };

export default controllers;
