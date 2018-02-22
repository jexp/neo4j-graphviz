"use strict";

const ng = require("./neo4j-graphviz");
const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage')

const optionDefinitions = [
    { name: 'query', alias: 'q', defaultOption: true, description: "Cypher query; default whole graph." },
    { name: 'username', alias: 'u', defaultValue: "neo4j", description: "Neo4j username; default neo4j." },
    { name: 'password', alias: 'p', defaultValue: "neo4j", description: "Neo4j password; default neo4j." },
    { name: 'host', alias: 'h', defaultValue: "localhost", description: 'Neo4j host; default "localhost".' },
    { name: 'port', alias: 'o', description: 'Neo4j Bolt port; only required if Bolt runs on non-default port.' },
    { name: 'file', alias: 'f', defaultValue: "graph.jpg", description: 'file name or path to write output to; default "graph.jpg".' },
    { name: 'renderer', alias: 'r', defaultValue: "neato", description: 'GraphViz renderer; default "neato".' },
    { name: 'graphVizPath', alias: 'g', description: 'Path to the GraphViz binaries, if not on PATH.' },
    { name: 'help', type: Boolean, description: 'Show this help page.' }
];

let options;
try {
    options = commandLineArgs(optionDefinitions);
} catch(exception) {
    options = false;
}

if(!options || options.help) {
    console.log(getUsage([
        {
            header: "neo4j-graphviz",
            content: 'Generates graphviz (dot) renderings from a Neo4j Cypher query.'
        },
        {
            header: "Usage",
            content: 'node render.js [--query|-q] [query] [other options]\n\n' +
            'If no query is given, standard input is parsed as query. If that is also not given, the whole graph is rendered.'
        },
        {
            header: "Options",
            optionList: optionDefinitions
        }
    ]));
    process.exit(0);
}

const neo4jUrl = `bolt://${options.host}` + (options.port ? `:${options.port}` : '');
const outputFilePath = options.file.indexOf('/') === -1 ? `${__dirname}/${options.file}` : options.file;

function renderGraphCommand(query) {
    query = query || "MATCH (a) OPTIONAL MATCH path = (a)-[r]->(b) RETURN a, path";

    ng.renderGraph(neo4jUrl, options.username, options.password, query, options.graphVizPath, options.renderer, outputFilePath);
}

if(options.query) {
    renderGraphCommand(options.query);
} else {
    let query="";
    process.stdin
        .setEncoding('utf8')
        .on('readable', () => query += process.stdin.read())
        .on('end', ()  => renderGraphCommand(query));
}

