function navStr(logIn) {
    const baseStr = `<li class="nav-item">
    <a class="nav-link" href="/GameMapList" target="_self">GameMapList</a>
</li>
<li class="nav-item">
    <a class="nav-link" href="/Rank" target="_self">Rank</a>
</li>
<li class="nav-item">
    <a class="nav-link" href="/bulletinBoard" target="_self">게시판</a>
</li>
`;
    if (logIn) {
        return baseStr + `<li class="nav-item">
        <a class="nav-link" href="/logout" target="_self">로그아웃</a>
    </li>`;
    }
    else {
        return baseStr + `<li class="nav-item">
        <a class="nav-link" href="/signUp" target="_self">회원가입</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="/signIn" target="_self">로그인</a>
    </li>`
    }
}

module.exports = { navStr };