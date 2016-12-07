var express = require('express');
var app = express();
var mongoJs = require('mongoJs');
var ObjectId = require('mongodb').ObjectId;
var db = mongoJs('support_system', ['Users', 'userQueries', 'Conversation']);
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

app.use(express.static(__dirname + '/public'));

//get user data for login form...
app.post('/loginUser', function (req, res) {
    var data = JSON.parse(req.query.data);
    db.Users.find({
        user_name: data.username,
        password: data.password
    }, function (err, docs) {
        if (err) console.log("error: " + err);
        else {
            res.send(docs);
        }
    })
})

//post a new user in user table...
app.post('/addUser', function (req, res) {
    var data = JSON.parse(req.query.data);
    db.Users.insert(data, function (err, doc) {
        if (err) throw err;
        else
            res.send(200);
    })
}); //end of ADDUser

//add a User query...
app.post('/addNewQuery', function (req, res) {
    var data = JSON.parse(req.query.data);
    db.userQueries.insert(data, function (err, doc) {
        if (err) throw err;
        else {
            res.send(200);
        }
    })
}); //end of add NewQuery...

app.get('/getQueryByUser/:user_name', function (req, res) {
    var user = req.params.user_name;
    db.userQueries.find({
        "user_name": user
    }, function (err, docs) {
        if (err) console.log("error: " + err);
        else {
            res.send(docs);
        }
    })
});


// get query detail by Id
app.get('/getQueryById/:queryId', function (req, res) {
    var queryId = req.params.queryId;
    db.userQueries.find(ObjectId(queryId), function (err, docs) {
        if (err) console.log("error: " + err);
        else {
            res.send(docs);
        }
    })
});

//get Query by username and id both...
app.get('/getQueryByUserId/:user/:id', function (req, res) {
        var username = req.params.user;
        var queryId = req.params.id;
        db.userQueries.find({
            _id: ObjectId(queryId),
            user_name: username
        }, function (err, docs) {
            if (err) console.log("error: " + err);
            else {
                res.send(docs);
            }
        })
    }) //end of getAllQueries...


//get all User Queries...
app.get('/getAllQueries', function (req, res) {
        db.userQueries.find(function (err, docs) {
            if (err) console.log("error: " + err);
            else {
                res.send(docs);
            }
        })
    }) //end of getAllQueries...

//post Conversation in db
app.post('/addConversation', function (req, res) {
    var data = JSON.parse(req.query.data);
    db.Conversation.insert(data, function (err, doc) {
        if (err) throw err;
        else {
            res.send(200);
        }
    });
})


app.get('/getConversationById/:queryId', function (req, res) {
    var id = req.params.queryId;
    db.Conversation.find({
        queryId: id
    }, function (err, docs) {
        if (err) console.log("error: " + err);
        else {
            res.send(docs);
        }
    })

})

app.post('/sendGuestEmail', function (req, res) {
    var data = JSON.parse(req.query.data);

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(smtpTransport({
        host: "localhost", // hostname
        secure: false, // use SSL
        port: 3000, // port for secure SMTP
        service: 'gmail',
        auth: {
            user: 'baigny@gmail.com',
            pass: '13nyb89baig'
        },
        tls: {
            rejectUnauthorized: false
        }
    }));

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'baigny@gmail.com', // sender address
        to: 'baigny@gmail.com', // list of receivers
        subject: 'Guest mail from support_system ✔', // Subject line
        text: 'test upgrde nodemailer subject', // plaintext body
        html: '<h4>Contact : ' + data.querySub + '</h4>' +
            '<h4>Name : ' + data.name + '</h4>' +
            '<h4>Email : ' + data.email + '</h4>' +
            '<h4>Contact : ' + data.phone + '</h4>' +
            '<h4>Message : </h4><p>' + data.query + '</p>' //html body ends...
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        res.send(200);
    });

})

//update the status of queries...
app.get('/updateStatus/:queryId/:status', function (req, res) {
    var id = req.params.queryId;
    var status_value = req.params.status;

    db.userQueries.update({
        _id: ObjectId(id)
    }, {
        $set: {
            status: status_value
        }
    }, {
        multi: true
    }, function (err, docs) {
        if (err) console.log(err);
        else
            console.log(docs);
    });
});

app.post('/editUserQueries', function (req, res) {
    var data = JSON.parse(req.query.data);

    db.userQueries.update({
        _id: ObjectId(data.queryId)
    }, {
        $set: {
            querySub: data.querySub,
            query : data.query
        }
    },function (err, docs) {
        if (err) console.log(err);
        else
            res.send(200);
    });
});

app.get('/deleteUserQueries/:id', function (req, res) {
    var id=req.params.id;
  db.userQueries.remove({_id: ObjectId(id)},
      function(err,docs){
          if (err) console.log(err);
        else
            res.send(200);
      });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})