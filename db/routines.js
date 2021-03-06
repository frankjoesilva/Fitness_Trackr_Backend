const client = require('./client');

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
        INSERT INTO Routines("creatorId", "isPublic", name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `, [creatorId, isPublic, name, goal]);
    return routine;
  } catch (error) {
    throw error;
  }
}


async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
        SELECT *
        FROM Routines;
      `);
    return rows
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id = $1
      `, [id]);
    return routine
  } catch (error) {
    throw error
  }
}


async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');
  const objValues = Object.values(fields)
  if (setString.length === 0) {
    return;
  }
  objValues.push(id)
  try {
    const { rows: [routine] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id = $${objValues.length}
      RETURNING *;
    `, objValues);
    return routine;
  } catch (error) {
    throw error;
  }
}


async function destroyRoutine(id) {

  try {
    await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId"=$1;
   `, [id]);
    const { rows: [routine] } = await client.query(`
      DELETE 
      FROM routines
      WHERE id = $1
      RETURNING *
      `, [id]);

    return routine;

  } catch (error) {
    throw error
  }
}

async function getActivitiesByRoutineId(id) {
  try {
    const { rows: activities } = await client.query(`

      SELECT *
      FROM activities a
      JOIN (SELECT duration, count, "routineId", "activityId" FROM routine_activities) ra
      ON ra."activityId" = a.id
      WHERE "routineId" = $1
        `, [id]);
    return activities
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, routine_activities.count, routine_activities.duration
      FROM routines, users, routine_activities
      WHERE routine_activities."routineId" = routines.id
      AND routines."creatorId" = users.id;`)
    const addingActivitiesToRoutines = await Promise.all(routines.map(async routine => {
      routine.activities = await getActivitiesByRoutineId(routine.id);
      return routine;
    }))
    return addingActivitiesToRoutines;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    // const { rows: routines } = await client.query(`
    //   SELECT DISTINCT users.username AS "creatorName", routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal
    //   FROM users, routines, routine_activities
    //   WHERE routine_activities."routineId" = routines.id
    //   AND routines."creatorId" = users.id
    //   AND routines."isPublic" = true
    //   `)
    const { rows: routines } = await client.query(`
    SELECT DISTINCT users.username AS "creatorName", routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal
    FROM users, routines, routine_activities
    WHERE routines."creatorId" = users.id
    AND routines."isPublic" = true
    `)
    const addActivitiesToRoutine = await Promise.all(routines.map(async routine => {
      routine.activities = await getActivitiesByRoutineId(routine.id);
      return routine;
    }))
    return addActivitiesToRoutine;
  } catch (error) {
    throw error
  }
}


async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON users.id = routines."creatorId"
    WHERE users.username = $1
        `, [username])
    const addActivitiesToRoutine = await Promise.all(routines.map(async routine => {
      routine.activities = await getActivitiesByRoutineId(routine.id);
      return routine;
    }))
    return addActivitiesToRoutine;
  } catch (error) {
    throw error
  }
}


async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal
      FROM users, routines, routine_activities
      WHERE routine_activities."routineId" = routines.id
      AND routines."creatorId" = users.id
      AND users.username = $1
      `, [username])
    const addActivitiesToRoutine = await Promise.all(routines.map(async routine => {
      routine.activities = await getActivitiesByRoutineId(routine.id);
      return routine;
    }))
    return addActivitiesToRoutine;
  } catch (error) {
    throw error
  }
}


async function getPublicRoutinesByActivity() {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM users, routines, routine_activities
      WHERE routine_activities."routineId" = routines.id
      AND routines."creatorId" = users.id
      AND routines."isPublic" = true
      `)
    const addActivitiesToRoutine = await Promise.all(routines.map(async routine => {
      routine.activities = await getActivitiesByRoutineId(routine.id);
      return routine;
    }))
    return addActivitiesToRoutine;
  } catch (error) {
    throw error
  }
}


module.exports = {
  client,
  createRoutine,
  getActivitiesByRoutineId,
  getRoutinesWithoutActivities,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  destroyRoutine,

}