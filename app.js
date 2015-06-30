// BASE SETUP
// =============================================================================

// PACKAGES
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var faker = require('./models/faker.js');

// MongoDB
if(process.env.VCAP_SERVICES){
	var services = JSON.parse(process.env.VCAP_SERVICES);
	uri = services.mongolab[0].credentials.uri;
} else {
	uri = 'mongodb://IbmCloud_mcm25pjd_u7fmoiet_6cc7rg12:LSwT7ochTr77iPzshuYFJeztlfHtXVj8@ds037802.mongolab.com:37802/IbmCloud_mcm25pjd_u7fmoiet';
}
mongoose.connect(uri);

// Mongoose Models
var Bear = require('./models/bear');
var Product = require('./models/product');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// configure app to use bodyParser()
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();


// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/bears')

    // create a bear (accessed at POST http://localhost:6005/api/bears)
    .post(function(req, res) {
        
        var bear = new Bear();      // create a new instance of the Bear model
        bear.name = req.body.name;  // set the bears name (comes from the request)
        // save the bear and check for errors
        bear.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Bear created! ('+req.body.name+')' });
        });
        
    })

    // get all the bears (accessed at GET http://localhost:6005/api/bears)
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });
    });

router.route('/bears/:bear_id')

    // get the bear with that id (accessed at GET http://localhost:6005/api/bears/:bear_id)
    .get(function(req, res) {
        Bear.findById(req.params.bear_id, function(err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })

    // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
    .put(function(req, res) {

        // use our bear model to find the bear we want
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err)
                res.send(err);

            bear.name = req.body.name;  // update the bears info

            // save the bear
            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Bear updated! (' + bear.name + ')'});
            });

        });
    })

    // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
    .delete(function(req, res) {
        Bear.remove({
            _id: req.params.bear_id
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted (' +req.params.bear_id+ ')' });
        });
    });


router.route('/products')

    // create a product (accessed at POST http://localhost:6005/api/products)
    .post(function(req, res) {
        
        var product = new Product();      // create a new instance of the Product model
        product.name = req.body.name;  // set the products name (comes from the request)
        product.price = req.body.price;
        product.description = req.body.description;
        product.reviews = req.body.reviews;
        product.image = req.body.image;
        product.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Product created! ('+req.body.name+')' });
        });
        
    })

    // get all the products (accessed at GET http://localhost:6005/api/products)
    .get(function(req, res) {
        Product.find(function(err, products) {
            if (err)
                res.send(err);

            res.json(products);
        });
    });


router.route('/products/:product_id')

    // get the product with that id (accessed at GET http://localhost:6005/api/products/:product_id)
    .get(function(req, res) {
        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                res.send(err);
            res.json(product);
        });
    })

    // update the product with this id (accessed at PUT http://localhost:8080/api/products/:product_id)
    .put(function(req, res) {

        // use our product model to find the product we want
        Product.findById(req.params.product_id, function(err, product) {

            if (err)
                res.send(err);

            product.name = req.body.name;  // update the products info

            // save the product
            product.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Product updated! (' + product.name + ')'});
            });

        });
    })

    // delete the product with this id (accessed at DELETE http://localhost:8080/api/products/:product_id)
    .delete(function(req, res) {
        Product.remove({
            _id: req.params.product_id
        }, function(err, product) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted (' +req.params.product_id+ ')' });
        });
    });

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

app.get('/faker/:count', function(req, res) {
    Product.remove({}, function(err) { 
       console.log('collection removed') 
    });
    for (var i = 0; i < req.params.count; i++) {
        var sample = faker.fakeOut();
        var product = new Product();      // create a new instance of the Product model
        product.name = sample.name;  // set the products name (comes from the request)
        product.price = sample.price;
        product.description = sample.description;
        product.reviews = sample.reviews;
        product.image = "http://lorempixel.com/350/350/?v="+randInt(0, 1000),
        product.save(function(err) {
            if (err) { console.log("Error faking data"); };
        });
    };
   
    res.json({ message: 'Successfully faked '+req.params.count+' document(s)!' });
});

app.use('/api', router);

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("server starting on " + appEnv.url);
});
