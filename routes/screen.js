const screenRoutes = require('express').Router();

const db = require('../db-config');

const { verifyToken } = require('../middlewares/auth');

screenRoutes.get('/', (req, res) => {
  db.query('SELECT * FROM candidates', (err, results) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.status(200).json(results);
    }
  });
});

screenRoutes.get('/:id', (req, res) => {
  db.query('SELECT * FROM candidates WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      res.status(500);
    } else {
      res.status(200).json(results);
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
      res.sendStatus(500);
    } else {
      res.status(201).json({
        ...candidate, id: results.insertId,
      });
    }
  });
});

screenRoutes.put('/:id', (req, res) => {
  const candidateId = req.params.id;
  db.query('SELECT * FROM candidates WHERE id = ?', [candidateId], (selectErr, results) => {
    if (selectErr) {
      res.status(500).send('Error updating the candidates');
    } else {
      const candidate = results[0];
      if (candidate) {
        const candidateToUpdate = { ...candidate, ...req.body };
        db.query('UPDATE candidates SET ? WHERE id = ?', [candidateToUpdate, candidateId], (updateErr) => {
          if (updateErr) {
            console.log(updateErr);
            res.sendStatus(500);
          } else {
            res.status(200).json(candidateToUpdate);
          }
        });
      }
    }
  });
});

screenRoutes.delete('/:id', (req, res) => (
  db.query('DELETE FROM candidates WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else if (results.affectedRows) res.status(200).send(' 🎉 candidate deleted');
    else res.status(404).send('candidate not found');
  })
));

// Candidate's soft skills routes
screenRoutes.get('/:candidate_id/softskills', (req, res) => {
  const candidateId = req.params.candidate_id;
  db.query('SELECT name, username, softskills FROM candidates INNER JOIN candidate_softskill ON candidates.id=candidate_softskill.candidate_id INNER JOIN softskills ON candidate_softskill.softskill_id=softskills.id ORDER BY name, username, softskills',
    [candidateId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).json(results);
      }
    });
});

screenRoutes.post('/:candidate_id/softskills', (req, res) => {
  const candidateSkills = {
    linked_number: req.body.linked_number,
    softskill_id: req.body.softskill_id,
  // candidate_id: req.body.candidate_id,
  };
  const candidateId = req.params.candidate_id;
  db.query('INSERT INTO candidate_softskill(linked_number, softskill_id, candidate_id) VALUES (?, ?, ?)',
    [candidateSkills.linked_number, candidateSkills.softskill_id, candidateId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error saving Candidate softskills');
      } else {
        const updatedCandidateSkills = {
          id: results.insertId,
          candidateId,
          linkedNumber: candidateSkills.linked_number,
          softskillId: candidateSkills.softskill_id,
        };
        res.status(201).send(updatedCandidateSkills);
      }
    });
});

// Candidate's hard skills routes
screenRoutes.get('/:candidate_id/hardSkills', (req, res) => {
  const candidateId = req.params.candidate_id;
  db.query('SELECT candidates.name, candidates.username, hardSkills.hardSkillsName FROM candidates INNER JOIN candidate_hardSkills ON candidates.id=candidate_hardSkills.candidate_id INNER JOIN hardSkills ON candidate_hardSkills.hardSkill_id=hardSkills.id ORDER BY candidates.name, candidates.username, hardSkills.hardSkillsName',
    [candidateId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).json(results);
      }
    });
});

screenRoutes.post('/:candidate_id/hardSkills', (req, res) => {
  const candidateHardSkills = {
    hardSkill_id: req.body.hardSkill_id,
  };
  const candidateId = req.params.candidate_id;
  db.query('INSERT INTO candidate_hardSkills(hardSkill_id, candidate_id) VALUES (?, ?)',
    [candidateHardSkills.hardSkill_id, candidateId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error saving Candidate hardskills');
      } else {
        const updatedCandidateHardSkills = {
          id: results.insertId,
          candidateId,
          softskillId: candidateHardSkills.hardskill_id,
        };
        res.status(201).send(updatedCandidateHardSkills);
      }
    });
});
module.exports = screenRoutes;
