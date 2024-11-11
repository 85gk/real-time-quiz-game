const redis = require('redis');
const port = process.env.REDIS_PORT || 6379
const Client = redis.createClient(port);
 
Client.on("error", (error) => {
 console.error(error);
});
Client.connect();

exports.getValue = async (key) => {
    return await Client.json.get(key, { path: '.' });
};

exports.setValue = async (key, data) => {
    await Client.json.set(key, '.', data); // setting json data
};

exports.clearValue = async (key) => {
    return  await Client.json.del(key, '.');
}