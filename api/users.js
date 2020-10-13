const express = require('express');
const jwt = require('jsonwebtoken')
const{ JWT_SECRET } = process.env
const usersRouter = express.Router();
const { createUser, getUser } = require('../db/users');



usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
      if ( password.length <= 8 ) { 
        res.send({message:'Password Too Short!'}); 
      } 
      // const duplicateUser = await getUser({username})
      // if(duplicateUser){
      //   res.send({message:'A user by that username already exists'})
      // }
        const user = await createUser({ username, password });
        res.send({ message: "niceee", user});
      
    } catch (error) {
      next(error)
    } 
});


module.exports = usersRouter;

