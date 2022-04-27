var express = require('express');
var router = express.Router();
const xml2js = require("xml2js");
const moment = require("moment");
const fetch = require("node-fetch");
var fs = require("fs");
const { parse } = require('path');
const fileDir = "../data/";

router.post("/save", async (req, res) => {
  console.log(req.body);
  let wikiLink = "";

  //fetching wikipedia article
  if (req.body.wiki.length > 0) {
    var url = "https://en.wikipedia.org/w/api.php"; 

    var params = {
        action: "opensearch",
        search: req.body.wiki,
        limit: "1",
        namespace: "0",
        format: "json"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];})

    let response = await fetch(url);
    let data = await response.json();

    if (data[3][0]) {
      console.log(data[3][0]);
      wikiLink = data[3][0];
    }
  }

  fs.readFile(fileDir+"data.xml", (err, data) => {
    if (err) throw new Error(err);

    const parser = new xml2js.Parser();

    parser.parseStringPromise(data)
      .then((response) => {
        console.log(response);
        console.log(response.data.topic);
        console.log(response.data.topic[0].note);

        let topicFound = false;
        for (let key in response.data.topic) {
          if (req.body.topic === response.data.topic[key].$.name) {
            response.data.topic[key].note.push({"$": {"name": req.body.header}, "text": req.body.body, "timestamp": moment(new Date()).format("MM/DD/YY - HH:MM:SS"), "wikiInfo": wikiLink})
            topicFound = true;
          }
        }

        if (!topicFound) {
          response.data.topic.push({
            "$": {"name": req.body.topic},
            "note": [
              {
                "$": {"name": req.body.header},
                "text": req.body.body,
                "timestamp": moment(new Date()).format("MM/DD/YY - HH:MM:SS"),
                "wikiInfo": wikiLink
              }
            ]
          })
        }

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(response);

        fs.writeFile(fileDir+"data.xml", xml, (err) => {
          if (err) {
            console.log(err);
            res.json({message: "not ok"});
          }
          else res.json({message: "ok"});
        });
      })
      .catch((err) => {
        console.log(err);
      })
  })
  
})

router.get("/notes", (req, res) => {
  fs.readFile(fileDir+"data.xml", (err, data) => {
    if (err) throw new Error(err);

    const parser = new xml2js.Parser();

    parser.parseStringPromise(data)
      .then((response) => {
        console.log(response.data.topic);
        res.json(response.data.topic);
      })
      .catch(err => {
        console.log(err);
        res.json({message: "Error in fetching from 'database'"});
      })
    })
})

router.post("/islegit", async (req, res) => {

  let wikifromIsLegit = false;

  let wikifrom;
  let wikito;

  //fetching wikipedia article
  if (req.body.wikifrom != null && req.body.wikifrom.length > 0) {
    var url = "https://en.wikipedia.org/w/api.php"; 

    var params = {
        action: "opensearch",
        search: req.body.wikifrom,
        limit: "5",
        namespace: "0",
        format: "json"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];})

    let response = await fetch(url);
    let data = await response.json();

    if (data[1][0]) {
      wikifrom = data[1][0];
      wikifromIsLegit = true;
    } else {
      return res.json({error: "not legit"});
    }
  } else {
    return res.json({error: "not legit"});
  }

  if (!wikifromIsLegit) res.json({error: "not legit"});

  if (req.body.wikito != null && req.body.wikito.length > 0) {
    var url = "https://en.wikipedia.org/w/api.php"; 

    var params = {
        action: "opensearch",
        search: req.body.wikito,
        limit: "5",
        namespace: "0",
        format: "json"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];})

    let response = await fetch(url);
    let data = await response.json();

    if (data[1][0]) {
      wikito = data[1][0];
      return res.json({message: "is legit", wikifrom: wikifrom, wikito: wikito});
    } else {
      return res.json({error: "not legit"});
    }
  } else {
    return res.json({error: "not legit"});
  }
})

module.exports = router;
