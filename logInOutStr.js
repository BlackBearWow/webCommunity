function navStr(logIn) {
    const baseStr = `<a class="p-2 text-dark" href="/GameMapList">GameMapList</a>
<a class="p-2 text-dark" href="/Rank">Rank</a>
<a class="p-2 text-dark" href="/bulletinBoard">게시판</a>`;

    if (logIn) {
        return baseStr + `<a class="p-2 text-dark" href="/myInfo">내정보</a>
        <a class="p-2 text-dark" href="/logout">로그아웃</a>`;
    }
    else {
        return baseStr + `<a class="p-2 text-dark" href="/signUp">회원가입</a>
        <a class="p-2 text-dark" href="/signIn">로그인</a>`;
    }
}

module.exports = { navStr };