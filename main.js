var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template');
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){ //최상위 경로라는 뜻
        if(queryData.id === undefined){//쿼리데이터의 아이디가 없다면 홈화면이다. welcome
            //db변수의 쿼리메소드의 첫인자로 sql구문을 보내고 두번째 인자로 콜백함수 -> 콜백함수의 첫 인자로 에러문,두번째 인자로
            //토픽을 받아올것이다.(테이블).
            topic.home(request,response);
        } else { //홈화면이 아니라면 글을 클릭한이후 상세보기이다.
            topic.page(request,response);
        }
    } else if(pathname === '/create'){
        topic.create(request,response);
    } else if(pathname === '/create_process'){
        topic.create_process(request,response);
    } else if(pathname === '/update') {
        topic.update(request,response);
    } else if(pathname === '/update_process'){
        topic.update_process(request,response);
    } else if(pathname === '/delete_process'){
        topic.delete_process(request,response);
    } else if(pathname === '/author'){
        author.home(request,response);
    } else if(pathname === '/author/create_process'){
        author.create_process(request,response);
    } else if(pathname === '/author/update'){
        author.update(request,response);
    } else if(pathname === '/author/update_process'){
        author.update_process(request,response);
    } else if(pathname === '/author/delete_process'){
        author.delete_process(request,response);
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
