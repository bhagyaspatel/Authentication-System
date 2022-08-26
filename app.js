require("dotenv").config(); //at the top : always (doesnt give issue in this example if it is below)
//even though we are not usiing any config in this app.js it makes sense to import .env file atleast once in our main app.js

require('./config/databse').connect();

const express = require('express');
const bcrypt = require('bcryptjs'); //for password incryption 
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

const app = express();
const User = require('./model/user');
const auth = require('./middleware/auth');

app.use(express.json()); //middleware : our express cant handle the json file directly, it needs to use the middleware for that: i.e. to read json data we need middleware
app.use(cookieParser()); //to read the cookies


app.get("/", (req, res) => {
	res.send("<h1>Hello Auth System</h1>");
});

app.post("/register", async (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body; //express using json : using middleware

		//checking validation manually (not using mongoose)
		if (!(email && password && firstName && lastName)) {
			res.status(400).send('All fields are required');

			res.send("This code is unreachable since after res.send it stops");
		}

		const existingUser = await User.findOne({ email });  //returns PROMISE
		//({email : email}) ; if key variable and value has same name repeatation can be avoided

		if (existingUser) {
			res.status(401).send("User already exist");
		}

		const myEncPassword = await bcrypt.hash(password, 10); //10 is the number of rounds of algorithm we want to run to encrypt the string passed (here : password), higher the number more is the secuirty, going higher also increases the time taken and also sometimes goes out of memory 

		const user = await User.create({ //when we save any value inside database mongodb gives it a unique object id and that 'id' can be accessed using a variable on lhs ('user') : user._id
			firstName,
			lastName,
			email: email.toLowerCase(),
			password: myEncPassword,
		});

		//token creation
		const token = jwt.sign( //we renanme user._id as user_id
			{ user_id: user._id, email },
			process.env.SECRET_KEY,
			{
				expiresIn: "2 days"
			}
		);

		user.token = token;
		//we can update this or not in db (video : 13, chapter-4 )

		//when we check the rsposnse in postman using : res.status(201).json(user) : we will get the password : <encrypted pwd> but we also dont want the encrypted pwd to be seen so :
		user.password = undefined; //this will not return the password field in the repsonse at all

		// send token or just send success message and redirect - choice
		res.status(201).json(user);


	} catch (error) {
		console.log(error);
	}
});

app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!(email && password)) {
			res.status(400).send('Field is missing');
		}

		const user = await User.findOne({ email });

		// if(!user){
		// 	res.status(400).send("You are not registered") ;
		// }

		if (user && await bcrypt.compare(password, user.password)) {
			//if user exist and pwd matches we generate the token and send it back
			const token = jwt.sign(
				{ user_id: user._id, email }, //payload
				process.env.SECRET_KEY, //private key
				{
					expiresIn: "2 days" //object containing algorithm and expiry date (we have chosen defualt algo which is : HS256)
				}
			);

			user.token = token;
			user.password = undefined;
			// res.status(200).json(user);

			//if you want to use cookies 
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true
			};

			res.status(200).cookie('token', token, options).json({
				success: true,
				token,
				user
			});
		}

		res.status(400).send("Email or password is incorrect");

	} catch (error) {
		console.log(error);
	}
});

//protecting the route
app.get("/dashboard", auth, (req, res) => { //passing "auth" as middleware to protect the route
	res.status(200).send("This is the secret information");
});

module.exports = app;