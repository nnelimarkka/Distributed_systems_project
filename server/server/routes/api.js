var express = require('express');
var router = express.Router();
const moment = require("moment");
const fetch = require("node-fetch");
const cp = require("child_process");
const { resolve } = require('path');

let Q = []; //queue of articles (titles) to be explored
let Q1 = []; //queue for articles found on a hop
let exploredArticles = [];

//initializing three workers that run on separate threads
let workers = [
    {worker: cp.fork("./worker/worker.js"), working: 0},
    {worker: cp.fork("./worker/worker.js"), working: 0}
    //{worker: cp.fork("./worker/worker.js"), working: 0}
];

router.get("/test/:title", (req, res) => {
  let title = req.params.title;

  if (title == null) res.send({message: "KO"});

  workers.forEach((worker, index) => {
    searchLinks(title, "N/A", index)
    .then(result => console.log(result))
    .catch(err => console.log(err))
  });

  res.send({message: "ok"});
})

router.get("/test", (req, res) => {
  workers.forEach((worker, index) => {
    testWorker(index)
    .then(result => console.log(result +" "+index ))
    .catch(err => console.log(err))
  });

  res.send({message: "ok"});
})

router.post("/search", async (req, res) => {
    
    let rTime = moment.now();
    let wikifrom = req.body.wikifrom;
    let wikiTo = req.body.wikito;
    let routeFound = false;
    let routeString = wikifrom + " -> ";
    let hopCount = 1;
    let firstHop = true;
    console.log(wikifrom, wikiTo);

    //Queue first article it for exploring and add it to list of explored articles 
    Q.push(wikifrom);
    exploredArticles.push(wikifrom);
    

    let loop = setInterval(() => {
        if ((Q.length == 0) && workersInactive()) {
          // Q is empty and workers have finished
          //copy Q1 to Q and empty Q1
          //a hop is complete

          hopCount++;
          firstHop = false;

          console.log("Current hops: "+hopCount);
          
          Q1 = removeDuplicates(Q1);
          Q1.forEach(title => {
            if (!isExplored(title)) {
              Q.push(title);
              exploredArticles.push(title);
            }
          })
          Q1.length = 0; //empty Q1
        }

        else if (Q.length > 0) {
          workers.every((w, i) => {
            if (w.working == 1) return true; //worker is working, skip to next iteration of every()
  
            //this is done only if a free worker is found
            let title = Q.shift();
            w.working == 1;
            console.log("Searching links from: "+title);
            searchLinks(title, wikiTo, i)
            .then(result => {
              //console.log(result);
              if (result.Destination.normalize() === "yes") {
                clearInterval(loop);
                w.working = 0;
                let sTime = moment.now();
                let elapsedSeconds = (sTime - rTime)/1000;
                let message = "Route from "+wikifrom+" to "+wikiTo+" found in "+hopCount+" clicks! Search took "+elapsedSeconds+" seconds.";
                res.send({message: message});
              } else if (result.Links != null) {
                result.Links.forEach(link => {
                  Q1.push(link); // push links to Q1
                }) 
              }
              w.working = 0;
            })
            .catch(err => console.log(err))
            return false;
          })
        }  
    }, 500);
})

function isExplored(title) {
  exploredArticles.forEach(exploredArticle => {
    if (exploredArticle == title) return true;
  })
  return false;
}

function testWorker(workerIndex) {
  return new Promise((resolve, reject) => {
    function testWorkerListener (message) {
      resolve(message.result);
      workers[workerIndex].worker.removeListener("message", testWorkerListener);
    }

    workers[workerIndex].worker.addListener("message", testWorkerListener);

    workers[workerIndex].worker.send({cmd: "test"});
  })
}

function searchLinks(title, destination, workerIndex) {
  return new Promise((resolve, reject) => {
    function workerListener (message) {
      resolve(message.result);
      workers[workerIndex].worker.removeListener("message", workerListener);
    }

    workers[workerIndex].worker.addListener("message", workerListener);

    workers[workerIndex].worker.send({cmd: "search", title: title, destination: destination});
  })
}

//check if any workers are currently working
function workersInactive() {
  for (let i = 0; i<workers.length; i++) {
    if (workers[i].working == 1) return false;
  }
  return true;
}

//Removing duplicate element from array, source: https://www.geeksforgeeks.org/how-to-remove-duplicate-elements-from-javascript-array/
function removeDuplicates(arr) {
  return arr.filter((item, 
      index) => arr.indexOf(item) === index);
}

module.exports = router;