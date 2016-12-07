var app = angular.module('supports', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ui.bootstrap']);

app.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
    when('/main', {
      templateUrl: 'View/main.html',
      controller: 'main-ctrl as $ctrl'
    }).
    when('/user', {
      templateUrl: 'View/user.html',
      controller: 'user-ctrl as $ctrl'
    }).
    when('/admin', {
      templateUrl: 'View/admin.html',
      controller: 'admin-ctrl as $ctrl'
    }).
    when('/detail-user/:queryId', {
      templateUrl: 'View/detail-user.html',
      controller: 'detail-user-ctrl as $ctrl'
    }).
    when('/detail-admin/:username/:id', {
      templateUrl: 'View/detail-admin.html',
      controller: 'detail-admin-ctrl as $ctrl'
    }).
    otherwise({
      redirectTo: '/main'
    });
  }
]);

//service for keeping user name during the session...
app.service('keepUser', function ($window) {
  var user_name;
  this.setUser = function (user) {
    $window.sessionStorage.setItem("user_name", JSON.stringify(user));
  }

  this.getUser = function () {
    user_name = $window.sessionStorage.getItem("user_name");
    var user_name = user_name.slice(1, -1);
    return user_name;
  }
});

//main page controller...(main-ctrl)
app.controller('main-ctrl', function ($uibModal, $log, $document, $scope, $http, $timeout) {
  $scope.success = false;
  $scope.submitGuestForm = function (guest) {
    httpConfig = {},
      httpProperties = {
        url: '/sendGuestEmail',
        config: httpConfig,
        method: 'post',
        params: {
          data: guest
        }
      };
    $http(httpProperties).success(function (response) {
      $scope.success = true;
      console.log("Email successfully send..!");
      $timeout(function () {
        $scope.success = false;
      }, 2000);
    }).error(function (err, status) {
      console.log(err);
    });
  }

  //signUp model Setting on index.html
  var $ctrl = this;
  $ctrl.animationsEnabled = true;
  $ctrl.open = function (size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'signUpModelContent.html',
        controller: 'signUpModelController',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {}
      });
    } //end of open function...
});

//********************************************************************end of main controller*****************************************************************************************************
//********************************************************************end of main controller*****************************************************************************************************


//modal controller for signUp on index.html...
app.controller('signUpModelController', function ($uibModalInstance, $scope, $http, keepUser, $location) {
  $scope.error = false;
  //login function...
  $scope.submit_login_form = function (signin_detail) {
    httpConfig = {},
      httpProperties = {
        url: '/loginUser',
        config: httpConfig,
        method: 'post',
        params: {
          data: signin_detail
        }
      };
    $http(httpProperties).success(function (response) {
      // console.log(response)
      if (response.length > 0) {
        keepUser.setUser(response[0].user_name);
        if (response[0].user_type == 'user')
          $location.path('/user');
        else if (response[0].user_type == 'admin')
          $location.path('/admin');
      } else {
        $scope.error = true;
        console.log("Wrong email or password...!")
      }

      $uibModalInstance.dismiss('cancel');
    }).error(function (err, status) {
      console.log(err);
    });
  }


  //signup a new user...
  $scope.submitsignUpForm = function (signup_detail) {
    signup_detail.user_type = 'user';
    httpConfig = {},
      httpProperties = {
        url: '/addUser',
        config: httpConfig,
        method: 'post',
        params: {
          data: signup_detail
        }
      };
    $http(httpProperties).success(function (response) {
      console.log(response);
      $uibModalInstance.dismiss('cancel');
    }).error(function (err, status) {
      console.log(err);
      $uibModalInstance.dismiss('cancel');
    });
  }

  var $ctrl = this;
  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

//********************************************************************end of signUp or login controller*****************************************************************************************************
//********************************************************************end of  signUp or login controller*****************************************************************************************************

//user controller...
app.controller('user-ctrl', function ($scope, $uibModal, $log, $document, $http, keepUser) {
  refreshQueryData();
  //get all queries of current user...
  function refreshQueryData() {
    var user = keepUser.getUser();
    $http.get('/getQueryByUser/' + user).then(function (responce) {
      $scope.Data = responce.data;
    });
  }
  //submit a new ticket.............
  var $ctrl = this;
  $ctrl.animationsEnabled = true;
  //open modal for submit  new ticket...
  $ctrl.open = function (size, parentSelector) {
    var parentElem = parentSelector ?
      angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'ctrlModelContent.html',
      controller: 'submitNewTicket-ctrl',
      controllerAs: '$ctrl',
      size: size,
      appendTo: parentElem,
      resolve: {}
    });
  }

  //edit button function...
  $scope.editQuery = function (id, size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'userEditCtrl.html',
        controller: 'userEdit-ctrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          id: function () {
            return id;
          }
        }
      });
    }
    //delete button function...
  $scope.deleteQuery = function (id) {
    $http.get('/deleteUserQueries/' + id).then(function (responce) {
      $scope.Data = responce.data;
      refreshQueryData();
    });
  }
});

