<template>
    <myheader class="title" title="帮助与客服" leftType="back" />
    <div class="container">
        <router-link custom to="/help/1" v-slot="{ navigate }">
            <div @click="navigate" class="category-name area-1">
                <img src="https://assets.maizuo.com/h5/v5/public/app/img/film.345ba304.png" class="category-icon">
                <div class="title">
                    <div>电影票问题</div>
                    <span><img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAUhJREFUWEe11z9OhEAUx/H3Yu0FjK0X2c7Obo32OxDZyxgLZnoLk416AY3xKt7AlpCfmRE2wC7s/HlDAyTw/QwUvMBlWV63bWvof9saY967Y5EdbzabHyK67GotM99rrV9E6kQ0BWxXFLHADRHtiOhssGoxhG1UKbUG8JwDcUBOZA/kQkZADuQAkEaOApLILCCFLAISyEkgFfECUhBvIBYJAmKQYCAUiQJCkGjAF0kCOmQL4HEyAe08WWmtv5OAqqoumqb5AnA1BJj5FcCtMaaJBhbibwDWNm7RKMA3HgWExIOB0HgQEBP3BmLjXkBK/CSQGl8EJOKzgFT8KCAZPwCk4yMgR3wP5Io7IGfcAUqpDwCryfd89MmdDJOgU/uH80tE5/1dzCwW75/gCcCDO2HeAbjrh0XQUmcudgOnKAr3iuq6/pSIDht/cZi/OGdwOYkAAAAASUVORK5CYII="></span>
                </div>
                <img src="data:image/png;base64,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"
                    class="split-line">
            </div>
        </router-link>
        <div class="item-box-1">
            <router-link custom to="/active/cCQYnJ926749" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">如何购票</span></router-link>
            <router-link custom to="/active/UJfdyH525193" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">如何取票</span></router-link>
            <router-link custom to="/active/vwxmSR042594" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">退票/改签</span></router-link>
            <router-link custom to="/active/FqQsDI053874" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">出票失败</span></router-link>
        </div>

        <router-link custom to="/help/2" v-slot="{ navigate }">
            <div @click="navigate" class="category-name area-2">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABoCAYAAAAdHLWhAAAAAXNSR0IArs4c6QAABEJJREFUeF7tnbtu1EAUhv9jO0ARlBoJniAPADWi4R3ogJS7W9HSp9psyaXjHWgQNTwAEj2ReAAiERLbg8bOkl0gYubMzmEIf6SVvfa55fs80SpRbAG/iiYgRU/H4UBBhV8EFERBhRMofDyuIAoqnEDh43EFUVDhBAofjyuIggonUPh4XEEUVDiBwsfjCqKgwgkUPh5XEAUVTqDw8biCKKhwAoWPxxVEQYUTKHy86BXknBPMZo8APIRzuwC2C/8e//Z4RxD5AOAl5vMXIuJiBooS5GazG3DuFZy7G9OEsWcERN5C5IHM559DmQQLOls5bygnFO0FcV7SfH4vdCWFC5pOH8O5Z4njMd0TENmTg4PnITBiBL2Dc7d/FBV5jatX92R//zCk0f8a4548uYlv357Bufsr7N7LwcGdECbhgiaTL2sfCK5du0U5IYiBQdLx8aeV6CNZLK6HZMcIWvv0IYtFcG7IIJc9xk0mKn7BkLUNLjv40O9Py4+CQgknxlFQIsDc6RSUm3BifQpKBJg7nYJyE06sT0GJAHOnU1Buwon1KSgRYO50CspNOLE+BSUCzJ1OQbkJJ9anoESAudPNBQHoIHIC57phH2ghcr7vj/lzIi2c87/JPT073w7x5+cuzl+t2/e+1thn7O1rjD39uapqh+3q8eU+0P+IXeb8nF/XLbruPL+q1mv5c/5Y37fD1r98Lb+t63G/aTocH3fY2WlxdNRhe3uc9+nTDtNpv3oRhP41QP3L0txX3GWvT0GFG6ag/17Q7u4VfPzYYGenxtevNaqqwelpjbYd9/u+xtZWjZOTBk1TD+9FGjg37td1ja5rhq0/Bozn/GsZt7pfVT6vgd+O8RWArWH/13MNgPVaIv59A7/90zk/y88x/r0//rv85Tm/Xe2zOj/Wb7uTfQWFNij8QjYbz/xTHAXFuaWgOF7m0RRkjjyuIQXF8TKPpiBz5HENKSiOl3k0BZkjj2tIQXG8zKMpyBx5XEMKiuNlHk1B5sjjGlJQHC/zaAoyRx7XkILieJlHU5A58riGFBTHyzy6WEFuNruPvvf/vn9zw1QOUVV7Mp+/3nDdLOXKFTSZ+P9u3rScJcRDWSxuZSG64aIUtGGgmy5XriD+iBtcFyto01fiv1qPggo3R0EUpLuVSeHczMbjCjJDrWtEQTpuZlkUZIZa14iCdNzMsijIDLWuEQXpuJllUZAZal0jCtJxM8uyEMSbyip12txUdjrlbZkVguxuy8wbmyv0XJCS5cbm40M1+GiAVE25Hg0w/NGJD9dI05Pz4RrLyfh4mmhHdo+niR6NCckEgu/Vk9yJBVQEKEiFzS6JguxYqzpRkAqbXRIF2bFWdaIgFTa7JAqyY63qREEqbHZJFGTHWtWJglTY7JIoyI61qhMFqbDZJVGQHWtVJwpSYbNLoiA71qpOFKTCZpdEQXasVZ0oSIXNLuk7Libxh+KIKkIAAAAASUVORK5CYII="
                    class="category-icon">
                <div class="title">
                    <div>卡券问题</div>
                    <span><img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAUhJREFUWEe11z9OhEAUx/H3Yu0FjK0X2c7Obo32OxDZyxgLZnoLk416AY3xKt7AlpCfmRE2wC7s/HlDAyTw/QwUvMBlWV63bWvof9saY967Y5EdbzabHyK67GotM99rrV9E6kQ0BWxXFLHADRHtiOhssGoxhG1UKbUG8JwDcUBOZA/kQkZADuQAkEaOApLILCCFLAISyEkgFfECUhBvIBYJAmKQYCAUiQJCkGjAF0kCOmQL4HEyAe08WWmtv5OAqqoumqb5AnA1BJj5FcCtMaaJBhbibwDWNm7RKMA3HgWExIOB0HgQEBP3BmLjXkBK/CSQGl8EJOKzgFT8KCAZPwCk4yMgR3wP5Io7IGfcAUqpDwCryfd89MmdDJOgU/uH80tE5/1dzCwW75/gCcCDO2HeAbjrh0XQUmcudgOnKAr3iuq6/pSIDht/cZi/OGdwOYkAAAAASUVORK5CYII="></span>
                </div>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAGQCAYAAAC9CACDAAAAAXNSR0IArs4c6QAABydJREFUeF7t3FtoHGUUB/BzZmeTtLXaZjM7820oIj70wRtSBNGoTXqvxRtiEaRFEB+KD30SQR8UfREfig99UrFQLyhWtGor1lJrK1JFpYhWS2mtNjvflzX35kIue2SWTektOXuS2Qrl7Ouf//6ZX7Izs/OwCFfg1RnHlMy0GoN4BfZAB1NXVlIlFQvoP42YjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYlzJRWTcQUl5YTEuZKKybiCknJC4lxJxWRcQUk5IXGupGIyrqCknJA4V1IxGVdQUk5InCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExLmSism4gpJyQuJcScVkXEFJOSFxrqRiMq6gpJyQOFdSMRlXUFJOSJwrqZiMKygpJyTOlVRMxhWUlBMS50oqJuMKSsoJiXMlFZNxBSXlhMS5korJuIKSckLiXEnFZFxBSTkhca6kYjKuoKSckDhXUjEZV1BSTkicK6mYjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYnzq5u0SDSfrB1KWOr+42JElI2t3U0AaxHg74Ix19ft18yIyIude4eIHkeAUtb324IgOF63wc443g4AWxBxgDKZ9tYg+Dlhrctg0dpXiOh5ABj1fH+tCYKDU//aqQ8Wrd1KRNsQccIDeCSKos/O/xylOhg7t4mIdlQGEDcXwnDnxR/a1AattQ+UAXYRkY+IWwtR9PrlzhCpDMZxvLwMsBcAmgDgpVZjXpzudDTnwWKptAwmJw8Q0ULwvO2tYfjMTOe+OQ2WSqWl4xMThwggQMT3TBg+gYiVnyxM/Qi7u7uXjI6NfQcASxBgj4mihxBxnDuzz+oIiwMDLTQ0dBgAliLAYRNFqxFxhBub1Qe/VCotHJ+YOEAAywDx6LyGhvuam5v7axkTDxJRU+zcXiJaDognfMS2MAxdrWOiQSLKxM4ln7MHAbHTI2ozxvwlGat5kIgwtvZtAtgMAD1eQ8M9Jpf7XTpW82DR2m1EtBURzyLRCmPMD7MZq2mwaO0LRPQyAIz5nnd/GIZfz3aMHYyd21Iul7cj4iQgbiyE4a65jM042GltcqVOrtgeID7VGkVvzXVs2sG4q2sdlcufJvckHsCzxpjX0hi77GCnc3djufwVAcz3PO9VE4bPpTV2yaBz7tYJooNAtAgR3yhE0dNpjl0w6Jy7cZLoOyIKEeAjE0UbEbFcl8FSqVQYn5w8TEQ3IOI+E4YbEHEs7bHKEfb39zcPjYx8S0Q3AeKRDMCKKIoqd8r1eKG1Nl8G2E9ENyPAMT+T6cjn87YeY+f+hvHgYFAeGtoPRLcgwB9Z3+8IgiCux+i5C/DAwEBucHg4Gb0NAI43+H57EATFtEcvuOInf8+zw8PJufL25HrXlM2253K5M2mOXnKL0dfXt3h4ZGRfckVHxJON2ezyXC73T1qjl72n6e3tXTQyOpqcbe5AxFPQ2NheWLz4dBqj095E9fT0XDcyNvYlEN2JAKc9xPYoik7NdXTGu7bu7u5rR8fH9wLRXckXyozntYdheHIuo+xtYvUubQ8BtAHAmWwm057P50/MdpQdTN64q6vrmonJyS8I4N7kBqohk0k+p8dnM1rTYPLG1toFZYDPk1tERIyTIw2C4E/paM2DyRtXnkg4txuIViCiBd/vKLS0HJOMigaTNyaiebFzyd3AKkTsQqIOY8xvtY6KB6ujTbG1nxDAmuQJhYeYXGF+rWV0VoPV0cbY2o8JYD0C/JvxvJVhGB7lRmc9WB1tKDq3C4g2JHfk2UxmZT6f/2Wm0TkNTo3Gzn1Y+c4B0Iu+v6oQBD9NNzrnwepoNnbuAyJ6GBD7PN9fbVpafrzcaCqD1VE/tvZ9AngUEfs9gDVRFB25eDS1wanRonPvAtFjySOvDOLaMAy/P3801cHqaPI9cmfloR7iICGuaw3D5FlA5ZX64HmjO4goeapxFjxvfSGfP1S3weqoV/0SuwkRh5BogzHmm7oc4RRf8s2r6NybQPQkAgwXjFlQ18HqkWLR2spXhro/gp460qv7qX5ylHqE3CVNnCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExLmSism4gpJyQuJcScVkXEFJOSFxrqRiMq6gpJyQOFdSMRlXUFJOSJwrqZiMKygpJyTOlVRMxhWUlBMS50oqJuMKSsoJiXMlFZNxBSXlhMS5korJuIKSckLiXEnFZFxBSTkhca6kYjKuoKSckDhXUjEZV1BSTkicK6mYjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYlzJRWTcQUl5YTEuZKKybiCknJC4lxJxWRcQUk5IXGupGIyrqCknJA4V1IxGVdQUk5InCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExPn/SvofRDCD+lvhCeEAAAAASUVORK5CYII="
                    class="split-line">
            </div>
        </router-link>

        <div class="item-box-2">
            <router-link custom to="/active/SVUlVg972788" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">帮定卡券</span></router-link>
            <router-link custom to="/active/fkARNl102463" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">查询卡券余额/<br>有效期</span></router-link>
            <router-link custom to="/active/uoftTR033758" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">解绑卡券</span></router-link>
            <router-link custom to="/active/dZeEGo241933" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item"> 卡券丢失/挂失<br>补卡 </span></router-link>
        </div>
        <router-link custom to="/help/3" v-slot="{ navigate }">
            <div @click="navigate" class="category-name area-3">
                <img src="data:image/png;base64,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"
                    class="category-icon">
                <div class="title">
                    <div>账户问题</div>
                    <span><img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAUhJREFUWEe11z9OhEAUx/H3Yu0FjK0X2c7Obo32OxDZyxgLZnoLk416AY3xKt7AlpCfmRE2wC7s/HlDAyTw/QwUvMBlWV63bWvof9saY967Y5EdbzabHyK67GotM99rrV9E6kQ0BWxXFLHADRHtiOhssGoxhG1UKbUG8JwDcUBOZA/kQkZADuQAkEaOApLILCCFLAISyEkgFfECUhBvIBYJAmKQYCAUiQJCkGjAF0kCOmQL4HEyAe08WWmtv5OAqqoumqb5AnA1BJj5FcCtMaaJBhbibwDWNm7RKMA3HgWExIOB0HgQEBP3BmLjXkBK/CSQGl8EJOKzgFT8KCAZPwCk4yMgR3wP5Io7IGfcAUqpDwCryfd89MmdDJOgU/uH80tE5/1dzCwW75/gCcCDO2HeAbjrh0XQUmcudgOnKAr3iuq6/pSIDht/cZi/OGdwOYkAAAAASUVORK5CYII="></span>
                </div>
                <img src="data:image/png;base64,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"
                    class="split-line">
            </div>
        </router-link>
        <div class="item-box-3">
            <router-link custom to="/active/QOiscz286857" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">更改绑定手机号</span></router-link>
            <router-link custom to="/active/zJTfSa121108" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">账户注销</span></router-link>

        </div>
        <router-link custom to="/help/4" v-slot="{ navigate }">
            <div @click="navigate" class="category-name area-4">
                <img src="data:image/png;base64,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"
                    class="category-icon">
                <div class="title">
                    <div>延期问题</div>
                    <span><img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAUhJREFUWEe11z9OhEAUx/H3Yu0FjK0X2c7Obo32OxDZyxgLZnoLk416AY3xKt7AlpCfmRE2wC7s/HlDAyTw/QwUvMBlWV63bWvof9saY967Y5EdbzabHyK67GotM99rrV9E6kQ0BWxXFLHADRHtiOhssGoxhG1UKbUG8JwDcUBOZA/kQkZADuQAkEaOApLILCCFLAISyEkgFfECUhBvIBYJAmKQYCAUiQJCkGjAF0kCOmQL4HEyAe08WWmtv5OAqqoumqb5AnA1BJj5FcCtMaaJBhbibwDWNm7RKMA3HgWExIOB0HgQEBP3BmLjXkBK/CSQGl8EJOKzgFT8KCAZPwCk4yMgR3wP5Io7IGfcAUqpDwCryfd89MmdDJOgU/uH80tE5/1dzCwW75/gCcCDO2HeAbjrh0XQUmcudgOnKAr3iuq6/pSIDht/cZi/OGdwOYkAAAAASUVORK5CYII="></span>
                </div>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAGQCAYAAAC9CACDAAAAAXNSR0IArs4c6QAABydJREFUeF7t3FtoHGUUB/BzZmeTtLXaZjM7820oIj70wRtSBNGoTXqvxRtiEaRFEB+KD30SQR8UfREfig99UrFQLyhWtGor1lJrK1JFpYhWS2mtNjvflzX35kIue2SWTektOXuS2Qrl7Ouf//6ZX7Izs/OwCFfg1RnHlMy0GoN4BfZAB1NXVlIlFQvoP42YjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYlzJRWTcQUl5YTEuZKKybiCknJC4lxJxWRcQUk5IXGupGIyrqCknJA4V1IxGVdQUk5InCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExLmSism4gpJyQuJcScVkXEFJOSFxrqRiMq6gpJyQOFdSMRlXUFJOSJwrqZiMKygpJyTOlVRMxhWUlBMS50oqJuMKSsoJiXMlFZNxBSXlhMS5korJuIKSckLiXEnFZFxBSTkhca6kYjKuoKSckDhXUjEZV1BSTkicK6mYjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYnzq5u0SDSfrB1KWOr+42JElI2t3U0AaxHg74Ix19ft18yIyIude4eIHkeAUtb324IgOF63wc443g4AWxBxgDKZ9tYg+Dlhrctg0dpXiOh5ABj1fH+tCYKDU//aqQ8Wrd1KRNsQccIDeCSKos/O/xylOhg7t4mIdlQGEDcXwnDnxR/a1AattQ+UAXYRkY+IWwtR9PrlzhCpDMZxvLwMsBcAmgDgpVZjXpzudDTnwWKptAwmJw8Q0ULwvO2tYfjMTOe+OQ2WSqWl4xMThwggQMT3TBg+gYiVnyxM/Qi7u7uXjI6NfQcASxBgj4mihxBxnDuzz+oIiwMDLTQ0dBgAliLAYRNFqxFxhBub1Qe/VCotHJ+YOEAAywDx6LyGhvuam5v7axkTDxJRU+zcXiJaDognfMS2MAxdrWOiQSLKxM4ln7MHAbHTI2ozxvwlGat5kIgwtvZtAtgMAD1eQ8M9Jpf7XTpW82DR2m1EtBURzyLRCmPMD7MZq2mwaO0LRPQyAIz5nnd/GIZfz3aMHYyd21Iul7cj4iQgbiyE4a65jM042GltcqVOrtgeID7VGkVvzXVs2sG4q2sdlcufJvckHsCzxpjX0hi77GCnc3djufwVAcz3PO9VE4bPpTV2yaBz7tYJooNAtAgR3yhE0dNpjl0w6Jy7cZLoOyIKEeAjE0UbEbFcl8FSqVQYn5w8TEQ3IOI+E4YbEHEs7bHKEfb39zcPjYx8S0Q3AeKRDMCKKIoqd8r1eKG1Nl8G2E9ENyPAMT+T6cjn87YeY+f+hvHgYFAeGtoPRLcgwB9Z3+8IgiCux+i5C/DAwEBucHg4Gb0NAI43+H57EATFtEcvuOInf8+zw8PJufL25HrXlM2253K5M2mOXnKL0dfXt3h4ZGRfckVHxJON2ezyXC73T1qjl72n6e3tXTQyOpqcbe5AxFPQ2NheWLz4dBqj095E9fT0XDcyNvYlEN2JAKc9xPYoik7NdXTGu7bu7u5rR8fH9wLRXckXyozntYdheHIuo+xtYvUubQ8BtAHAmWwm057P50/MdpQdTN64q6vrmonJyS8I4N7kBqohk0k+p8dnM1rTYPLG1toFZYDPk1tERIyTIw2C4E/paM2DyRtXnkg4txuIViCiBd/vKLS0HJOMigaTNyaiebFzyd3AKkTsQqIOY8xvtY6KB6ujTbG1nxDAmuQJhYeYXGF+rWV0VoPV0cbY2o8JYD0C/JvxvJVhGB7lRmc9WB1tKDq3C4g2JHfk2UxmZT6f/2Wm0TkNTo3Gzn1Y+c4B0Iu+v6oQBD9NNzrnwepoNnbuAyJ6GBD7PN9fbVpafrzcaCqD1VE/tvZ9AngUEfs9gDVRFB25eDS1wanRonPvAtFjySOvDOLaMAy/P3801cHqaPI9cmfloR7iICGuaw3D5FlA5ZX64HmjO4goeapxFjxvfSGfP1S3weqoV/0SuwkRh5BogzHmm7oc4RRf8s2r6NybQPQkAgwXjFlQ18HqkWLR2spXhro/gp460qv7qX5ylHqE3CVNnCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExLmSism4gpJyQuJcScVkXEFJOSFxrqRiMq6gpJyQOFdSMRlXUFJOSJwrqZiMKygpJyTOlVRMxhWUlBMS50oqJuMKSsoJiXMlFZNxBSXlhMS5korJuIKSckLiXEnFZFxBSTkhca6kYjKuoKSckDhXUjEZV1BSTkicK6mYjCsoKSckzpVUTMYVlJQTEudKKibjCkrKCYlzJRWTcQUl5YTEuZKKybiCknJC4lxJxWRcQUk5IXGupGIyrqCknJA4V1IxGVdQUk5InCupmIwrKCknJM6VVEzGFZSUExLnSiom4wpKygmJcyUVk3EFJeWExPn/SvofRDCD+lvhCeEAAAAASUVORK5CYII="
                    class="split-line">
            </div>

        </router-link>
        <div class="item-box-4">
            <router-link custom to="/active/IBrPvZ356733" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">卡券延期规则</span></router-link>
            <router-link custom to="/active/ssEDKf752685" v-slot="{ navigate }"><span @click="navigate($event)"
                    class="item">延期流程</span></router-link>

        </div>
    </div>
    <div class="customer-service">

        <img src="https://assets.maizuo.com/h5/v5/public/app/img/assistant.39b627ab.png">
        <span>专属客服（9:00-22:00）</span>
    </div>
