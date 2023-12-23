const express = require('express');
const db = require('../data/database');
const router = express.Router();

router.get('/main', async function(req, res) {
    const query = `
        select post.*, users.name as user_name 
        from post inner join users on post.userId = users.id
        where users.id = ?
    `
    const [posts] = await db.query(query, [req.session.user.userId]);

    const postsData = posts.map(post => {
        return {
            ...post,
            created_at: new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    });

    res.render('list', {posts: postsData});
});

router.get('/view/:postid', async function(req,res){
    const query = `
        select post.*, users.name as user_name 
        from post inner join users on post.userId = users.id
        where post.id = ?
    `;
    const [posts] = await db.query(query, [req.params.postid]);

    if (!posts || posts.length === 0) { // 일치하는 게시글 없음
        return res.status(404).render('404');
    }

    const postData = {
        ...posts[0], // posts[0]의 모든 속성 복사, 분해 후 나열
        date: posts[0].created_at.toISOString(), // 기계를 위한 시간
        human_date: posts[0].created_at.toLocaleDateString('ko-KR', { // 인간들이 볼 시간
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    res.render('index', {post: postData});
});

router.get('/edit/:postid', async function(req, res) { // 수정 페이지로 넘어감
    const query = `
        select post.*, users.name as user_name 
        from post inner join users on post.userId = users.id
        where post.id = ?
    `;
    const [posts] = await db.query(query, [req.params.postid]);

    if (!posts || posts.length === 0) { // 일치하는 게시글 없음
        return res.status(404).render('404');
    }

    const postData = {
        ...posts[0], // posts[0]의 모든 속성 복사, 분해 후 나열
        date: posts[0].created_at.toISOString(), // 기계를 위한 시간
        human_date: posts[0].created_at.toLocaleDateString('ko-KR', { // 인간들이 볼 시간
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    res.render('edit', {post: postData});
});

router.post('/update/:postid', async function(req, res) {
    const query = `
        update post
        set title = ?, subTitle = ?, body = ?, access = ?
        where id = ?
    `;

    await db.query(query, [ // 수정 된 글 받아와서 디비에 업데이트
        req.body.title,
        req.body.subtitle,
        req.body.body,
        req.body.access,
        req.params.postid
    ]);

    res.redirect('/main');
});

router.get('/write', function(req, res) {
    res.render('write');
});

router.post('/upload', async function(req, res) {
    const postData = req.body;

    const query = `
    insert into post (title, subTitle, access, body, userId, likes, count)
    values (?,?,?,?,?,?,?)`;

    console.log(postData);

    await db.query(query, [
        postData.title,
        postData.subtitle,
        postData.access,
        postData.body,
        req.session.user.userId,
        0,
        0 
    ]);

    res.redirect('/main');
});

module.exports = router;
// 번호 제목 글쓴이 작성일 조회
// id title userId created_at count