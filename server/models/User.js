const mongoose  = require ('mongoose');
const _         = require('lodash');
const validator = require('validator');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email non valide',
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }]
});

// ** Methodes d'instance **
UserSchema.methods.toJSON = function()
{
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function ()
{
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    user.tokens = user.tokens.concat([{access, token}]);
    console.log('token')

    return user.save().then( () => {
        return token;
    })
}

// ** Methode de modèle **
UserSchema.statics.findByCredentials = function(email, password)
{
    var User = this; // contexte du modele
    return User.findOne({email}).then(user => {
        if (!user)
            return Promise.reject(); // reject immédiat
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res)
                    resolve(user);
                else
                {
                    console.log(res)
                    reject("Invalid Credentials");
                }
            }); // !# bcrypt.compare
        }); // !# Promise
    }); // !# User.findOne
}

UserSchema.statics.findByToken = function (token)
{
    var User = this;
    var decoded;

    try
    {
        decoded = jwt.verify(token, 'abc123');
    }
    catch (e)
    {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth',
    })
}

// Mongoose middleware
UserSchema.pre('save', function(next) 
{
    var user = this; // context binding
    if (user.isModified('password'))
    {
        // cryptage
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else
        next();
})

var User = mongoose.model('User', UserSchema);


module.exports = { User };
