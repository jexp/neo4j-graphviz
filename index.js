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
// colors from: http://flatuicolors.com/
var colors = {all:["#2ecc71","#1abc9c","#3498db","#9b59b6","#34495e","#16a085","#f1c40f","#e67e22",
                   "#e74c3c","#95a5a6","#f39c12","#2980b9","#8e44ad","#27ae60","#2c3e50","#bdc3c7",
                   "#c0392b","#d35400"], 
              used:{}};

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
function labels(node) {
	return ":"+node.labels.join(":");
}
function name(node) {
	var x = ["^name$","^title$","^label$","value","name$","title$","label$",""];
    var props = node.properties;
	for (var i=0;i<x.length;i++) {
		for (k in props) {
			if (props.hasOwnProperty(k) && k.toLowerCase().match(x[i])) return props[k];
		}
	}
	return node.identity.toString();
}

function addGraphData(digraph, data, field) {
        if (!field) return;
        var type = field.constructor.name;
		var id = getId(field);
// console.log(typeof(field),id,field.constructor.name); // ,field)
        if (type == "Integer") return field.toString();
   		if (type == "Node") {
				if (!(id in data.nodes)) {
				var nLabels = labels(field);
				var color = colors.used[nLabels] || colors.all.pop() || ["white","black"];
				if (!(nLabels in colors.used)) {
					colors.used[nLabels] = color;
				}
				data.nodes[id]=field;
				var n = digraph.addNode(id, {label:nLabels + "|" + name(field)}); // merge({lblString:field.labels},field.properties));
				n.set( "style", "filled" );
				n.set( "shape", "Mrecord" );
				n.set( "fillcolor", color );
				n.set( "fontcolor", "white" );
				n.set("fontname","Helvetica");
				return n;
			}
		}
		if (type == "Relationship") {
			if (!(id in data.rels)) {
				data.rels[id]=field;
//				console.log("addEdge",getId(field.start), getId(field.end))
				var e = digraph.addEdge(getId(field.start), getId(field.end),{label:field.type}); // , merge({type:field["type"]}, field.properties));
				e.set( "color", "#00 00 00 40" );
				e.set("fontname","Helvetica");
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
	    g.set("concentrate",true);
	    g.set("K",0.2);
	    g.set("outputorder","edgesfirst");
	    g.set("splines","curved");
	    g.set("rankdir","LR");
	    g.set("dpi",50);
	    g.set("fontname","Helvetica");
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
