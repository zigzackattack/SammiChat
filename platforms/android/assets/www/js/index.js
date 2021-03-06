var app = angular.module('SammiApp', ['ngRoute', 'ionic', 'ionic.ui.sideMenu']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/instructions.html',
			controller: 'WordsCtrl'
		})
		.when('/:vocabId', {
			templateUrl: 'views/words.html',
			controller: 'WordsCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});	
});

app.run(function($rootScope, DB, Speak) {
	DB.initialize();
	Speak.initialize();
});

app.directive('ngEnter', function () {
	return {
		link: function (scope, elements, attrs) {
			elements.bind('keydown keypress', function (event) {
				if (event.which === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.ngEnter);
					});
					event.preventDefault();
				}
			});
		}
	};
});

app.controller('WordsCtrl', function($scope, $routeParams, $rootScope, Word, Category, Speak) {
	Category.queryOne({id:$routeParams.vocabId})
		.then(function(cat) {
			$scope.category = cat;
		});	

	$scope.newWord = new Word();

	$scope.noCategory = !!$routeParams.vocabId;

	$scope.load = function() {
		if(!$scope.category) return;
		$scope.words = [];

		$scope.hide = false;
		Word.query({
				category: $scope.category.id
			})
			.then(function(words) {
				$scope.words = words; 
			}); 
	};

	$scope.$watch('category', $scope.load);

	$scope.clear = function() {
		$scope.words.forEach(function(word) {
			word.delete();
		});
	};

	$scope.refresh = function() {
		console.log(arguments);
	};

	$scope.saveWord = function(word) {
		if(!word.text) return;

		if(word.isNew) {
			word.category = $scope.category.id;
			$scope.words.push(word);
		}

		word.save();
		$scope.newWord = new Word();
	};

	$rootScope.currentStatement = "";

	$scope.selectWord = function(word) {
		if(!word.active) {
			$rootScope.currentStatement += word.text + ' ';
			Speak.request()
				.then(function(say) {
				say(word.text);
			});
			word.active = true;
		}
	};

	$scope.reset = function() {
		$rootScope.currentStatement = "";
		$scope.words.forEach(function(word) {
			word.active = false;
		});
	};

	$scope.deleteWord = function(word) {
		var ind = $scope.words.indexOf(word);

		word.delete();
		$scope.words.splice(ind, 1);
	};

	$scope.itemButtons = [
    {
      text: 'Edit',
      type: 'button-calm',
      onTap: function(word) {
		$scope.newWord = angular.copy(word);
		$scope.deleteWord(word);
      }
    },
    {
      text: 'Delete',
      type: 'button-assertive',
      onTap: $scope.deleteWord 
    }
  ];

	$scope.toggleMenu = function() {
		 $scope.sideMenuController.toggleLeft();
	};
});

app.controller('CategoryCtrl', function($scope, Category, $location) {
	$scope.newCategory = new Category();

	Category.query()
		.then(function(data) {
			$scope.categories = data;
		});

	$scope.setCategory = function(cat) {
		$location.path('/' + cat.id);
	};

	$scope.saveCategory = function(cat) {
		if(!cat.label) return;
		$scope.categories.push(cat);
		$scope.newCategory = new Category();	
		cat.save();
	};


	$scope.deleteCategory = function(cat) {
		console.log(cat);
		var ind = $scope.categories.indexOf(cat);
		console.log(ind);
		$scope.categories.splice(ind, 1);
		cat.delete();
	};

	$scope.editCategory = function(cat) {
		$scope.newCategory = angular.copy(cat);
		$scope.deleteCategory(cat);
	};

	$scope.btns = [
    {
      text: 'Edit',
      type: 'button-calm',
      onTap: $scope.editCategory 
    },
    {
      text: 'Delete',
      type: 'button-assertive',
      onTap: $scope.deleteCategory 
    }
  ];

});
