const env_qa = {
	APP_PORT: 5020,
	NODE_ENV: "local-server",
  
	// MONGO_URI : "mongodb://localhost:27017/jumboDb",
	MONGO_URI: "mongodb+srv://85gk:Vm123%21%40%23@cluster0.43pn5wq.mongodb.net/snake-ladder?retryWrites=true&w=majority",

	// jwt token
	SECRET_ACCESS_TOKEN : "jumbo234@45wbt",

	// REDIS
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1'
};
  
  
module.exports = {
	apps: [
	  {
		name: "jumbo",
		script: "server.js",
		autorestart: true,
		watch: false,
		exec_mode: "cluster",
		instances: 1,
		env_qa: env_qa
	  },
	],
};
  