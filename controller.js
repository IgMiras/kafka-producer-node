import KafkaConfig from './kafkaConfig.js';

let client;

const init = (redisClient) => {
	client = redisClient;
	console.log('client atribuido, :', client);
};

const sendMessageToKafka = async (req, res) => {
	try {
		const occurrence = req.body;

		// add occurrence to Redis
		await client.lPush('occurrences', JSON.stringify(occurrence));

		const kafkaConfig = new KafkaConfig();
		const messages = [
			{ key: occurrence.id, value: JSON.stringify(occurrence) },
		];

		await kafkaConfig.produce('my-topic', messages);

		res.status(200).json({
			message: 'Message successfully sent!',
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'An error occurred',
			error: err.message,
		});
	}
};

const controllers = { init, sendMessageToKafka };

export default controllers;
