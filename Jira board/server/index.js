//if moving down, set all above to -1. if moving up, sett all below to +1

var fs = require('fs');
const _tasks = fs.readFileSync('./tasks.JSON', 'utf8');
const _phases = fs.readFileSync('./phases.JSON', 'utf8');
const _columns = fs.readFileSync('./columns.JSON', 'utf8');
var TASKS = JSON.parse(_tasks);
var PHASES = JSON.parse(_phases);
var COLUMNS = JSON.parse(_columns);
//console.log(TASKS, COLUMNS, PHASES);
const express = require('express');

const app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies



app.listen(3030, () =>
  console.log('Express server is running on localhost:3030')
);

function sendTasks(request, response) {
  let tasksToSend = [...TASKS]
  const reqStage = request.query.stage
  const reqPhase = request.query.phase
  // console.log("sending all")
  // console.log("Requests: ", reqPhase, reqStage)
  if (reqPhase) {
    tasksToSend = tasksToSend.filter(task => task.phase.toString() === reqPhase)
  }
  if (reqStage) {
    tasksToSend = tasksToSend.filter(task => task.stage.toString() === reqStage)
  }
  response.send(tasksToSend);
}

function writeToFile(filename, obj) {
  const JSONToWrite = JSON.stringify(obj)
  fs.writeFile(filename, JSONToWrite, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
}

/** REST CALLS */

/** GET */
//Test
app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

/** For retrieving tasks. Takes two optional params of phase and stage which will accordingly return only those tasks with the passed stage/phase
 * example use:
 * fetch('/api/tasks?phase=1&stage=2').then(...)
*/
app.get('/api/tasks', sendTasks);

app.get('/api/phases', (req, res) => {
  res.send(PHASES)
})

app.get('/api/columns', (req, res) => {
  const id = req.query.id;
  //console.log(id)
  if (id !== undefined){
    const foundColumn = COLUMNS.columns.find(column => column.id === id)
    if (foundColumn !== undefined) {
      res.send(foundColumn)
    }

    else {
      res.status(404).send({
        message: 'Column ID not found'
     });
    }
  }
  else {
    res.send(COLUMNS.columns);
  }
})

/** POST */
/** For adding a new task. Takes a JSON object as parameter and adds it to tasks 
 * 
 * Example of JSON object:
 * 
  {
    "id": "task19",
    "content": "DATA Synch 999",
    "points": 2,
    "stage": 5,
    "phase": 1,
    "relativePosition": 2
  }
 * If a task id is already in the array, it is overwritten instead of added
*/
app.post('/api/tasks', (req, res) => {
  let newTask = req.body
  //console.log("GOT TASK >", newTask)
  if (newTask !== undefined) {
    //check if task already inside, if yes then overide else push the new task
    let taskIndex = TASKS.findIndex(task => task.id === newTask.id)
    if (taskIndex >= 0) {
      TASKS[taskIndex] = newTask
    }
    else {
      TASKS.push(newTask);
    }
    writeToFile("./tasks.JSON", TASKS);
  }
  res.send("ok");
})

/** For saving new state, ideally when app is closed */
app.post('/api/save', (req, res) => {
  let newTasks = req.body
  //console.log("GOT TASK TO SAVE>", req.body)
  if (newTasks) {
    newTasks.forEach(newTask => {
      let taskIndex = TASKS.findIndex(task => task.id === newTask.id)
      if (taskIndex >= 0) {
        TASKS[taskIndex] = newTask
      }
      else {
        TASKS.push(newTask);
      }
    })
    writeToFile("./tasks.JSON", TASKS);
  }
  res.send("ok");
})

/** For updating the number of phases. Example of JSON object:
 * {"phases": 7}
 */
app.post('/api/phases', (req, res) => {
  let newPhase = req.body
  //console.log("GOT TASK >", newPhase)
  if (newPhase !== undefined) {
    PHASES = newPhase
    writeToFile("./phases.JSON", PHASES);
  }
  res.send("ok");
})

/** For adding/updating a column. Takes a JSON object as parameter and adds it to columns 
 * 
 * Example of JSON object:
 * 
  {
    "id": "column10",
    "name": "TESTING123"
  }
 * If a column id is already in the array, it is overwritten instead of added
*/
app.post('/api/columns', (req, res) => {
  let newColumn = req.body
  //console.log("GOT Column >", newColumn)
  if (newColumn !== undefined) {
    //check if task already inside, if yes then overide else push the new task
    let columnIndex = COLUMNS.columns.findIndex(column => column.id === newColumn.id)
    if (columnIndex >= 0) {
      COLUMNS.columns[columnIndex] = newColumn
    }
    else {
      COLUMNS.columns.push(newColumn);
    }
    writeToFile("./columns.JSON", COLUMNS);
  }
  res.send("ok");
})

/** For resetting all data */
app.post('/api/reset', (_, res) => {
  TASKS = []
  writeToFile("./tasks.JSON", TASKS);
  res.send("ok");
})

/** DELETE */
/** For deleting a task. Takes a string of the task id to delete i.e. {"id:" : "task18"} */
app.delete('/api/tasks', (req, res) => {
  let delTaskID = req.body.id
  //console.log("GOT TASK ID >", delTaskID)
  let delIndex = TASKS.findIndex(task => task.id === delTaskID)
  //console.log("Found at >", delIndex)
  if (delIndex >= 0) {
    TASKS.splice(delIndex, 1);
    //console.log("After Deleting >", TASKS)
    writeToFile("./tasks.JSON", TASKS);
  }
  res.send("ok");
})

/** For deleting a column. Takes a string of the column id to delete i.e. {"id:" : "column9"} */
app.delete('/api/columns', (req, res) => {
  let delTaskID = req.body.id
  //console.log("GOT COLUMN ID >", delTaskID)
  let delIndex = COLUMNS.columns.findIndex(column => column.id === delTaskID)
  //console.log("Found at >", delIndex)
  if (delIndex >= 0) {
    COLUMNS.columns.splice(delIndex, 1);
    //console.log("After Deleting >", COLUMNS.columns)
    writeToFile("./columns.JSON", COLUMNS);
  }
  res.send("ok");
})

