var mongoose = require('mongoose');
const router = require('../routes');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

// Virtual for author's lifespan
AuthorSchema
.virtual('name')
.get(function(){
    var fullname = '';
    if(this.first_name && this.family_name){
        fullname = this.family_name + ', ' + this.first_name;
    }
    if(!this.first_name || !this.family_name){
        fullname = '';
    }
    
    return fullname;
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
  return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);