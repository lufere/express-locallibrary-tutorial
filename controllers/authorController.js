var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function(req, res, next){
    Author.find()
        .populate('author')
        .sort([['family_name', 'ascending']])
        .exec(function(err, list_authors){
            if (err) {return next(err)}
            res.render('author_list',{title: 'Author list', author_list: list_authors});
        });
};

// Display detail page for a specific Author.
exports.author_detail = function(req,res,next){
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) {
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {
    res.render('author_form', {title: 'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({min:1}).trim().withMessage('Family name must be specified')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy:true}).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy:true}).isISO8601(),

    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    function(req, res, next) {
        const errors = validationResult(req);
        var author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });

        if(!errors.isEmpty()){
            res.render('author_form',{title: 'Create Author', author: author, errors: errors.array()});
            return;            
        }
        else{

            author.save(function(err){
                if(err) {return next(err);}
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback)
        },
        author_books: function(callback){
            Book.find({'author': req.params.id}).exec(callback)
        },
    },
    function(err, results){
        if(err) {return next(err)}
        if (results.author==null){
            res.redirect('/catalog/authors');
        }
        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books:results.author_books});
    });
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author:function(callback){
            Author.findById(req.body.authorid).exec(callback)
        },
        author_books:function(callback){
            Book.find({'author': req.body.authorid}).exec(callback)
        }
    }, function(err, results){
        if(err){return next(err);}
        if(results.author_books.length > 0){
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books});
            return;
        }
        else{
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err){
                if(err) {return next(err);}
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {
    Author.findById(req.params.id).exec(function(err, author){
        if(err){return next(err)}
        res.render('author_form', {title: 'Author Update', author: author})
    })
};

// Handle Author update on POST.
exports.author_update_post = [
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({min:1}).trim().withMessage('Family name must be specified')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy:true}).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy:true}).isISO8601(),

    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    function(req, res, next) {
        const errors = validationResult(req);
        var author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id
        });

        if(!errors.isEmpty()){
            res.render('author_form',{title: 'Create Author', author: author, errors: errors.array()});
            return;            
        }
        else{
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor){
                if(err){return next(err)}
                res.redirect(theauthor.url);
            })
        }
    }
];