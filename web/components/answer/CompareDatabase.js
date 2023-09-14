import React, {useCallback} from 'react'
import {Alert, AlertTitle, Box, Stack, Tab, Tabs, Typography} from '@mui/material'
import ResizePanel from '../layout/utils/ResizePanel'
import FileEditor from '../question/type_specific/code/files/FileEditor'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import TestCaseResults from '../question/type_specific/code/TestCaseResults'
import TabPanel from '../layout/utils/TabPanel'
import TabContent from '../layout/utils/TabContent'
import { useResizeObserver } from '../../context/ResizeObserverContext'
import ScrollContainer from '../layout/ScrollContainer'
import QueryEditor from "../question/type_specific/database/QueryEditor";
import QueryOutput from "../question/type_specific/database/QueryOutput";
import StudentOutputDisplay from "./database/StudentOutputDisplay";
import LayoutSplitScreen from "../layout/LayoutSplitScreen";
import DateTimeAgo from "../feedback/DateTimeAgo";

/*

answer : {
    "queries": [
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxhi003scarsjsivwztf",
            "studentOutputId": "clmjcnkxo0001ca541qqjxweu",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxhi003scarsjsivwztf",
                "order": 1,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T14:51:40.772Z",
                "title": "Vizualise the table",
                "description": "Observe carefully",
                "lintRules": null,
                "lintResult": null,
                "content": "SELECT * FROM actor ORDER BY actor_id LIMIT 5;",
                "template": null,
                "studentPermission": "VIEW",
                "testQuery": false
            },
            "studentOutput": {
                "id": "clmjcnkxo0001ca541qqjxweu",
                "createdAt": "2023-09-14T15:52:50.361Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TABULAR",
                    "order": 1,
                    "result": {
                        "rows": [
                            [
                                1,
                                "PENELOPE",
                                "GUINESS",
                                "2006-02-15T03:34:33.000Z"
                            ],
                            [
                                2,
                                "NICK",
                                "WAHLBERG",
                                "2006-02-15T03:34:33.000Z"
                            ],
                            [
                                3,
                                "ED",
                                "CHASE",
                                "2006-02-15T03:34:33.000Z"
                            ],
                            [
                                4,
                                "JENNIFER",
                                "DAVIS",
                                "2006-02-15T03:34:33.000Z"
                            ],
                            [
                                5,
                                "JOHNNY",
                                "LOLLOBRIGIDA",
                                "2006-02-15T03:34:33.000Z"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "actor_id",
                                "type": "INT4"
                            },
                            {
                                "name": "first_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_update",
                                "type": "TIMESTAMP"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 5 rows affected."
                },
                "status": "SUCCESS",
                "type": "TABULAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxhi003scarsjsivwztf"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxhq003ucars9or2wo2d",
            "studentOutputId": "clmjcnkxy0003ca54wqq450mp",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxhq003ucars9or2wo2d",
                "order": 2,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T15:54:59.300Z",
                "title": "Write your query",
                "description": "The last name for the actor number 3 should be Teofanovioc",
                "lintRules": null,
                "lintResult": null,
                "content": "UPDATE actor\r\nSET last_name = 'TEOFANOVIC'\r\nWHERE actor_id = 3;",
                "template": null,
                "studentPermission": "UPDATE",
                "testQuery": false
            },
            "studentOutput": {
                "id": "clmjcnkxy0003ca54wqq450mp",
                "createdAt": "2023-09-14T15:52:50.361Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TEXT",
                    "order": 2,
                    "result": "UPDATE operation executed. 1 row affected.",
                    "status": "SUCCESS",
                    "feedback": "UPDATE operation executed. 1 row affected."
                },
                "status": "SUCCESS",
                "type": "TEXT",
                "dbms": "POSTGRES",
                "queryId": "clmjagxhq003ucars9or2wo2d"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxhu003wcarsadiypj6p",
            "studentOutputId": "clmjcnm6p0005ca54otv3jrag",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxhu003wcarsadiypj6p",
                "order": 3,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "title": "Visible Test query dataset",
                "description": "Lint Tested",
                "lintRules": "[sqlfluff]\nexclude_rules = AM04",
                "lintResult": {
                    "violations": []
                },
                "content": "SELECT\r\n    actor_id,\r\n    first_name,\r\n    last_name\r\nFROM actor\r\nORDER BY actor_id\r\nLIMIT 5;\r\n",
                "template": null,
                "studentPermission": "UPDATE",
                "testQuery": true
            },
            "studentOutput": {
                "id": "clmjcnm6p0005ca54otv3jrag",
                "createdAt": "2023-09-14T15:52:50.361Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TABULAR",
                    "order": 3,
                    "result": {
                        "rows": [
                            [
                                1,
                                "PENELOPE",
                                "GUINESS"
                            ],
                            [
                                2,
                                "NICK",
                                "WAHLBERG"
                            ],
                            [
                                3,
                                "ED",
                                "TEOFANOVIC"
                            ],
                            [
                                4,
                                "JENNIFER",
                                "DAVIS"
                            ],
                            [
                                5,
                                "JOHNNY",
                                "LOLLOBRIGIDA"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "actor_id",
                                "type": "INT4"
                            },
                            {
                                "name": "first_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 5 rows affected.",
                    "testPassed": true
                },
                "status": "SUCCESS",
                "type": "TABULAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxhu003wcarsadiypj6p"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxhz003ycars0f5p4091",
            "studentOutputId": "clmjcyhrw000yca54r10gubve",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxhz003ycars0f5p4091",
                "order": 4,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T14:51:40.772Z",
                "title": "Hidden Test query scalar",
                "description": null,
                "lintRules": null,
                "lintResult": null,
                "content": "SELECT last_name FROM actor WHERE actor_id = 3;",
                "template": null,
                "studentPermission": "HIDDEN",
                "testQuery": true
            },
            "studentOutput": {
                "id": "clmjcyhrw000yca54r10gubve",
                "createdAt": "2023-09-14T16:01:18.285Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "SCALAR",
                    "order": 4,
                    "result": {
                        "rows": [
                            [
                                "TEOFANOVIC"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 1 row affected.",
                    "testPassed": true
                },
                "status": "SUCCESS",
                "type": "SCALAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxhz003ycars0f5p4091"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxi40040carsa3e7tl1m",
            "studentOutputId": "clmjcyhs10010ca542s8i58zl",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxi40040carsa3e7tl1m",
                "order": 5,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T16:01:27.897Z",
                "title": "Ignore all",
                "description": null,
                "lintRules": null,
                "lintResult": null,
                "content": "SELECT \r\n    actor_id,\r\n    first_name,\r\n    last_name\r\nFROM actor\r\nORDER BY actor_id\r\nLIMIT 5;\r\n",
                "template": null,
                "studentPermission": "UPDATE",
                "testQuery": true
            },
            "studentOutput": {
                "id": "clmjcyhs10010ca542s8i58zl",
                "createdAt": "2023-09-14T16:01:18.285Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TABULAR",
                    "order": 5,
                    "result": {
                        "rows": [
                            [
                                "1",
                                "PENELOPE",
                                "GUINESS"
                            ],
                            [
                                "2",
                                "NICK",
                                "WAHLBERG"
                            ],
                            [
                                "3",
                                "ED",
                                "TEOFANOVIC"
                            ],
                            [
                                "4",
                                "JENNIFER",
                                "DAVIS"
                            ],
                            [
                                "5",
                                "JOHNNY",
                                "LOLLOBRIGIDA"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "actor_id",
                                "type": "INT4"
                            },
                            {
                                "name": "first_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 5 rows affected.",
                    "testPassed": true
                },
                "status": "SUCCESS",
                "type": "TABULAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxi40040carsa3e7tl1m"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxi80042carsx6qainos",
            "studentOutputId": "clmjcyuxx0016ca54y6e6vbnr",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxi80042carsx6qainos",
                "order": 6,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T16:01:46.838Z",
                "title": "Big Dataset",
                "description": null,
                "lintRules": null,
                "lintResult": null,
                "content": "SELECT \r\n    actor_id,\r\n    first_name,\r\n    last_name\r\nFROM actor\r\nORDER BY actor_id;\r\n",
                "template": null,
                "studentPermission": "UPDATE",
                "testQuery": true
            },
            "studentOutput": {
                "id": "clmjcyuxx0016ca54y6e6vbnr",
                "createdAt": "2023-09-14T16:01:35.312Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TABULAR",
                    "order": 6,
                    "result": {
                        "rows": [
                            [
                                1,
                                "PENELOPE",
                                "GUINESS"
                            ],
                            [
                                2,
                                "NICK",
                                "WAHLBERG"
                            ],
                            [
                                3,
                                "ED",
                                "TEOFANOVIC"
                            ],
                            [
                                4,
                                "JENNIFER",
                                "DAVIS"
                            ],
                            [
                                5,
                                "JOHNNY",
                                "LOLLOBRIGIDA"
                            ],
                            [
                                6,
                                "BETTE",
                                "NICHOLSON"
                            ],
                            [
                                7,
                                "GRACE",
                                "MOSTEL"
                            ],
                            [
                                8,
                                "MATTHEW",
                                "JOHANSSON"
                            ],
                            [
                                9,
                                "JOE",
                                "SWANK"
                            ],
                            [
                                10,
                                "CHRISTIAN",
                                "GABLE"
                            ],
                            [
                                11,
                                "ZERO",
                                "CAGE"
                            ],
                            [
                                12,
                                "KARL",
                                "BERRY"
                            ],
                            [
                                13,
                                "UMA",
                                "WOOD"
                            ],
                            [
                                14,
                                "VIVIEN",
                                "BERGEN"
                            ],
                            [
                                15,
                                "CUBA",
                                "OLIVIER"
                            ],
                            [
                                16,
                                "FRED",
                                "COSTNER"
                            ],
                            [
                                17,
                                "HELEN",
                                "VOIGHT"
                            ],
                            [
                                18,
                                "DAN",
                                "TORN"
                            ],
                            [
                                19,
                                "BOB",
                                "FAWCETT"
                            ],
                            [
                                20,
                                "LUCILLE",
                                "TRACY"
                            ],
                            [
                                21,
                                "KIRSTEN",
                                "PALTROW"
                            ],
                            [
                                22,
                                "ELVIS",
                                "MARX"
                            ],
                            [
                                23,
                                "SANDRA",
                                "KILMER"
                            ],
                            [
                                24,
                                "CAMERON",
                                "STREEP"
                            ],
                            [
                                25,
                                "KEVIN",
                                "BLOOM"
                            ],
                            [
                                26,
                                "RIP",
                                "CRAWFORD"
                            ],
                            [
                                27,
                                "JULIA",
                                "MCQUEEN"
                            ],
                            [
                                28,
                                "WOODY",
                                "HOFFMAN"
                            ],
                            [
                                29,
                                "ALEC",
                                "WAYNE"
                            ],
                            [
                                30,
                                "SANDRA",
                                "PECK"
                            ],
                            [
                                31,
                                "SISSY",
                                "SOBIESKI"
                            ],
                            [
                                32,
                                "TIM",
                                "HACKMAN"
                            ],
                            [
                                33,
                                "MILLA",
                                "PECK"
                            ],
                            [
                                34,
                                "AUDREY",
                                "OLIVIER"
                            ],
                            [
                                35,
                                "JUDY",
                                "DEAN"
                            ],
                            [
                                36,
                                "BURT",
                                "DUKAKIS"
                            ],
                            [
                                37,
                                "VAL",
                                "BOLGER"
                            ],
                            [
                                38,
                                "TOM",
                                "MCKELLEN"
                            ],
                            [
                                39,
                                "GOLDIE",
                                "BRODY"
                            ],
                            [
                                40,
                                "JOHNNY",
                                "CAGE"
                            ],
                            [
                                41,
                                "JODIE",
                                "DEGENERES"
                            ],
                            [
                                42,
                                "TOM",
                                "MIRANDA"
                            ],
                            [
                                43,
                                "KIRK",
                                "JOVOVICH"
                            ],
                            [
                                44,
                                "NICK",
                                "STALLONE"
                            ],
                            [
                                45,
                                "REESE",
                                "KILMER"
                            ],
                            [
                                46,
                                "PARKER",
                                "GOLDBERG"
                            ],
                            [
                                47,
                                "JULIA",
                                "BARRYMORE"
                            ],
                            [
                                48,
                                "FRANCES",
                                "DAY-LEWIS"
                            ],
                            [
                                49,
                                "ANNE",
                                "CRONYN"
                            ],
                            [
                                50,
                                "NATALIE",
                                "HOPKINS"
                            ],
                            [
                                51,
                                "GARY",
                                "PHOENIX"
                            ],
                            [
                                52,
                                "CARMEN",
                                "HUNT"
                            ],
                            [
                                53,
                                "MENA",
                                "TEMPLE"
                            ],
                            [
                                54,
                                "PENELOPE",
                                "PINKETT"
                            ],
                            [
                                55,
                                "FAY",
                                "KILMER"
                            ],
                            [
                                56,
                                "DAN",
                                "HARRIS"
                            ],
                            [
                                57,
                                "JUDE",
                                "CRUISE"
                            ],
                            [
                                58,
                                "CHRISTIAN",
                                "AKROYD"
                            ],
                            [
                                59,
                                "DUSTIN",
                                "TAUTOU"
                            ],
                            [
                                60,
                                "HENRY",
                                "BERRY"
                            ],
                            [
                                61,
                                "CHRISTIAN",
                                "NEESON"
                            ],
                            [
                                62,
                                "JAYNE",
                                "NEESON"
                            ],
                            [
                                63,
                                "CAMERON",
                                "WRAY"
                            ],
                            [
                                64,
                                "RAY",
                                "JOHANSSON"
                            ],
                            [
                                65,
                                "ANGELA",
                                "HUDSON"
                            ],
                            [
                                66,
                                "MARY",
                                "TANDY"
                            ],
                            [
                                67,
                                "JESSICA",
                                "BAILEY"
                            ],
                            [
                                68,
                                "RIP",
                                "WINSLET"
                            ],
                            [
                                69,
                                "KENNETH",
                                "PALTROW"
                            ],
                            [
                                70,
                                "MICHELLE",
                                "MCCONAUGHEY"
                            ],
                            [
                                71,
                                "ADAM",
                                "GRANT"
                            ],
                            [
                                72,
                                "SEAN",
                                "WILLIAMS"
                            ],
                            [
                                73,
                                "GARY",
                                "PENN"
                            ],
                            [
                                74,
                                "MILLA",
                                "KEITEL"
                            ],
                            [
                                75,
                                "BURT",
                                "POSEY"
                            ],
                            [
                                76,
                                "ANGELINA",
                                "ASTAIRE"
                            ],
                            [
                                77,
                                "CARY",
                                "MCCONAUGHEY"
                            ],
                            [
                                78,
                                "GROUCHO",
                                "SINATRA"
                            ],
                            [
                                79,
                                "MAE",
                                "HOFFMAN"
                            ],
                            [
                                80,
                                "RALPH",
                                "CRUZ"
                            ],
                            [
                                81,
                                "SCARLETT",
                                "DAMON"
                            ],
                            [
                                82,
                                "WOODY",
                                "JOLIE"
                            ],
                            [
                                83,
                                "BEN",
                                "WILLIS"
                            ],
                            [
                                84,
                                "JAMES",
                                "PITT"
                            ],
                            [
                                85,
                                "MINNIE",
                                "ZELLWEGER"
                            ],
                            [
                                86,
                                "GREG",
                                "CHAPLIN"
                            ],
                            [
                                87,
                                "SPENCER",
                                "PECK"
                            ],
                            [
                                88,
                                "KENNETH",
                                "PESCI"
                            ],
                            [
                                89,
                                "CHARLIZE",
                                "DENCH"
                            ],
                            [
                                90,
                                "SEAN",
                                "GUINESS"
                            ],
                            [
                                91,
                                "CHRISTOPHER",
                                "BERRY"
                            ],
                            [
                                92,
                                "KIRSTEN",
                                "AKROYD"
                            ],
                            [
                                93,
                                "ELLEN",
                                "PRESLEY"
                            ],
                            [
                                94,
                                "KENNETH",
                                "TORN"
                            ],
                            [
                                95,
                                "DARYL",
                                "WAHLBERG"
                            ],
                            [
                                96,
                                "GENE",
                                "WILLIS"
                            ],
                            [
                                97,
                                "MEG",
                                "HAWKE"
                            ],
                            [
                                98,
                                "CHRIS",
                                "BRIDGES"
                            ],
                            [
                                99,
                                "JIM",
                                "MOSTEL"
                            ],
                            [
                                100,
                                "SPENCER",
                                "DEPP"
                            ],
                            [
                                101,
                                "SUSAN",
                                "DAVIS"
                            ],
                            [
                                102,
                                "WALTER",
                                "TORN"
                            ],
                            [
                                103,
                                "MATTHEW",
                                "LEIGH"
                            ],
                            [
                                104,
                                "PENELOPE",
                                "CRONYN"
                            ],
                            [
                                105,
                                "SIDNEY",
                                "CROWE"
                            ],
                            [
                                106,
                                "GROUCHO",
                                "DUNST"
                            ],
                            [
                                107,
                                "GINA",
                                "DEGENERES"
                            ],
                            [
                                108,
                                "WARREN",
                                "NOLTE"
                            ],
                            [
                                109,
                                "SYLVESTER",
                                "DERN"
                            ],
                            [
                                110,
                                "SUSAN",
                                "DAVIS"
                            ],
                            [
                                111,
                                "CAMERON",
                                "ZELLWEGER"
                            ],
                            [
                                112,
                                "RUSSELL",
                                "BACALL"
                            ],
                            [
                                113,
                                "MORGAN",
                                "HOPKINS"
                            ],
                            [
                                114,
                                "MORGAN",
                                "MCDORMAND"
                            ],
                            [
                                115,
                                "HARRISON",
                                "BALE"
                            ],
                            [
                                116,
                                "DAN",
                                "STREEP"
                            ],
                            [
                                117,
                                "RENEE",
                                "TRACY"
                            ],
                            [
                                118,
                                "CUBA",
                                "ALLEN"
                            ],
                            [
                                119,
                                "WARREN",
                                "JACKMAN"
                            ],
                            [
                                120,
                                "PENELOPE",
                                "MONROE"
                            ],
                            [
                                121,
                                "LIZA",
                                "BERGMAN"
                            ],
                            [
                                122,
                                "SALMA",
                                "NOLTE"
                            ],
                            [
                                123,
                                "JULIANNE",
                                "DENCH"
                            ],
                            [
                                124,
                                "SCARLETT",
                                "BENING"
                            ],
                            [
                                125,
                                "ALBERT",
                                "NOLTE"
                            ],
                            [
                                126,
                                "FRANCES",
                                "TOMEI"
                            ],
                            [
                                127,
                                "KEVIN",
                                "GARLAND"
                            ],
                            [
                                128,
                                "CATE",
                                "MCQUEEN"
                            ],
                            [
                                129,
                                "DARYL",
                                "CRAWFORD"
                            ],
                            [
                                130,
                                "GRETA",
                                "KEITEL"
                            ],
                            [
                                131,
                                "JANE",
                                "JACKMAN"
                            ],
                            [
                                132,
                                "ADAM",
                                "HOPPER"
                            ],
                            [
                                133,
                                "RICHARD",
                                "PENN"
                            ],
                            [
                                134,
                                "GENE",
                                "HOPKINS"
                            ],
                            [
                                135,
                                "RITA",
                                "REYNOLDS"
                            ],
                            [
                                136,
                                "ED",
                                "MANSFIELD"
                            ],
                            [
                                137,
                                "MORGAN",
                                "WILLIAMS"
                            ],
                            [
                                138,
                                "LUCILLE",
                                "DEE"
                            ],
                            [
                                139,
                                "EWAN",
                                "GOODING"
                            ],
                            [
                                140,
                                "WHOOPI",
                                "HURT"
                            ],
                            [
                                141,
                                "CATE",
                                "HARRIS"
                            ],
                            [
                                142,
                                "JADA",
                                "RYDER"
                            ],
                            [
                                143,
                                "RIVER",
                                "DEAN"
                            ],
                            [
                                144,
                                "ANGELA",
                                "WITHERSPOON"
                            ],
                            [
                                145,
                                "KIM",
                                "ALLEN"
                            ],
                            [
                                146,
                                "ALBERT",
                                "JOHANSSON"
                            ],
                            [
                                147,
                                "FAY",
                                "WINSLET"
                            ],
                            [
                                148,
                                "EMILY",
                                "DEE"
                            ],
                            [
                                149,
                                "RUSSELL",
                                "TEMPLE"
                            ],
                            [
                                150,
                                "JAYNE",
                                "NOLTE"
                            ],
                            [
                                151,
                                "GEOFFREY",
                                "HESTON"
                            ],
                            [
                                152,
                                "BEN",
                                "HARRIS"
                            ],
                            [
                                153,
                                "MINNIE",
                                "KILMER"
                            ],
                            [
                                154,
                                "MERYL",
                                "GIBSON"
                            ],
                            [
                                155,
                                "IAN",
                                "TANDY"
                            ],
                            [
                                156,
                                "FAY",
                                "WOOD"
                            ],
                            [
                                157,
                                "GRETA",
                                "MALDEN"
                            ],
                            [
                                158,
                                "VIVIEN",
                                "BASINGER"
                            ],
                            [
                                159,
                                "LAURA",
                                "BRODY"
                            ],
                            [
                                160,
                                "CHRIS",
                                "DEPP"
                            ],
                            [
                                161,
                                "HARVEY",
                                "HOPE"
                            ],
                            [
                                162,
                                "OPRAH",
                                "KILMER"
                            ],
                            [
                                163,
                                "CHRISTOPHER",
                                "WEST"
                            ],
                            [
                                164,
                                "HUMPHREY",
                                "WILLIS"
                            ],
                            [
                                165,
                                "AL",
                                "GARLAND"
                            ],
                            [
                                166,
                                "NICK",
                                "DEGENERES"
                            ],
                            [
                                167,
                                "LAURENCE",
                                "BULLOCK"
                            ],
                            [
                                168,
                                "WILL",
                                "WILSON"
                            ],
                            [
                                169,
                                "KENNETH",
                                "HOFFMAN"
                            ],
                            [
                                170,
                                "MENA",
                                "HOPPER"
                            ],
                            [
                                171,
                                "OLYMPIA",
                                "PFEIFFER"
                            ],
                            [
                                172,
                                "GROUCHO",
                                "WILLIAMS"
                            ],
                            [
                                173,
                                "ALAN",
                                "DREYFUSS"
                            ],
                            [
                                174,
                                "MICHAEL",
                                "BENING"
                            ],
                            [
                                175,
                                "WILLIAM",
                                "HACKMAN"
                            ],
                            [
                                176,
                                "JON",
                                "CHASE"
                            ],
                            [
                                177,
                                "GENE",
                                "MCKELLEN"
                            ],
                            [
                                178,
                                "LISA",
                                "MONROE"
                            ],
                            [
                                179,
                                "ED",
                                "GUINESS"
                            ],
                            [
                                180,
                                "JEFF",
                                "SILVERSTONE"
                            ],
                            [
                                181,
                                "MATTHEW",
                                "CARREY"
                            ],
                            [
                                182,
                                "DEBBIE",
                                "AKROYD"
                            ],
                            [
                                183,
                                "RUSSELL",
                                "CLOSE"
                            ],
                            [
                                184,
                                "HUMPHREY",
                                "GARLAND"
                            ],
                            [
                                185,
                                "MICHAEL",
                                "BOLGER"
                            ],
                            [
                                186,
                                "JULIA",
                                "ZELLWEGER"
                            ],
                            [
                                187,
                                "RENEE",
                                "BALL"
                            ],
                            [
                                188,
                                "ROCK",
                                "DUKAKIS"
                            ],
                            [
                                189,
                                "CUBA",
                                "BIRCH"
                            ],
                            [
                                190,
                                "AUDREY",
                                "BAILEY"
                            ],
                            [
                                191,
                                "GREGORY",
                                "GOODING"
                            ],
                            [
                                192,
                                "JOHN",
                                "SUVARI"
                            ],
                            [
                                193,
                                "BURT",
                                "TEMPLE"
                            ],
                            [
                                194,
                                "MERYL",
                                "ALLEN"
                            ],
                            [
                                195,
                                "JAYNE",
                                "SILVERSTONE"
                            ],
                            [
                                196,
                                "BELA",
                                "WALKEN"
                            ],
                            [
                                197,
                                "REESE",
                                "WEST"
                            ],
                            [
                                198,
                                "MARY",
                                "KEITEL"
                            ],
                            [
                                199,
                                "JULIA",
                                "FAWCETT"
                            ],
                            [
                                200,
                                "THORA",
                                "TEMPLE"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "actor_id",
                                "type": "INT4"
                            },
                            {
                                "name": "first_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 200 rows affected.",
                    "testPassed": true
                },
                "status": "SUCCESS",
                "type": "TABULAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxi80042carsx6qainos"
            }
        },
        {
            "userEmail": "stefanteofanovic@hotmail.com",
            "questionId": "clmjadzyx002kcarsjgvmbxj0",
            "queryId": "clmjagxic0044carsp7ssamqc",
            "studentOutputId": "clmjcyuy10018ca54ake1vqno",
            "solutionOutputId": null,
            "query": {
                "id": "clmjagxic0044carsp7ssamqc",
                "order": 7,
                "questionId": "clmjadzyx002kcarsjgvmbxj0",
                "createdAt": "2023-09-14T14:51:40.772Z",
                "updatedAt": "2023-09-14T16:01:57.472Z",
                "title": "Ingore Types",
                "description": null,
                "lintRules": null,
                "lintResult": null,
                "content": "SELECT \r\n    actor_id,\r\n    first_name,\r\n    last_name\r\nFROM actor\r\nORDER BY actor_id\r\nLIMIT 5;",
                "template": null,
                "studentPermission": "UPDATE",
                "testQuery": true
            },
            "studentOutput": {
                "id": "clmjcyuy10018ca54ake1vqno",
                "createdAt": "2023-09-14T16:01:35.312Z",
                "updatedAt": "2023-09-14T16:04:16.494Z",
                "output": {
                    "type": "TABULAR",
                    "order": 7,
                    "result": {
                        "rows": [
                            [
                                "1",
                                "PENELOPE",
                                "GUINESS"
                            ],
                            [
                                "2",
                                "NICK",
                                "WAHLBERG"
                            ],
                            [
                                "3",
                                "ED",
                                "TEOFANOVIC"
                            ],
                            [
                                "4",
                                "JENNIFER",
                                "DAVIS"
                            ],
                            [
                                "5",
                                "JOHNNY",
                                "LOLLOBRIGIDA"
                            ]
                        ],
                        "columns": [
                            {
                                "name": "actor_id",
                                "type": "INT4"
                            },
                            {
                                "name": "first_name",
                                "type": "VARCHAR"
                            },
                            {
                                "name": "last_name",
                                "type": "VARCHAR"
                            }
                        ]
                    },
                    "status": "SUCCESS",
                    "feedback": "SELECT operation executed. 5 rows affected.",
                    "testPassed": true
                },
                "status": "SUCCESS",
                "type": "TABULAR",
                "dbms": "POSTGRES",
                "queryId": "clmjagxic0044carsp7ssamqc"
            }
        }
    ]
}

* */

