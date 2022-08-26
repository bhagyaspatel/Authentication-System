const jwt = require('jsonwebtoken');
//mdoel is optional

const auth = (req, res, next) => { //next is vimp, without it app wont work

	//to find cookie in all possible places (header,cookie,body)

	console.log(req.cookies); //contains token

	const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

	if (!token) {
		return res.status(403).send("Token is missing");
	}

	//verifying the token
	try {
		const decode = jwt.verify(token, process.env.SECRET_KEY); //returns the token with payload and exp and iat
		console.log(decode);

		req.user = decode;

		//we can also use this token to bring out the info from DB of respective user

	} catch (error) {
		return res.status(401).send("Invalid token");
	}

	return next(); //IMP
};

module.exports = auth;