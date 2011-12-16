/**************************************************
** EXPRESS CONTROLLER
**************************************************/

var exp = require("express");

var Express = {
	app: null,
	init: function () {
		var self = this;

		this.app = exp.createServer();

		// Configure Express
		this.app.configure(function(){
			//self.app.set("views", __dirname + "/views");
			//self.app.set("view engine", "hbs");
			self.app.use(exp.bodyParser());
			self.app.use(exp.methodOverride());
			self.app.use(self.app.router);
			self.app.use(exp.static(__dirname + "/../../public"));
		});

		this.app.configure("development", function(){
			self.app.use(exp.errorHandler({dumpExceptions: true, showStack: true}));
		});

		this.app.configure("production", function(){
			self.app.use(exp.errorHandler());
			self.app.use(exp.errorHandler({dumpExceptions: true, showStack: true}));
		});

		this.initRoutes();
		this.start();

		return this;
	},
	initRoutes: function () {
		// Express routes
		this.app.get("/manifest.webapp", function(req, res){
			res.header("Content-Type", "application/x-web-app-manifest+json");

			var fs = require('fs');
			fs.readFile(__dirname+"/../../public/manifest.webapp", function (err, data) {
				if (err) throw err;
				res.send(data);
			});
		});
	},
	start: function() {
		// Initialise Express
		this.app.listen(8000);
	}
};

exports.Express = Express;