const ConsultQuery = ({ header, query, output }) => {
  return (
      query && (
      <>
          <QueryEditor
              readOnly
              query={query}
          />
          { output && (
              <QueryOutput
                  header={header}
                  color={"info"}
                  result={output}
                  lintResult={query.lintResult}
              />
          )}

      </>
    ))
}


const CompareDatabase = ({ solution, answer }) => {
  const { height: containerHeight } = useResizeObserver()

  console.log("solution", solution)

  const allTestQueries = answer.queries.filter((saQ) => saQ.query.testQuery)
  const passedTestQueries = allTestQueries.filter((saQ) => saQ.studentOutput?.output.testPassed)

  const allLintQueries = answer.queries.filter((saQ) => saQ.query.lintRules)
  const passedLintQueries = allLintQueries.filter((saQ) => saQ.query.lintResult?.violations.length === 0)

  const solutionQueries = solution.solutionQueries;

  const getSolutionQuery = useCallback((order) => {
    return solutionQueries.find((sq) => sq.query.order === order)
  }, [solutionQueries])

  return (
    answer &&
    solution && (
      <Stack
        maxHeight={containerHeight}
        height={'100%'}
        width={'100%'}
        maxWidth={'100%'}
      >
        <Stack direction={"row"} spacing={1}  width={'100%'} justifyContent={"stretch"}>
          <Box flex={1}>
            <Alert  flex={1} severity={passedTestQueries.length === allTestQueries.length ? 'success' : 'warning'}>
              <AlertTitle>{passedTestQueries.length}/{allTestQueries.length} Output tests passed</AlertTitle>
            </Alert>
          </Box>
          <Box flex={1}>
            <Alert severity={passedLintQueries.length === allLintQueries.length ? 'success' : 'warning'}>
              <AlertTitle>{passedLintQueries.length}/{allLintQueries.length} Lint tests passed</AlertTitle>
            </Alert>
          </Box>
        </Stack>
        <ScrollContainer>
          {
            allTestQueries.map((saQ) => (
                <LayoutSplitScreen
                    useScrollContainer={false}
                    key={saQ.query.id}
                    leftPanel={
                        <ConsultQuery
                            header={
                                <>
                                  <Typography variant={"caption"}>
                                      Student output
                                  </Typography>
                                  <Typography variant={"caption"}>Last run: {saQ.studentOutput?.updatedAt && new Date(saQ.studentOutput?.updatedAt).toLocaleString()}</Typography>
                                </>
                            }
                            query={saQ.query}
                            output={saQ.studentOutput?.output}
                        />


                    }
                    rightPanel={
                        <ConsultQuery
                            header={
                                    <Typography variant={"caption"}>
                                        Solution output
                                    </Typography>
                            }
                            query={getSolutionQuery(saQ.query.order).query}
                            output={getSolutionQuery(saQ.query.order)?.output.output}
                        />
                    }
                />
            ))
          }

        </ScrollContainer>

      </Stack>
    )
  )
}

export default CompareDatabase
