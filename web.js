// usage: http://localhost:3000/?query=match%20path=(n)-->(m)%20return%20path%20limit%20100
const express = require('express');
const ng = require("./neo4j-graphviz");

const app = express();

const url=process.env.NEO4J_URL || "neo4j://localhost";
const user=process.env.NEO4J_USER || "neo4j";
const pass=process.env.NEO4J_PASSWORD || "test";
const db=process.env.NEO4J_DATABASE || "neo4j";

app.get('/', function(req, res){
  const type = req.accepts("image/jpeg")||req.accepts("image/jpg") ? "jpeg" : 
               req.accepts("image/svg") || req.accepts("image/svg+xml") ? "svg" : "png";
  const style= "neato";
  const query = req.query.query || `MATCH (n)-[r]->(m) RETURN * LIMIT 20`;
  ng.renderGraph(url,user, pass, db, query, style, type, function(error,data) {
    if (error) res.status(500).send(error);
    else {
      res.type("image/"+type).send(data);
    }
  });
});

app.use('/3d', express.static('public'))

const port = process.env.PORT || 3001;
console.log(`Server started on ${port} against ${url} user ${user} db ${db}`);
app.listen(port);