</template>
<script lang="ts" setup>
// import { ref, computed, } from 'vue'
import Myheader from '@/components/Myheader.vue';
// import { http } from '@/util/tools';
// import { useRouter } from 'vue-router';
import useTabbarStore from '@/store/tabbarStore';
const tabbarStore = useTabbarStore();

tabbarStore.isTabbarShow = false;
</script>
<style scoped lang="scss">
//  @mixin name-base(){

// }
%name-base {
    // background-color: #ffffff;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 100%;
    // color: black !important;    
}

%item-box {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    padding: 5px 5px;
    background-color: #ffffff;
    box-sizing: border-box;

    font-size: .8rem;
    // grid-area: b;
    grid-template-areas: 'a b'
        'c d';

    >span:first-child {
        border-right: 1px solid #ededed;
        border-bottom: 1px solid #ededed;
    }

    >span:last-child {
        border-left: 1px solid #ededed;
        border-top: 1px solid #ededed;
    }

    .item {
        @extend %name-base;
    }

}

%item-box-last {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: .8rem;
    background-color: #ffffff;
    box-sizing: border-box;
    // grid-template-rows: 1fr;
    padding: 5px 5px;

    // grid-area: b;
    // grid-template-areas: 'a b';
    // 'c d';
    >span:first-child {
        border-right: 1px solid #ededed;
    }


    .item {
        @extend %name-base;
    }
}

