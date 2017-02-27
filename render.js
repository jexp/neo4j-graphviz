var ng = require("./neo4j-graphviz");

function renderGraphCommand(query) {
    // var query = "MATCH path = (a)-[r]->(b) WITH * LIMIT 100 RETURN collect(r), collect({a:a,b:b})";
    query = query || "MATCH path = (a)-[r]->(b) RETURN path LIMIT 100";
    
    var pwd = process.argv[2] || "test";
    var file = process.argv[3] || "graph.jpg";
    
    var use = process.argv[4] || "neato";
    ng.renderGraph("bolt://localhost","neo4j",pwd,query,use,file);
}

if (process.argv.length > 2) {
    var query="";
    process.stdin
    .on('data', function (data) { query += data.toString(); })
    .on('end', function() { renderGraphCommand(query); });
} else {
	console.log("Usage: echo 'MATCH path = (a)-[r]->(b) RETURN path LIMIT 10' | node render.js '****' [file.png/svg/jpg] [neato] ");
}
