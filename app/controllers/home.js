var model = require('../models/home.js');

function createTabales(req, res, next){
	model.createTabales(function(result){
		console.log(' create: ' + result);
	});
}
function getAllUsers(req, res, next) {
	var page = parseInt(req.params.id);
	var forAllUsers = {};
	model.selectAllUsers(page, function (results) {
		forAllUsers.allUsers = results;
		console.log('getAllUsers');
		model.getContactNames(function(results){
			forAllUsers.userContactTypes = results;
			model.getSkillNames(function(results){
				forAllUsers.userSkillNames = results;
				model.getCountUsers(function(results){
					forAllUsers.count = results.count;
					res.json(forAllUsers);
					res.end();
				});
			});
		});
	});
}

function getSingleUser(req, res, next) {
	var forSingleUser = {};
	var pupID = parseInt(req.params.id);
	model.getSingleUser(pupID, function (results){
		forSingleUser.user = results;
		model.getContactNames(function(results){
			forSingleUser.userContactTypes = results;
			model.getSkillNames(function(results){
				forSingleUser.userSkillNames = results;
				res.json(forSingleUser);
				res.end();
			});
		});
	});
}

function createUser(req, res, next) {
	console.log(req.body);
	model.createUser(req.body,function (results){
		res.send('nice');
		res.end();
	});
}

function getSearchUsers (req, res, next){
	var arr = req.body.search.split(' ');
	model.getSearchUsers(arr, function(results){
		//res.json(results);
		console.log(results);
		res.send(results);
		res.end();
	});
}

function updateUser(req, res, next) {
	var pupID = parseInt(req.params.id);
	console.log(pupID);
	console.log(req.body);
	model.updateUser(req.body, pupID, function(results){
		res.send('results');
	});
}
function addUser(req, res, next){
	var newUser = {
		'Nameupdate': 'Иван',
		'Familyupdate': 'Иванов',
		'contacts': ['телефон','111222'],
		'skillname': ['javascript',9]
	}
	model.createUser(req.body,function (results){
		res.send('nice');
		res.end();
	});
}
/******Cascad delete****/
function removeUser(req, res, next) {
	var pupID = parseInt(req.params.id);
	model.removeUser(pupID, function(results){
		res.send(req.params.id + ' delete ++++++');
	});
}
module.exports = {
	getAllUsers: getAllUsers,
	getSingleUser: getSingleUser,
	getSearchUsers: getSearchUsers,
	createUser: createUser,
	updateUser: updateUser,
	removeUser: removeUser,
	createTabales: createTabales,
	addUser: addUser
};

    
