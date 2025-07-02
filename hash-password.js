// 테스트 계정을 생성할 떄 비밀번호를 생성하기 위한 파일
// node hash-password.js 를 실행

const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'testpassword'; // 원하는 비밀번호 입력

bcrypt.hash(plainPassword, saltRounds, function (err, hash) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Plain Password:', plainPassword);
  console.log('Hashed Password:', hash);
});
