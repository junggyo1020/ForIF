const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost', // database server url
    database: 'portfolio', // 서버의 여러 데이터베이스 중에 어느 것?
    user: 'root', 
    password: '9185'
});

module.exports = pool;