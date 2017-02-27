# neo4j-graphviz

Minimal Javascript library/tool for generating *dot* and graphviz renderings from a Neo4j Cypher query.

Uses these libraries

* neo4j-driver
* graphviz

Minimal:

`node index.js password`

Will write a graph.jpg based on `MATCH path = (a)-[r]->(b) RETURN path`

## Usage:

```
echo 'MATCH path = (a)-[r]->(b) RETURN path LIMIT 10' | node index.js password [file.png/svg/jpg] [neato]
```


## Example:

From the [Oscards Graph](http://gist.asciidoctor.org/?dropbox-14493611/oscars.adoc).

```
echo 'MATCH  path = (n:Nominee {name:"Meryl Streep"})<-[:NOMINATED]-(a:Nomination)-->() RETURN path' | node index.js '****' oscars.svg neato
```

![](https://rawgithub.com/jexp/neo4j-graphviz/master/oscars.svg)
