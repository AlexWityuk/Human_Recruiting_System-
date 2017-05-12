var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
//var connectionString =  'postgres://postgres:1@localhost:5432/newdb';
//var connectionString =  DATABASE_URL;
var connectionString = {
    host: 'ec2-54-83-205-71.compute-1.amazonaws.com',
    port: 5432,
    database: 'd75g3o5dlffb85',
    user: 'dzfyusivadobec',
    password: 'de16e5dc212d220edeb90620e9807b57b392cf17173d51b96eb8b71a1d5fee60',
    ssl: true
};
var db = pgp(connectionString);

function getAllUsers(page, cb) {
    var limit = 20;
    var offset = 19 * (page-1);
    console.log('offset: ' + offset);
    db.any("SELECT competitors.id, competitors.fio, competitors.datein, (array_agg(skills.name || " + "' ('" +
            "|| skills.number ||" + "')' ORDER BY skills.number DESC))[1:3] as skillname " +
            'FROM competitors '+
            'LEFT JOIN skills ON competitors.id = skills.competitor_id '+
            'GROUP BY competitors.fio, competitors.datein, competitors.id '+
            'ORDER BY competitors.datein DESC LIMIT $1 OFFSET $2', [limit, offset])
        .then(function (found) {
            cb(found);
        })
        .catch(function (err) {
            cb(err);
        });
}
function getCountUsers (cb){
    db.one("SELECT COUNT(id)as count FROM competitors")
        .then(function (found) {
            cb(found);
        })
        .catch(function (err) {
            cb(err);
        });
}
function getSingleUser(pupID, cb) {
    db.one('SELECT competitors.id, competitors.fio, (array_agg(DISTINCT skills.id ||' + "' '" +
            '|| skills.name ||' + "' '" + '|| skills.number )) as skillname, ' +
            '(array_agg(DISTINCT contacts.id ||' + "' '" + '|| contacts.type ||' + "' '" + '|| contacts.contacts_data)) as contacts ' +
            'FROM competitors ' +
            'LEFT JOIN skills ON competitors.id = skills.competitor_id ' +
            'LEFT JOIN contacts ON competitors.id = contacts.competitor_id ' +
            'WHERE competitors.id = $1 ' +
            'GROUP BY competitors.fio, competitors.id ', pupID)
        .then(function (data) {
            data.fio = data.fio.split(' ');
            for (var i =0; i< data.skillname.length; i++){
                if (data.skillname[i] != null){
                    data.skillname[i] = data.skillname[i].split(' ');
                }
            }
            for (var i =0; i< data.contacts.length; i++){
                if (data.contacts[i] !== null) {
                    data.contacts[i] = data.contacts[i].split(' ');
                }
            }
            cb(data);
        })
        .catch(function (err) {
            console.log(err);
        });
}

function createUser(reqbody, cb) {
    var fio = reqbody.Nameupdate + ' ' +  reqbody.Familyupdate;
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
        + (currentdate.getMonth() +1) + "-"
        + currentdate.getDate();
    db.one('INSERT INTO competitors(fio, datein)' +
            'VALUES ($1, $2) RETURNING id AS last_id',
        [fio, datetime])
        .then(function (data) {
            console.log(data);
            insertContact(reqbody, data);
            insertSkills(reqbody, data);
            cb(data);
        })
        .catch(function (err) {
            console.log(err);
        });
}

function getSearchUsers (arr, cb){
    db.any("SELECT competitors.id, competitors.fio, competitors.datein, (array_agg(DISTINCT skills.name || " + "' ('" +
            "|| skills.number ||" + "')' ))[1:3] as skillname " +
            'FROM competitors '+
            'LEFT JOIN skills ON competitors.id = skills.competitor_id '+
            'LEFT JOIN contacts ON competitors.id = contacts.competitor_id '+
            'WHERE split_part(competitors.fio,' + "' '" +', 1 ) like any($1::text[]) '+
            'OR split_part(competitors.fio,' + "' '" +', 2 ) like any($1::text[]) '+
            'OR  skills.name like any($1::text[]) OR contacts.type like any($1::text[])' +
            'GROUP BY competitors.fio, competitors.datein, competitors.id '+
            'ORDER BY competitors.fio, competitors.datein', [arr])
        .then(function (data) {
            cb(data);
        })
        .catch(function (err) {
        });
}

