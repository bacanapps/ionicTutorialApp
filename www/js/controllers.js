angular.module('blogin.controllers', [])

.controller('CategoriesCtrl', ['$scope', '$ionicLoading', 'Categories', function($scope, $ionicLoading, Categories) {
  $ionicLoading.show();

  Categories.all().then(function(data) {
    $ionicLoading.hide();

    $scope.categories = data;
  }, function(error) {
    $ionicLoading.hide();
    console.log(error);
  });
}])

.controller('CategoryCtrl', ['$scope', '$stateParams', 'Categories', function($scope, $stateParams, Categories) {
  $scope.page = 0;
  $scope.articles = [];
  $scope.category = false;
  $scope.morePageExist = true;

  $scope.loadMore = function() {
    Categories.get($stateParams.catId, $scope.page).then(function(data) {
      var length = data.length;

      if(!$scope.category) {
        $scope.category = data[0];
      }

      if(length > 0) {
        $scope.articles = $scope.articles.concat(data);
        $scope.page++;

        if(length < 10) {
          $scope.morePageExist = false;
        }
      }
      else {
        $scope.morePageExist = false;
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, function(error) {
      console.log(error);
    });
  };
}])

.controller('ArticlesCtrl', ['$scope', 'Articles', function($scope, Articles) {
  $scope.page = 0;
  $scope.articles = [];
  $scope.morePageExist = true;

  $scope.loadMore = function() {
    Articles.all($scope.page).then(function(data) {
      var length = data.length;

      if(length > 0) {
        $scope.articles = $scope.articles.concat(data);
        $scope.page++;

        if(length < 10) {
          $scope.morePageExist = false;
        }
      }
      else {
        $scope.morePageExist = false;
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, function(error) {
      console.log(error);
    });
  };
}])

.controller('ArticleDetailCtrl', ['$scope', '$stateParams', '$ionicLoading', 'Articles', function($scope, $stateParams, $ionicLoading, Articles) {
  $ionicLoading.show();

  Articles.get($stateParams.articleId).then(function(data) {
    $ionicLoading.hide();

    $scope.article = data[0];
  }, function(error) {
    $ionicLoading.hide();
    console.log(error);
  });
}])

.controller('LoginCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicModal', 'storage', 'config', 'User', function($rootScope, $scope, $ionicLoading, $ionicModal, storage, config, User) {
  $scope.loginData = {};
  $scope.loginError = false;
  $rootScope.token = storage.get(config.localStoragePrefix + 'token') || false;
  $rootScope.userData = storage.get(config.localStoragePrefix + 'user') || {};
  $rootScope.loginSuccess = ($rootScope.token) ? true : false;

  // Init ionicModal
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $rootScope.showLogin = function() {
    $scope.modal.show();
  };

  $rootScope.doLogout = function() {
    $ionicLoading.show();

    User.logout($rootScope.token).then(function() {
      $rootScope.loginSuccess = false;
      $scope.loginData = {};
      $scope.loginError = false;

      User.removeUserData();

      $ionicLoading.hide();
    }, function(error) {
      $ionicLoading.hide();
      console.log(error);
    });
  };

  $scope.doLogin = function() {
    $ionicLoading.show();

    User.getSessionToken().then(function(data) {
      $rootScope.token = data;

      User.login($scope.loginData.username, $scope.loginData.password, $rootScope.token).then(function(data) {
        $ionicLoading.hide();

        $scope.loginError = false;
        $rootScope.loginSuccess = true;
        User.setUserData(data.user, data.token);

        $scope.modal.hide();
      }, function(error) {
        $ionicLoading.hide();
        $scope.loginError = error;
      });
    }, function(error) {
      $ionicLoading.hide();
      console.log(error);
    });
  };

}])

.controller('RegisterCtrl', ['$rootScope', '$scope', '$ionicLoading', '$ionicModal', 'storage', 'config', 'User', function($rootScope, $scope, $ionicLoading, $ionicModal, storage, config, User) {
  $scope.registerData = {};
  $scope.registerError = false;

  // Init ionicModal
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeRegister = function() {
    $scope.modal.hide();
  };

  $rootScope.openRegister = function() {
    $scope.modal.show();
  };

  $scope.doRegistration = function() {
    $ionicLoading.show();

    User.register($scope.registerData).then(function(data) {
      $scope.registerError = false;
      $scope.closeRegister();

      User.getSessionToken().then(function(data) {
        $rootScope.token = data;

        User.login($scope.registerData.username, $scope.registerData.password, $rootScope.token).then(function(data) {
          $ionicLoading.hide();

          $rootScope.loginSuccess = true;
          User.setUserData(data.user, data.token);

          $scope.modal.hide();
        }, function(error) {
          $ionicLoading.hide();
          console.log(error);
        });
      }, function(error) {
        $ionicLoading.hide();
        console.log(error);
      });
    }, function(error) {
      $ionicLoading.hide();
      $scope.registerError = error.form_errors;
    });
  }

}]);