// usage: http://localhost:3000/?query=match%20path=(n)-->(m)%20return%20path%20limit%20100
var express = require('express');
var ng = require("./neo4j-graphviz");

var pwd = '****';
var app = express();

app.get('/', function(req, res){
  var type = "svg";
  ng.renderGraph("bolt://localhost","neo4j", pwd, req.param("query"), "neato", type, function(error,data) {
    if (error) res.status(500).send(error);
    else {
      res.type(type).send(data);
    }
  });
});
app.listen(3000);