function updateUser(reqbody,userid, cb) {
    var fio = reqbody.Nameupdate + ' ' +  reqbody.Familyupdate;
    db.none('UPDATE competitors SET fio=$1 WHERE competitors.id = $2', [fio, userid])
        .then(function () {
            updateContacts(reqbody, userid);
            updateSkills(reqbody, userid);
            cb('nice');
        })
        .catch(function (err) {
        });
}
function updateContacts(data, id){
    for (var i=0; i<data.contacts.length; i++){
        data.contacts[i][0] = parseInt(data.contacts[i][0]);
        if(!isNaN(data.contacts[i][0])){
            db.none('UPDATE contacts SET type=$1, contacts_data=$2 WHERE contacts.id = $3',
                [data.contacts[i][1], data.contacts[i][2], data.contacts[i][0]])
                .then(function (){
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        else {
            db.none('INSERT INTO contacts(type, contacts_data, competitor_id)' +
                    'VALUES ($1, $2, $3)',
                [data.contacts[i][1], data.contacts[i][2], id])
                .then(function () {
                })
                .catch(function (err) {
                });
        }
    }
}
function updateSkills(data, id){
    for (var i=0; i<data.skillname.length; i++){
        data.skillname[i][0] = parseInt(data.skillname[i][0]);
        data.skillname[i][2] = parseInt(data.skillname[i][2]);
        if(!isNaN(data.skillname[i][0])){
            db.one('UPDATE skills SET name=$1, number=$2 WHERE skills.id = $3',
                [data.skillname[i][1], data.skillname[i][2], data.skillname[i][0]])
                .then(function (data){
                    console.log('ответ ' + data)
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        else {
            db.none('INSERT INTO skills(name, number, competitor_id)' +
                    'VALUES ($1, $2, $3)',
                [data.skillname[i][1], data.skillname[i][2], id])
                .then(function () {
                })
                .catch(function (err) {
                });
        }
    }
}
/******Cascad delete****/
function removeUser(pupID, cb) {
    db.result('delete from competitors where id = $1', pupID)
        .then(function (result) {
            cb(result);
        })
        .catch(function (err) {
        });
}
function insertContact(reqbody, data){
    for (var i=0;i<reqbody.contacts.length;i++){
        db.none('INSERT INTO contacts(type, contacts_data, competitor_id)' +
                'VALUES ($1, $2, $3)',
            [reqbody.contacts[i][1], reqbody.contacts[i][2], Object.values(data)[0]])
            .then(function () {
            })
            .catch(function (err) {
            });
    }
}
function insertSkills(reqbody, data){
    for (var i=0;i<reqbody.skillname.length;i++){
        db.none('INSERT INTO skills(name, number, competitor_id)' +
                'VALUES ($1, $2, $3)',
            [reqbody.skillname[i][1], reqbody.skillname[i][2], Object.values(data)[0]])
            .then(function () {
            })
            .catch(function (err) {
            });
    }
}
function getSkillNames (cb){
    db.any('SELECT DISTINCT name AS skillnames FROM skills')
        .then(function (data) {
            cb(data);
        })
        .catch(function (err) {
        });
}
function getContactNames (cb){
    db.any('SELECT DISTINCT type AS types FROM contacts')
        .then(function (data) {
            cb(data);
        })
        .catch(function (err) {
        });
}
function createTabales(cb){
    db.none('CREATE TABLE competitors( '+
        'fio character varying(250), '+
        'datein date,dateinterview date,'+
        'id serial NOT NULL, CONSTRAINT pk_add_id PRIMARY KEY (id)) '+
    'WITH (OIDS=FALSE); '+
    'ALTER TABLE competitors '+
    'OWNER TO postgres;'
    )
        .then(function(res){
            db.none('CREATE TABLE contacts(id serial NOT NULL,' +
                'type character varying(50),contacts_data character ' +
                'varying(50),competitor_id integer,CONSTRAINT pk_contacts_id ' +
                'PRIMARY KEY (id),CONSTRAINT fk_competitors_contacts_id' +
                ' FOREIGN KEY (competitor_id REFERENCES competitors (id) ' +
                'MATCH SIMPLEON UPDATE CASCADE ON DELETE CASCADE)' +
                'WITH (OIDS=FALSE);ALTER TABLE contactsOWNER TO postgres;'
            )
            then(
                db.none('CREATE TABLE skills '+
                '(id serial NOT NULL, '+
                'name character varying(250), '+
                '"number" integer, '+
                'competitor_id integer, '+
                'CONSTRAINT pk_skill_id PRIMARY KEY (id), '+
                'CONSTRAINT fk_competitors_skills_id FOREIGN KEY (competitor_id) '+
            'REFERENCES competitors (id) MATCH SIMPLE '+
            'ON UPDATE CASCADE ON DELETE CASCADE '+
           ' )WITH (OIDS=FALSE);'+
            'ALTER TABLE skills OWNER TO postgres; '+
           ' GRANT ALL ON TABLE skills TO postgres; '+
            'GRANT DELETE, REFERENCES ON TABLE skills TO public;')
            );

        })
        .catch(function(err){

        });
}
module.exports = {
    selectAllUsers: getAllUsers,
    getSingleUser: getSingleUser,
    getSearchUsers: getSearchUsers,
    createUser: createUser,
    updateUser: updateUser,
    removeUser: removeUser,
    getContactNames: getContactNames,
    getSkillNames: getSkillNames,
    getCountUsers: getCountUsers,
    createTabales: createTabales
};