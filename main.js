var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : 'ch1356@f',
    port     : '3306',
    database : 'opentutorials'
})
db.connect(); //실제 접속이 일어나는 곳

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){ //최상위 경로라는 뜻
      if(queryData.id === undefined){//쿼리데이터의 아이디가 없다면 홈화면이다. welcome
          //db변수의 쿼리메소드의 첫인자로 sql구문을 보내고 두번째 인자로 콜백함수 -> 콜백함수의 첫 인자로 에러문,두번째 인자로
          //토픽을 받아올것이다.(테이블).
          db.query(`SELECT * FROM topic`,function(error,topics){
              var title = 'Welcome';
              var description = 'Hello, Node.js';
              var list = template.list(topics);
              var html = template.HTML(title, list,
                  `<h2>${title}</h2>${description}`,
                  `<a href="/create">create</a>`
              );
              response.writeHead(200);
              response.end(html);
          });
      } else { //홈화면이 아니라면 글을 클릭한이후 상세보기이다.
        /*fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });*/
          db.query(`SELECT * FROM topic`,function(error,topics){
              if(error){
                  throw error;
              }
              db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id],function (error2,topic){
                  if(error2){
                      throw error2;
                  }
                  console.log(topic[0].title);
                  var title = topic[0].title;
                  var description = topic[0].description;
                  var list = template.list(topics);
                  var html = template.HTML(title, list,
                      `<h2>${title}</h2>${description}`,
                      `<a href="/create">create</a>
                                 <a href="/update?id=${queryData.id}">update</a>
                                 <form action="delete_process" method="post">
                                 <input type="hidden" name="id" value="${queryData.id}">
                                 <input type="submit" value="delete">
                                 </form>`
                  );
                  response.writeHead(200);
                  response.end(html);
              })
          });
      }
    } else if(pathname === '/create'){
        db.query(`SELECT * FROM topic`,function(error,topics){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                          <textarea name="description" placeholder="description"></textarea>
                        </p>
                        <p>
                          <input type="submit">
                        </p>
                      </form>`,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`INSERT INTO topic(title,description,
              created,author_id) VALUES(?,?,
              Now(),?)`,[post.title,post.description,1],function(error,result){
              if(error){
                  throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
          }
      )
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
