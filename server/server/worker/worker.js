//help on child process threads from: https://www.youtube.com/watch?v=_AXooxH7PVw

const process = require("process");
const fetch = require("node-fetch");
const { title } = require("process");
const wikiUrl = "https://en.m.wikipedia.org/w/api.php?action=query&format=json&prop=links&pllimit=max&plnamespace=0&titles=";
let destinationTitle;

function fetchRetry(url, tries) {
    //help for retrying fetch: https://stackoverflow.com/questions/46175660/fetch-retry-request-on-failure
    function onError(err) {
        let triesLeft = tries - 1;
        if(!triesLeft){
            throw err;
        }
        //If wikipedia gave incorrect json as response (propably rate limiting), then try again after random timeout (up to 3 times)
        return delay(getRandomInt(1000, 3000)).then(() => fetchRetry(url, triesLeft));
    }
    return fetch(url).catch(err => onError(err));
}

function searchLinks(title, tries) {
    return new Promise((resolve, reject) => {
        let searchUrl = wikiUrl + title;
        let foundLinks = [];

        fetchRetry(searchUrl, tries)
        .then(response => response.json())
        .then(data => {
            // help from: https://www.youtube.com/watch?v=RPz75gcHj18&list=PLYlkuPVFY_kGY42Hjj9D-VQxNqmmhyOzo&index=1&t=937s
            let page = data.query.pages;
            let pageId = Object.keys(data.query.pages)[0];
            let links = page[pageId].links;
    
            if (links === null) {
                resolve(null);
            }
    
            links.forEach(link => {
                foundLinks.push(link.title)
            });

            resolve(foundLinks);
        })
        .catch(err => {
            reject(new Error(err));
        })
    })
    
}

function containsFinalDestination(links) {
    if (links === null) {
        return "no";
    }
    for (let i = 0; i<links.length; i++) {
        if (links[i].normalize() === destinationTitle.normalize()) {
            return "yes";
        } 
    }
    return "no";
}

//getting random int for delay. Solution from: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const delay = (ms) => {
    new Promise(resolve => setTimeout(resolve, ms));
}

process.on("message", async (message) => {
    switch(message.cmd) {
        case "search":
            destinationTitle = message.destination;

            let tries = 3;

            try {
                console.log("searching");
                let foundLinks = await searchLinks(message.title, tries)
            
                let isFinal = containsFinalDestination(foundLinks);
                process.send({
                    result: {
                        Links: foundLinks,
                        Destination: isFinal
                    }
                });
            } catch (err) {
                process.send({
                    result: {
                        Links: null,
                        Destination: "error"
                    }
                });
            }

            break;

        case "test":
            process.send({
                result: "ok"
            })
    }
})