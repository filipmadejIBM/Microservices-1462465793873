var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// serve the files out of ./public as our main files - only app.js
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// MongoDB - used by all services
if(process.env.VCAP_SERVICES){
	var services = JSON.parse(process.env.VCAP_SERVICES);
	uri = services.mongolab[0].credentials.uri;
} else {
	uri = 'mongodb://IbmCloud_mcm25pjd_u7fmoiet_6cc7rg12:LSwT7ochTr77iPzshuYFJeztlfHtXVj8@ds037802.mongolab.com:37802/IbmCloud_mcm25pjd_u7fmoiet';
}
mongoose.connect(uri);

// Mongoose Models
var Review = require('./models/review');	 // used in review service

// configure app to use bodyParser() - used by all services
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Set up /api router - (all services)
var router = express.Router();

// middleware to use for all requests (JSON) - (all services)
router.use(function(req, res, next) {
		var body = JSON.stringify(req.body);
    console.log('[Request] '+req.method+' ' + req.url + ' - Body: ' + body);
    next();
});

/* ------------------------------------------------------------------------
--  R E V I E W S  A P I  -------------------------------------------------
------------------------------------------------------------------------ */

router.route('/reviews/:product_id')
	// get the reviews associated with the passed product id
	.get(function(req, res) {
			Review.find({ productId: req.params.product_id }, function(err, review) {
					if (err)
							res.send(err);
					res.json(review);
			});
	})

	// add a new review for a product
	.post(function(req, res) {

			var review = Review();
			review.productId = req.body.productId;
			review.stars = req.body.stars;
			review.body = req.body.body;
			review.author = req.body.author;

			// save the new review
			review.save(function(err) {
					if (err)
							res.send(err);
					res.json({ message: 'Review Successfully Added!'});
			});

	});

/* ------------------------------------------------------------------------
--  S T A R T  S E R V E R  -----------------------------------------------
------------------------------------------------------------------------ */

app.use('/api', router);

// get the app environment from Cloud Foundry
var port = process.env.PORT || 8080;

// start server on the specified port and binding host
app.listen(port, function() {
  console.log("server starting on port: " + port);
});