//     .item:link, .item:visited, .item:hover, .item:active {
//   color: black !important;
// }
.container {
    width: 100%;
    height: 60%;
    display: grid;
    grid-template-columns: 25% 1fr 1fr;
    grid-template-rows: repeat(8, 1fr);
    row-gap: 5px;
    // box-sizing: border-box;
    // grid-template-rows: 3px;
    grid-template-areas: 'a b b'
        'a b b'
        'f g g'
        'f g g'
        'k l l'
        'k l l'
        'p q q'
        'p q q';

    .area-1 {

        grid-area: a;
    }

    .area-2 {

        grid-area: f;
    }

    .area-3 {

        grid-area: k;
    }

    .area-4 {

        grid-area: p;
    }

    .category-name {
        // text-align: center;
        // display: flex;
        // flex-direction: column;
        // justify-content: center;
        // align-items: center;
        @extend %name-base;
        background-color: #ffffff;

        // grid-area: a;
        // position: relative;
        // width: 100%;
        // height: 100%;

        .category-icon {
            width: 40%;
            height: auto;
        }

        .title {
            width: 100%;
            height: 20%;
            font-size: 0.85rem;
            display: flex;
            justify-content: center;
            align-items: center;
            text-wrap: nowrap;
            column-gap: .375rem;
            margin-top: .1875rem;

            div {
                text-align: center;
                padding-top: 2px;
                line-height: 1;

            }

            span {
                height: 70%;
            }
        }

        .split-line {
            width: 8px;
            position: absolute;
            right: 0;
            height: 100%;
        }
    }

    .item-box-1 {
        // width: 100%;
        // height: 100%;
        // display: grid;
        // grid-template-columns: 1fr 1fr;
        // grid-template-rows: 1fr 1fr;
        // padding: 10px 10px;
        @extend %item-box;
        grid-area: b;
        // grid-template-areas: 'a b'
        //     'c d';

        // >span:first-child {
        //     border-right: 1px solid #ededed;
        //     border-bottom: 1px solid #ededed;
        // }

        // >span:last-child {
        //     border-left: 1px solid #ededed;
        //     border-top: 1px solid #ededed;
        // }

        // .item {
        //     @extend %name-base;
        // }
    }

    .item-box-2 {
        @extend %item-box;
        grid-area: g;

    }

    .item-box-3 {
        @extend %item-box-last;
        grid-area: l;

    }

    .item-box-4 {
        @extend %item-box-last;
        grid-area: q;

    }
}

.customer-service {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    height: 10vh;
    width: 100%;
    background-color: #ffffff;
    justify-content: center;
    align-items: center;

    img {
        width: 10%;
        height: auto;
        margin-right: 5px;
    }
}
</style>
