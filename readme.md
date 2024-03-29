# neo4j-graphviz

Minimal Javascript library/tool for generating *dot* and graphviz renderings from a Neo4j Cypher query.

Uses these libraries

* neo4j-driver
* graphviz

## Command Linse Usage

### Minimal:

`node render.js password`

Will write a graph.jpg based on `MATCH path = (a)-[r]->(b) RETURN path`

### Syntax

```
cat query.cypher | node render.js password [file.png/svg/jpg] [renderer]
```


### Example:

From the [Oscars Graph](http://gist.asciidoctor.org/?dropbox-14493611/oscars.adoc).

```
echo 'MATCH  path = (n:Nominee {name:"Meryl Streep"})<-[:NOMINATED]-(a:Nomination)-->() RETURN path' | node render.js '****' oscars.svg neato
```

![](https://rawgithub.com/jexp/neo4j-graphviz/master/oscars.svg)


## Programmatic Usage

see also `express-test.js`

```
var ng = require("neo4j-graphviz");

app.get('/', function(req, res){
  var type = "svg";
  ng.renderGraph("bolt://localhost","neo4j", pwd, req.param("query"), "neato", type, function(error,data) {
    if (error) res.status(500).send(error);
    else {
      res.type(type).send(data);
    }
  });
});```

## Heroku deployment

https://elements.heroku.com/buildpacks/weibeld/heroku-buildpack-graphviz

```
heroku apps:create <app-name>
heroku buildpacks:add https://github.com/weibeld/heroku-buildpack-graphviz

heroku config:set NEO4J_URL="neo4j+s://demo.neo4jlabs.com" NEO4J_USER=movies NEO4J_PASSWORD=movies NEO4J_DATABASE=movies
heroku config:set GRAPHVIZ=/app/.heroku-buildpack-graphviz/usr/bin

git push heroku master
```