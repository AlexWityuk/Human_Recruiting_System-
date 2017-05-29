app.controller('updateController', ['$scope','$http','$routeParams','$location',
    function ($scope, $http, $routeParams, $location) {

    var id = $routeParams.userId;

    id = parseInt(id);

    $http.get('/user/'+id)
        .success(function(result){
            $scope.datauser = result.user;
            $scope.userContactTypes = result.userContactTypes;
            $scope.userSkillNames = result.userSkillNames;
            $scope.regex = /^[a-zA-Z0-9а-яА-Я]*$/;
            $scope.modelSelectSkillNames=$scope.userSkillNames[1];
            for (i = 0; i < $scope.datauser.skillname.length; i++) {
                $scope.datauser.skillname[i][2] = parseInt($scope.datauser.skillname[i][2]);
                console.log(typeof $scope.datauser.skillname[i][2]);
            }
            $scope.modelForm = {
                Nameupdate: $scope.datauser.fio[0],
                Familyupdate: $scope.datauser.fio[1],
                contacts: $scope.datauser.contacts,
                skillname: $scope.datauser.skillname
            };
        })
        .error(function(response){
            console.log('Error: ' + forSingleUser);
        });
    $scope.submitForm = function(){
        var id = $('input[name=userid]').val();
        id = parseInt(id);
        console.log($scope.modelForm);
        $http({
            method  : 'PUT',
            url     : '/users/'+ id,
            data:  this.modelForm,
            headers : { 'Content-Type': 'application/json' }
        })
            .success(function(data, status) {
                alert('Обновление успешно завершено.');
                $location.path('/home.html');
            })
            .error(function(data){
                console.log('Error: ' + data);
            });
    }
    $scope.addContact = function(){
        var type = angular.element('#select_type_contact').val();
        $scope.datauser.contacts.push(['', type,'']);
    }
    $scope.deletContact = function(index){
        if ($scope.datauser.contacts[index][0].length == 0){
            this.datauser.contacts.splice(index, 1);
        }
    }
    $scope.addSkill = function(){
        $scope.datauser.skillname.push(['', this.modelSelectSkillNames.skillnames,'']);
    }
    $scope.deletSkill = function(index){
        if ($scope.datauser.skillname[index][0].length === 0){
            this.datauser.skillname.splice(index, 1);
        }
    }
}]);
