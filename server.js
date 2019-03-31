const line = require('@line/bot-sdk');
const express = require('express');
const Sequelize = require('sequelize');
const exec = require('child_process');
const HtmlTableToJson = require('html-table-to-json');

const admin = '***Admin ID***';
const useradmin = [***List user admin ID***];
// --------------DMT---------------------------------TBG---------------------------------Protelindo--------------------------KIN---------------------------------BTS Hotel--------------------------
const groupTP = ['***List group ID***'];

const config = {
  channelAccessToken: "***channel Access Token***",
  channelSecret: "***channel Secret***",
};
const client = new line.Client(config);
const app = express();

// ---------------setting database---------------
const db = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: '.data/database.sqlite'
});
const Report = db.define('Log', {
  tipe: Sequelize.TEXT,
  date: Sequelize.TEXT,
  site: Sequelize.TEXT,
  problem: Sequelize.TEXT,
  activity: Sequelize.TEXT,
  result: Sequelize.TEXT,
  team: Sequelize.TEXT,
  operational: Sequelize.TEXT,
  note: Sequelize.TEXT
});
// ---------------end---------------

app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((e) => {
      console.log(e);
    });
});

function handleEvent(event) {
  // --------------- grup RTPO Padang, log activity TS
  if (event.source.groupId && event.source.groupId == '***group ID***') {
    var input = event.message.text.split("\n");
    if (input.length >= 8) {
      input[0] = input[0].replace(/(^\s+|\s+$)/g,'').toLowerCase();
      input[1] = input[1].slice(input[1].indexOf(':') + 2, input[1].length); //site
      input[2] = input[2].slice(input[2].indexOf(':') + 2, input[2].length); //problem
      input[3] = input[3].slice(input[3].indexOf(':') + 2, input[3].length); //activity
      input[4] = input[4].slice(input[4].indexOf(':') + 2, input[4].length); //result
      input[5] = input[5].slice(input[5].indexOf(':') + 2, input[5].length); //team
      input[6] = input[6].slice(input[6].indexOf(':') + 2, input[6].length); //operational
      input[7] = input[7].slice(input[7].indexOf(':') + 2, input[7].length); //note
      if (input[0] == "izin masuk") {
        db.sync()
          .then(() => Report.create({
            tipe: 'IN',
            date: new Date(Date.now()).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
            site: input[1],
            problem: input[2],
            activity: input[3],
            result: input[4],
            team: input[5],
            operational: input[6],
            note: input[7],
          }))
        const echo = { type: 'text', text: 'Good luck!' };
        return client.replyMessage(event.replyToken, echo);
      } else if (input[0] == "izin keluar") {
        db.sync()
          .then(() => Report.create({
            tipe: 'OUT',
            date: new Date(Date.now()).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
            site: input[1],
            problem: input[2],
            activity: input[3],
            result: input[4],
            team: input[5],
            operational: input[6],
            note: input[7],
          }))           
        const echo = { type: 'text', text: 'Thank you!' };
        return client.replyMessage(event.replyToken, echo);       
      }
    } else if (event.message.text == 'ping') {
        const echo = { type: 'text', text: 'PING!' };
        return client.replyMessage(event.replyToken, echo);  
    }
    
  // --------------- chat pribadi, admin  
  } else if (event.source.type == 'user' && event.source.userId == admin) {  
    if (event.message.text == 'quote') {
      exec.execFile('php', ['./quotetoti.php'], (err, stdout, stderr) => {
        const txt = { type: 'text', text: stdout };
        return client.replyMessage(event.replyToken, txt);
      });
    }
    if (event.message.text[0] == '@' && event.message.text.length == 7) {
      exec.execFile('php', ['./querytoti.php'], (err, stdout, stderr) => {
        const jsonTables = new HtmlTableToJson(stdout);
        var arrFound = jsonTables.results[0].filter(function(item) {
          return item.SITE_ID == event.message.text.slice(1);
        });
        var txt = 'No. : ' + arrFound[0]['NO'] + '\nID Tiket : ' + arrFound[0]['ID_TIKET'] + '\nSite : ' + arrFound[0]['SITE_ID'] + ' ' + arrFound[0]['SITE_NAME'] + '\nProblem : ' + arrFound[0]['PERMASALAHAN'] + '\nKategori : ' + arrFound[0]['KATEGORI'] + '\nStatus : ' + arrFound[0]['KONDISI_SITE'] + '\nKode : ' + arrFound[0]['KODE'] + '\nRequest : ' + arrFound[0]['TANGGAL_REQUEST'];
        const echo = { type: 'text', text: txt };
        return client.replyMessage(event.replyToken, echo);
      });
    }

  // --------------- grup Tower Provider, query Toti
  } else if (groupTP.indexOf(event.source.groupId) > -1 ) {  
    if (useradmin.indexOf(event.source.userId) > -1 && event.message.text[0] == '@' && event.message.text.length == 7) {
      exec.execFile('php', ['./querytoti.php'], (err, stdout, stderr) => {
        const jsonTables = new HtmlTableToJson(stdout);
        var arrFound = jsonTables.results[0].filter(function(item) {
          return item.SITE_ID == event.message.text.slice(1);
        });
        var txt = 'No. : ' + arrFound[0]['NO'] + '\nID Tiket : ' + arrFound[0]['ID_TIKET'] + '\nSite : ' + arrFound[0]['SITE_ID'] + ' ' + arrFound[0]['SITE_NAME'] + '\nProblem : ' + arrFound[0]['PERMASALAHAN'] + '\nKategori : ' + arrFound[0]['KATEGORI'] + '\nStatus : ' + arrFound[0]['KONDISI_SITE'] + '\nKode : ' + arrFound[0]['KODE'] + '\nRequest : ' + arrFound[0]['TANGGAL_REQUEST'];
        const echo = { type: 'text', text: txt };
        return client.replyMessage(event.replyToken, echo);
      });
    }

  // --------------- grup Super Lasak, quote Toti
  } else if (event.source.groupId && event.source.groupId == '***group ID***') {
    if (event.source.userId == admin && event.message.text == 'quote') {
      exec.execFile('php', ['./quotetoti.php'], (err, stdout, stderr) => {
        const txt = { type: 'text', text: stdout };
        return client.replyMessage(event.replyToken, txt);
      });
    }
    
  // --------------- kalau masuk grup, admin cek ID grup
  } else if (event.source.groupId) {
    if (event.source.userId == admin && event.message.text == 'id') {
      const echo = { type: 'text', text: event.source.groupId };
      return client.replyMessage(event.replyToken, echo);
    }
    
  // --------------- kalau ada orang lain chat bot  
  } else {
    const echo = { type: 'text', text: 'For more info please contact `dpfariz`' };
    client.replyMessage(event.replyToken, echo);
    var id_source = '';
    if (event.source.type == 'user') {
      id_source = event.source.userId;
    } else if (event.source.type == 'group') {
      id_source = event.source.groupId;
    } else {
      id_source = event.source.roomId;
    }
    const echo1 = { type : 'text', text: 'Your BOT has been accessed!' + '\n\nSource : ' + event.source.type + '\nSource ID : ' + id_source + '\nMessage : ' + event.message.text};
    client.pushMessage(admin, echo1); 
    client.getProfile(event.source.userId)
      .then((profile) => {
        const echo2 = { type : 'text', text :  'Display Name : ' + profile.displayName +'\nUser ID : ' + profile.userId + '\nPicture URL : ' + profile.pictureUrl };
        client.pushMessage(admin, echo2);
      });
  }
}

const port = 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
