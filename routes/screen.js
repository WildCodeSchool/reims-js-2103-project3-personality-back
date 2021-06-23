const screenRoutes = require('express').Router();

const db = require('../db-config');

const { verifyToken } = require('../middlewares/auth');

screenRoutes.get('/', (req, res) => {
  db.query('SELECT * FROM candidates', (err, results) => {
    if (err) {
      res.status(500);
    } else {
      res.status(200).json(results);
    }
  });
});

screenRoutes.get('/:id', (req, res) => {
  db.query('SELECT * FROM candidates WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      res.status(500);
    } else if (results.length !== 1) {
      res.status(404);
    }
  });
});

screenRoutes.post('/', verifyToken, (req, res) => {
  const candidate = {
    name: req.body.name,
    username: req.body.username,
    telephone: req.body.telephone,
  };

  const userId = req.payload.sub;
  db.query('INSERT into candidates( user_id, name, username, telephone) VALUES(?, ?, ?, ?)', [userId, candidate.name, candidate.username, candidate.telephone], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      res.status(201).json({
        ...candidate, id: results.insertId,
      });
    }
  });
});

module.exports = screenRoutes;