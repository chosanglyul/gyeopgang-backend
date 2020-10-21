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
### `/subjects/:code`
code must be a natural number

- POST
    - add a new subject
    - code must equals to (number of subjects in database)+1
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
        "status": "success" | false
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

- POST(TODO)
    - add a new class
    - parameters: info
    ```
    info : 분반 정보    
    ```

    example:
    {
        "info": 
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- GET
- DELETE
- PATCH

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
        MUST CHECK
    }
    ```
    

### `/auth/logout`
- POST
    - logout
    - parameters: none
    
    - returns:
    ```
    {
        MUST CHECK
    }
    ```

### `/auth/user/:code`
code must be a natural number
code is a unique identifier(student code, ex:20001)

- POST
    - add a new user
    - parameters: email, name, password, grade, class, number
    ```
    email : 이메일 주소
    name : 이름
    password : 비밀번호
    grade : 학년
    class : 반
    number : 번호

    example:
    {
        "email": "you@example.com",
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

- GET
    - get information about the user except password
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false,
        "data": 
        {
            "email": "you@example.com",
            "name": "your-name",
            "grade": 1,
            "class": 1,
            "number": 1
            "subjects": [1,2,3],
            "classes": [2,1,5],
            "password": null
        }
    }

    example:
    {
        "status": "success",
        "data": 
        {
            "email": "",
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
    - delete a user
    - parameters: none

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```

- PATCH(TODO)

### `/auth/changepw/:code`
- POST
    - change password of the user

    - parameters: password
    ```
    password: 비밀번호

    example:
    {
        "password": "your-passw0rd"
    }
    ```

    - returns:
    ```
    {
        "status": "success" | false
    }
    ```