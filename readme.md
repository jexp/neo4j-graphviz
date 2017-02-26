# neo4j-graphviz

Minimal Javascript library/tool for generating dot and graph renderings from a Neo4j Cypher query

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
