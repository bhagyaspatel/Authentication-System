const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

//MONGOSE ALWAYS RETURNS PROMISE SO USE .then() & .cathc() BLOCK ALWAYS

exports.connect = () => {
	mongoose
		.connect(MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(console.log(`DB CONNECTION SUCCESSFUL`))
		.catch((error) => {
			console.log(`DB CONNECTION FAILED`);
			console.log(error);
			process.exit(1);
		});
};