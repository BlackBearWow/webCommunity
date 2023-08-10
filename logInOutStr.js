function navStr(logIn) {
    const baseStr2 = `<li class="nav-item">
    <a class="nav-link" href="/GameMapList" target="_self">GameMapList</a>
</li>
<li class="nav-item">
    <a class="nav-link" href="/Rank" target="_self">Rank</a>
</li>
<li class="nav-item">
    <a class="nav-link" href="/bulletinBoard" target="_self">게시판</a>
</li>
`;
const baseStr = `<a class="p-2 text-dark" href="/GameMapList">GameMapList</a>
<a class="p-2 text-dark" href="/Rank">Rank</a>
<a class="p-2 text-dark" href="/bulletinBoard">게시판</a>`;

    if (logIn) {
        return baseStr + `<a class="p-2 text-dark" href="/logout">로그아웃</a>`;
        return baseStr + `<li class="nav-item">
        <a class="nav-link" href="/logout" target="_self">로그아웃</a>
    </li>`;
    }
    else {
        return baseStr + `<a class="p-2 text-dark" href="/signUp">회원가입</a>
        <a class="p-2 text-dark" href="/signIn">로그인</a>`;
        return baseStr + `<li class="nav-item">
        <a class="nav-link" href="/signUp" target="_self">회원가입</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="/signIn" target="_self">로그인</a>
    </li>`
    }
}

module.exports = { navStr };