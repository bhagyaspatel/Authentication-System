const mongoose = require("mongoose");

// const {Schema} = mongoose ; using concept of destructering
// const userSchema = new Schema({})

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		default: null,
	},
	lastName: {
		type: String,
		default: null,
	},
	email: {
		type: String,
		unique: true,
		// required: [true, 'Please enter your email to proceed further']
	},
	password: {
		type: String
	},
	token: {
		type: String
	}
});

module.exports = mongoose.model('user', userSchema);
//mongoose.model("<what our model will be called>", "<what schema our model will be following>")