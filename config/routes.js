var home = require('../app/controllers/home');

var express = require('express');
var router = express.Router();

router.get('/users/:id', home.getAllUsers);
router.get('/user/:id', home.getSingleUser);
router.post('/search/users', home.getSearchUsers);
router.post('/users', home.createUser);
router.put('/users/:id', home.updateUser);
router.delete('/users/:id', home.removeUser);

module.exports = router;