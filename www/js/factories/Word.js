angular.module('Storage')
	.run(['DB', function(DB) {
	DB.requestDB().then(function(db) {	
		/**db.query(
			db.QUERY,
			"DROP TABLE words"
		);*/
		db.query(
			db.CREATE_TABLE,
			'words', {
				id: [
					"INTEGER", 
					"NOT NULL", 
					"PRIMARY KEY",
					"AUTOINCREMENT"
				],
				vocabulary: [
					"int",
					"NOT NULL"
				],
				text: [
					"varchar(255)",
				]
		});
	});
}]);

angular.module('SammiChat')
	.factory('Word', ['DB', '$q', function(DB, $q) {
	var Word = function(options) {
		angular.extend(this, options);
	}	

	Word.prototype.isNew = true;

	Word.prototype.save = function() {
		var _this = this;
	
		DB.requestDB().then(function(db) {
			var q = _this.isNew
				? db.query(db.INSERT, 'words', {
					vocabulary: _this.vocabulary,
					text: _this.text})
				: db.query(db.UPDATE, 'words', {
					vocabulary: _this.vocabulary,
					text: _this.text}, {
					id: _this.id});

			function onSuccess(tx, results) {
				if(results.insertId) {
					_this.id = results.insertId;
				}
			}

			function onError(e) {
				console.log(e);
			}

			q.then(onSuccess, onError);
		});
	};

	Word.prototype.delete = function() {
		var _this = this;

		DB.requestDB().then(function(db) {
			function onSuccess() {
				// Add success stuff here
			}

			function onError(err) {
				console.log(err);
			}

			db.query(db.DELETE, 'words', { id: _this.id })
				.then(onSuccess, onError);
		});
	};

	Word.query = function(query) {
		var filter = ""
		  , _this  = this
		  , d      = $q.defer();

		DB.requestDB().then(function(db) {
			var q = query 
					? db.query(db.SELECT, 'words', null, query)
					: db.query(db.SELECT, 'words');

			function onSuccess(tx, results) {
				var buffer = [];

				for(var i = 0; i < results.rows.length; i++) {
					buffer.push(new Word(results.rows.item(i)));
				}

				d.resolve(buffer);
			}

			function onError(tx, err) { 
				console.log(err);
			}

			q.then(onSuccess, onError);
		});

		return d.promise;
	};

	return Word;
}]);
