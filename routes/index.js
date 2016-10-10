var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool  = mysql.createPool({
	connectionLimit : 100,
	host            : '127.0.0.1',
	user            : 'root',
	password        : '1234',
	database        : 'mysql'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/write', function(req, res, next) {
	res.render('writeform', { title: '글 쓰기'});
});

router.post('/write', function(req, res, next){
	console.log('req.body=', req.body);

	var writer = req.body.writer;
	var pwd = req.body.pwd;
	var title = req.body.title;
	var content = req.body.content;

	var sql = 'insert into board(writer, title, content, pwd, hit, regdate) values (?, ?, ?, ?, 0, now())';
	var data = [writer, title, content, pwd];

	pool.getConnection(function(err, conn){
		if(err) { next(err); return; }

		console.log('conn=', conn);
		conn.query(sql, data, function(err, row){
			if(err) { next(err); return; }

			conn.release()
			// res.json({status:'success'});
			res.redirect('/list/1');
		});
	});
});

router.get('/list', function(req, res, next) {
	res.redirect('/list/1');
});

router.get('/list/:page', function(req, res, next) {
	var page = req.params.page;
	page = parseInt(page, 10);
	console.log('page= ', page);
	var size = 10; // 10개 글
	var begin = (page-1) * size;
	pool.getConnection(function(err, conn){
		if(err) return next(err);
		conn.query('select count(*) cnt from board', function(err, rows){
			if(err) {
				conn.release();
				return next(err);
			}
			console.log('rows= ', rows);
			var cnt = rows[0].cnt;
			var totalPage = Math.ceil(cnt/size);
			var pageSize = 10;
			var currentBlock = Math.ceil(page/pageSize);
			var startPage = (currentBlock-1) * pageSize + 1;
			var endPage = startPage + (pageSize-1);
			if(endPage > totalPage) {
				endPage = totalPage;
			}
			var max = cnt - ((page-1) * size);

			var sql = "select num, writer, title, content, pwd, hit, DATE_FORMAT(regdate, '%Y-%m-%d %H:%i:%s') regdate from board order by num desc limit ?,?"
			var data = [begin, size];
			conn.query(sql, data, function(err, rows){
				if(err) {
					conn.release();
					return next(err);
				}
				console.log('리스트= ', rows);
				var datas = {
					title: '게시판 리스트',
					data: rows,
					page: page,
					pageSize: pageSize,
					startPage: startPage,
					endPage: endPage,
					totalPage: totalPage,
					max: max
				};
				console.log('datas=', datas);
				conn.release();
				// res.json({datas: datas});
				res.render('list', datas);
			});
		});
	});
});

// test code.
router.get('/write300', function(req, res, next){

	var sql = 'insert into board(writer, title, content, pwd, hit, regdate) values (?, ?, ?, ?, 0, now())';

	pool.getConnection(function(err, conn){
		console.log('conn=', conn);
		for (var i=1; i<=300; i++)
		{
			var data = ['타잔' + i, '제목' + i, '내용' + i, '1234'];
			conn.query(sql, data, function(err, row){
			});
		}
		conn.release()
	});

	res.send("<script> alert('save success!');</script>")
});

module.exports = router;
