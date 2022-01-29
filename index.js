
const {parse} = require('csv-parse');
const fs = require('fs');
const http = require('http');

const forwardList = [];
const playerList = [];
const messageList = [];

let params = [];

function isForward(player) {
    return player['Current_Club'] === "Arsenal";    
}


//Read from CSV
fs.createReadStream('player_data.csv')
    .on('error', (error) => {
        console.log(error)
    })
    .pipe(parse({
        comment: '#',
        columns: true,
    }))
    .on('data', (data) => {
        playerList.push(data);

        if(isForward(data,params[1])) {
            forwardList.push(data);
        }
    })


//Creating Server without any third party
const PORT = 3000;
const server = http.createServer();

 server.on('request', (req,res) => {
    params = req.url.split('/');

    if(req.method === "POST" && params[1] === "messages") {
        req.on('data', (data) => {
            const message = data.toString();
            console.log('Request:', message);
            messageList.push(JSON.parse(message))
        });
        return req.pipe(res);
    }

    if(req.method === "GET" && params[1] === "players") {

    res.writeHead(200, {
        'Content-Type': 'application/json',
    });

    if( params.length === 3) {
        let team = params[2];
        let squad = playerList.filter(players => players.Current_Club === team);
        res.end(JSON.stringify({
            squad
        }))
     } else {
        res.end(JSON.stringify({
            playerList
        }))
     }
    }
    
    if (req.method === "GET" && req.url === '/') {
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>');
        res.write('<body>');
        res.write('<h1>Hi Rafi Aman</h1>');
        res.write('</body>');
        res.write('</html>');
        res.end();
    } else {
        res.statusCode = 404;
        res.end()
    }

})
 
 server.listen(PORT, () => {
     console.log(`listening on ${PORT}`)
 });