# SSHS Gyeopgang Backend
## Setup
### Prerequisites

Make sure you installed [Node.js](https://nodejs.org/) and [npm](https://npmjs.com).
When using windows, install unix tools and git bash from [git](https://git-scm.com/download/win).

### Initial setup

Clone this repository and install all dependencies: 

``` shell
$ git clone https://github.com/chosanglyul/gyeopgang-backend.git
$ cd gyeopgang-backend
$ npm i
```

You need an env file for features that use the database.
Make a database account first and make a `.env` file with credentials.

``` shell
$ touch .env
$ cat <<EOF > .env
DB_CONNECTION_STRING="your-db-connection-string"
KEYS="your-koa-secret-key"
EOF
```

Start the server:

``` shell
$ node index
```

[The app](http://localhost:8000) runs on port 8000 on localhost.

## API docs

### `/subjects`
- POST
    - add a new subject at end of the record
    - parameters: name, hours, credit
    ```
    name : 과목명
    hours : 실제 수업 시간
    credit : 학점 수

    example:
    {
        "name": "물리학실험1",
        "hours": 2,
        "credit": 1
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- GET
    - get number of saved subjects
    - parameters: none
    - returns: 
    ```
    {
        "status": "success" | false,
        "data": 
        {
            "count": "등록되어 있는 과목 수"
        }
    }
    ```

### `/subjects/:code`
code must be a natural number

- POST(Don't use this, use POST /subject)
    - add a new subject
    - parameters: name, hours, credit
    ```
    name : 과목명
    hours : 실제 수업 시간
    credit : 학점 수

    example:
    {
        "name": "물리학실험1",
        "hours": 2,
        "credit": 1
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- GET
    - get information about the subject
    - parameters: none
    - returns: 
    ```
    {
        "status": "success" | false,
        "data": 
        {
            "name": "과목명",
            "hours": "실제 수업 시간",
            "credit": "학점 수",
            "classes": "과목의 총 분반 수"
        }
    }
    ```

- DELETE
    - delete a subject
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

### `/subjects/:subjectcode/:classnum`
subjectcode and classnum must be natural numbers

- POST
    - add new classes
    - parameters: info
    - classnum must equals to (number of classes in database)+(length of info)
    - elements of info must be arrays and length equals to subject's hours
    ```
    info : 분반 정보

    example: 두 분반을 추가, 1주일에 수업 2시간
    {
        "info":
        [
            [ (1분반 info)
                {
                    "day": 1, (1 : 월요일 ~ 5 : 금요일)
                    "time": 1, (1교시)
                    "teacher": "성함"
                },
                {
                    "day": 1,
                    "time": 2,
                    "teacher": "성함"
                }
            ],
            [ (2분반 info)
                {
                    "day": 2,
                    "time": 6,
                    "teacher": "성함"
                },
                {
                    "day": 2,
                    "time": 7,
                    "teacher": "성함"
                }
            ]
        ]
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- GET
    - get information about the class
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false,
        "data": 
        {
            "info": "분반 정보(POST 설명 참고)",
            "students": "해당 분반 학생 교번"
        }
    }
    ```

- DELETE
    - delete classes
    - parameters: none

    ```
    example:
    /subjects/1/3 : delete classes that subject == 1, classnum >= 3
    /subjects/3/1 : delete classes that subject == 3, classnum >= 1
    ```
    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- PATCH
    - add/del students
    - parameters: changes
    ```
    changes: 추가/삭제할 학생 교번

    example:
    {
        "changes":
        {
            "add": [1,2,3],
            "del": [4,5,6]
        }
    }
    ```
    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

### `/auth/login`
- POST
    - login
    - parameters: code
    ```
    code: 교번
    password: 비밀번호

    example:
    {
        "code": "20001",
        "password": "your-passw0rd",
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```
    

### `/auth/logout`
- POST
    - logout
    - parameters: none
    
    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

### `/auth/register`
- POST
    - add a new user
    - parameters: code, name, password, grade, class, number
    ```
    code : 교번
    name : 이름
    password : 비밀번호
    grade : 학년
    class : 반
    number : 번호

    example:
    {
        "code": "your-code",
        "name": "your-name",
        "password": "your-passw0rd",
        "grade": 1,
        "class": 1,
        "number": 1
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

### `/auth/user`
- POST
    - change password of the logined user

    - parameters: oldpassword, password
    ```
    oldpassword: 이전 비밀번호
    password: 비밀번호

    example:
    {
        "oldpassword": "password before change",
        "password": "your-new-passw0rd"
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- GET
    - get information about logined user except password
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false,
        "data": 
        {
            "name": "이름",
            "grade": "학년",
            "class": "반",
            "number": "번호",
            "subjects": "수강하는 과목의 번호",
            "classes": "수강하는 각 과목의 분반",
            "password": null
        }
    }
    ```

- DELETE
    - delete a logined user
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- PATCH
    - add/del subjects for logined user
    - parameters: changes
    ```
    changes: 추가/삭제할 수강 과목

    example:
    {
        "changes":
        {
            "action": "add" | "del",
            "subject": 1,
            "class": 2
        }   
    }
    ```
    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

### `/auth/user?code=X`
- GET
    - get information about user that code equals X except password
    - parameters: none
    - returns: same form as GET /auth/user

### `/gyeopgang/all`
- GET
    - get counts of overlapped classes
    - parameters: none
    
    - returns:
    ```
    {
        "status": "success" | false,
        "data": 
        {
            name: count of overlapped classes,
            name: count of overlapped classes,
            ...
        }
    }
    ```

### `/gyeopgang/cmpuser`
- GET
    - get overlapped classes with specific student
    - parameters: none
    
    - returns:
    ```
    {
        "status": "success" | false,
        "data":
        {
            "subjects": array of overlapped subjects,
            "classes": array of overlapped classes
        }
    }
    ```