app.controller('submitNewTicket-ctrl', function ($uibModalInstance, $scope, $http, keepUser) {
  var $ctrl = this;
  var user = keepUser.getUser();
  $scope.submitNewTicket = function (newQuery) {
    newQuery.user_name = user;
    newQuery.status = "Pending";
    httpConfig = {},
      httpProperties = {
        url: '/addNewQuery',
        config: httpConfig,
        method: 'post',
        params: {
          data: newQuery
        }
      };
    $http(httpProperties).success(function (response) {
      console.log(response);
      $uibModalInstance.dismiss('cancel');
    }).error(function (err, status) {
      console.log(err);
      $uibModalInstance.dismiss('cancel');
    });
  }

  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


app.controller('userEdit-ctrl', function (id, $uibModalInstance, $scope, $http, keepUser) {
  var $ctrl = this;
  var data;
  var user = keepUser.getUser();
  $scope.edit = function (edit_data) {
    edit_data.queryId = id;
    httpConfig = {},
      httpProperties = {
        url: '/editUserQueries',
        config: httpConfig,
        method: 'post',
        params: {
          data: edit_data
        }
      };
    $http(httpProperties).success(function (response) {
      console.log("Data successfully edited...");
      $uibModalInstance.dismiss('cancel');
    }).error(function (err, status) {
      console.log(err);
      $uibModalInstance.dismiss('cancel');
    });
  }
});
//********************************************************************end of submitNewTicket-ctrl controller*****************************************************************************************************
//********************************************************************end of  user-ctrl or login controller*****************************************************************************************************

// detail user controller
app.controller('detail-user-ctrl', function ($scope, $http, keepUser, $uibModal, $log, $document, $routeParams) {
  var queryId = $routeParams.queryId;
  $http.get('/getQueryById/' + queryId).then(function (responce) {
    $scope.Data = responce.data[0];
  });

  $http.get('/getConversationById/' + queryId).then(function (responce) {
    $scope.conversation = responce.data;
  });


  // detail modal setting
  var $ctrl = this;
  $ctrl.animationsEnabled = true;

  $ctrl.open = function (queryId, size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detailModelContent.html',
        controller: 'ModelDetailUserCtrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          queryId: function () {
            return queryId
          }
        }
      });
    } //end of modal...
});

app.controller('ModelDetailUserCtrl', function ($uibModalInstance, queryId, $scope, $http, keepUser) {
  var $ctrl = this;
  var user_name = keepUser.getUser();
  var user_type = 'user';
  var time = new Date();

  $scope.userConversationMsg = function (user_reply) {
    user_reply.user_name = user_name;
    user_reply.queryId = queryId;
    user_reply.time = time;
    user_reply.user_type = 'user';

    httpConfig = {},
      httpProperties = {
        url: '/addConversation',
        config: httpConfig,
        method: 'post',
        params: {
          data: user_reply
        }
      };
    $http(httpProperties).success(function (response) {
      var status_value = "Pending";
      $http.get('/updateStatus/' + queryId + '/' + status_value, function (response) {
        console.log(response);
      })

      $uibModalInstance.dismiss('cancel');
    }).error(function (err, status) {
      console.log(err);
      $uibModalInstance.dismiss('cancel');
    });

    $uibModalInstance.dismiss('cancel');
  }

  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

//********************************************************************end of detailUser-ctrl controller*****************************************************************************************************
//********************************************************************end of  detailUserModel-ctrl or login controller*****************************************************************************************************

//admin controller...
app.controller('admin-ctrl', function ($scope, $http,$uibModal, $log, $document) {
  $scope.Data;
  $http.get('/getAllQueries').then(function (responce) {
    $scope.Data = responce.data;
  });

 var $ctrl = this;
  $ctrl.animationsEnabled = true;
  //edit button function...
  $scope.editQuery = function (id, size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'adminEditCtrl.html',
        controller: 'userEdit-ctrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          id: function () {
            return id;
          }
        }
      });
    }
    //delete button function...
  $scope.deleteQuery = function (id) {
    $http.get('/deleteUserQueries/' + id).then(function (responce) {
      $scope.Data = responce.data;
      $http.get('/getAllQueries').then(function (responce) {
        $scope.Data = responce.data;
      });
    });
  }
});

//********************************************************************end of admin-ctrl controller*****************************************************************************************************
//********************************************************************end of  admin-ctrl controller*****************************************************************************************************

//detail admin cntroller...
app.controller('detail-admin-ctrl', function ($scope, $uibModal, $log, $document, $routeParams, $http) {
  var user = $routeParams.username;
  var id = $routeParams.id;
  var queryId = $routeParams.id;

  $http.get('/getConversationById/' + queryId).then(function (responce) {
    $scope.conversation = responce.data;
  });

  $http.get('/getQueryByUserId/' + user + '/' + id).then(function (responce) {
    $scope.Data = responce.data[0];
  });

  // detail modal setting
  var $ctrl = this;
  var modelData = {};
  $ctrl.animationsEnabled = true;

  $ctrl.open = function (queryId, size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'detailModelContent.html',
        controller: 'ModelDetailAdminCtrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          queryId: function () {
            return queryId;
          }
        }
      });
    } //end of modal...
});

app.controller('ModelDetailAdminCtrl', function ($uibModalInstance, queryId, keepUser, $http, $location, $scope) {
  var queryId = queryId;
  var user = keepUser.getUser();
  var time = new Date();
  var user_type = 'admin';

  $scope.adminConversationMsg = function (admin_reply) {
    admin_reply.queryId = queryId;
    admin_reply.user_name = user;
    admin_reply.time = time;
    admin_reply.user_type = user_type;

    httpConfig = {},
      httpProperties = {
        url: '/addConversation',
        config: httpConfig,
        method: 'post',
        params: {
          data: admin_reply
        }
      };
    $http(httpProperties).success(function (response) {
      console.log(response);
      $uibModalInstance.dismiss('cancel');
      var status_value = "Replied";
      $http.get('/updateStatus/' + queryId + '/' + status_value, function (response) {})
    }).error(function (err, status) {
      console.log(err);
      $uibModalInstance.dismiss('cancel');
    });
    $uibModalInstance.dismiss('cancel');
  }

  var $ctrl = this;
  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

//********************************************************************end of detail admin-ctrl controller*****************************************************************************************************
//********************************************************************end of  reply admin model ctrl controller*****************************************************************************************************