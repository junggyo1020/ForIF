const express = require('express');
const bcrypt = require('bcrypt');

const db = require('../data/database');

const router = express.Router();


router.get('/', function(req, res) {
    res.render('login');
});

router.post('/signup', async function(req, res) {
    console.log("signup");
    const userData = req.body; // 양식에서 데이터 추출
    console.log("userData", userData);
    const enteredUsername = userData.username;
    const enteredId = userData.id;
    const enteredPassword = userData.password;
    const enteredConfirmPassword = userData["confirm-password"];

    const [existingUsers] = await db.query('select * from users where userId = ?', [enteredId]); // 사용자 정보 불러오기
    const existingUser = existingUsers[0];

    if (existingUser) { // userId 겹침
        console.log('existing id');
        return res.redirect('/');
    }

    if (enteredPassword === enteredConfirmPassword) {
        const hashedPassword = await bcrypt.hash(enteredPassword, 12); // 비밀번호 암호화
        const data = [enteredId, enteredUsername, hashedPassword];
        console.log(data);
        await db.query('insert into users (userId, name, pw) values (?)', [data]); // 사용자 정보 기입
        console.log("success???");
    }


    res.redirect('/');
});

router.post('/login', async function(req, res) {
    const userData = req.body; // 양식에서 데이터 추출
    console.log(userData);
    const enteredId = userData.id;
    const enteredPassword = userData.password;

    const [existingUsers] = await db.query('select * from users where userId = ?', [enteredId]); // 사용자 정보 불러오기
    const existingUser = existingUsers[0];

    if (!existingUser || existingUser.length === 0) { // 사용자가 존재하지 않음
        console.log('wrong user data input');
        return res.redirect('/');
    }

    const passwordEqual = await bcrypt.compare(enteredPassword, existingUser.pw); // 저장된 암호와 현재 입력된 암호 비교

    if (!passwordEqual) { // 사용자는 존재하지만 비밀번호가 틀림
        console.log('wrong user data input');
        return res.redirect('/');
    }

    req.session.user = {userId: existingUser.id}; // 세션으로 사용자 정보 저장
    req.session.isAuthenticated = true; // 로그인 성공 플래그
    req.session.save(function() { // 세션 저장
        // return res.redirect('/main');
        return res.redirect('/404');
    });

    console.log('user is authenticated');
});

module.exports = router;