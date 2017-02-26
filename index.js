/*
npm install --save neo4j-driver
npm install --save graphviz

Minimal:
node index.js '****'

Usage:
echo 'MATCH path = (a)-[r]->(b) RETURN path LIMIT 10' | node index.js '****' [file.png/svg/jpg] [neato]
*/

var neo4j = require('neo4j-driver').v1;
var graphviz = require('graphviz');

function merge(o1,o2) {
	for(var k in o2) {
		if (o2.hasOwnProperty(k)) {
			o1[k]=o2[k];
		}
	}
	return o1;
}

function getId(field) {
	return field.constructor.name == "Integer" ? field.toString() : (field.identity) ? field.identity.toString() : null;
}
function name(node) {
	var x = ["^name$","^title$","^label$","name$","title$","label$"];
    var props = node.properties;
	for (var i=0;i<x.length;i++) {
		for (k in props) {
			if (props.hasOwnProperty(k) && k.toLowerCase().match(x[i])) return props[k];
		}
	}
	return node.labels.join(" ");
}

function addGraphData(digraph, data, field) {
        if (!field) return;
        var type = field.constructor.name;
		var id = getId(field);
// console.log(typeof(field),id,field.constructor.name); // ,field)
        if (type == "Integer") return field.toString();
   		if (type == "Node") {
				if (!(id in data.nodes)) {
				data.nodes[id]=field;
				var n = digraph.addNode(id, {label:name(field)}); // merge({lblString:field.labels},field.properties));
				n.set( "style", "filled" );
				return n;
			}
		}
		if (type == "Relationship") {
			if (!(id in data.rels)) {
				data.rels[id]=field;
//				console.log("addEdge",getId(field.start), getId(field.end))
				var e = digraph.addEdge(getId(field.start), getId(field.end),{label:field.type}); // , merge({type:field["type"]}, field.properties));
				e.set( "color", "black" );
				return e;
			}
		}
		if (type == "Path") {
			return field.segments.map(function(segment) {
//				console.log(segment);
				return [addGraphData(digraph,data,segment.start), addGraphData(digraph,data,segment.relationship),addGraphData(digraph,data,segment.end)];
			});
			
		}
		if (type == "Array") {
			return field.map(function(element) { addGraphData(digraph,data, element); });
		}
		if (type == "Object") {
			return Object.keys(field).map(function(key) { addGraphData(digraph,data, field[key]); });
		}
		return null;
}
function addRecord(digraph, data, record) {
	record._fields.forEach(function(field) {
		addGraphData(digraph,data,field)
	});
}

function renderGraph(query) {
	// var query = "MATCH path = (a)-[r]->(b) WITH * LIMIT 100 RETURN collect(r), collect({a:a,b:b})";
	query = query || "MATCH path = (a)-[r]->(b) RETURN path LIMIT 100";
	
	var pwd = process.argv[2] || "test";
	var file = process.argv[3] || "graph.jpg";
	var file_type = file.split(".").pop();
	
	var use = process.argv[4] || "neato";
	
	console.log(file,file_type,use, query);
	
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", pwd));
	driver.onError = function(error) {
	  console.log('Driver instantiation failed', error);
	};
	
	var session = driver.session();
	
	
	session
	  .run(query)
	  .then(function(result){
	    var data = { nodes: {}, rels: {} }
	    // Create digraph G
	    var g = graphviz.digraph("G");
	    g.set("overlap",false);
	    result.records.forEach(function(record) {
	      addRecord(g, data, record);
	    });
	    // Print the dot script
	    // console.log( g.to_dot() ); 
	    session.close();
		driver.close();
	
	    g.setGraphVizPath( "/usr/local/bin" );
	    // Generate a file output
	    g.render( {use:use, type:file_type}, file );
	    console.log("Wrote file "+file)
	    // Generate a callback output
	    g.render( {use:use, type:file_type}, function(data) { console.log( file,data.length)});
	  })
	  .catch(function(error) {
	    console.log(error);
	  });
		
}

var query="";
process.stdin
.on('data', function (data) { query += data.toString(); })
.on('end', function() { renderGraph(query); });
