# angular-chromecast-sender-video

## Usage

```javascript
	angular.module('myapp', ['vaneves.chromecast-sender-video'])
	angular.constant('RECEIVER_APP_ID', 'MY_PLAYER_ID'); //use null to default player
```

```javascript
	angular.controller('MyCtrl', function ($scope, ChromecastSenderVideo) {
		$scope.connect = function () {
			ChromecastSenderVideo.init();
		};

		$scope.close = function () {
			ChromecastSenderVideo.close();
		};

		$scope.load = function(video) {
			ChromecastSenderVideo.load(video.url, video.title, video.image);
		};

		$scope.resume = function() {
			if(ChromecastSenderVideo.isPlaying()) {
				ChromecastSenderVideo.pause();
			} else {
				ChromecastSenderVideo.play();
			}
		};

		$scope.stop = function () {
			GoogleChromecast.stop();
		};

		$scope.back = function (seconds) {
			var position = $scope.timer.estimated - seconds;
			GoogleChromecast.seek(position);
		};

		//events
		GoogleChromecast.on('connect', function () {
			//on connect
		});
		GoogleChromecast.on('close', function () {
			//on close
		});

		$scope.timer = {
			estimated: 0, //current time in seconds
			duration: 0, //total time in seconds
			percentage: 0 //current time in percent
		}
		GoogleChromecast.on('timer', function (timer) {
			$scope.timer = timer;
			//on update video timer
		});

		GoogleChromecast.on('error', function (e) {
			console.log('error:', e);
			//on error
		});
		GoogleChromecast.on('init', function () {
			//on init
		});

		GoogleChromecast.on('load', function () {
			//on video load
		});
		GoogleChromecast.on('play', function () {
			//on play
		});
		GoogleChromecast.on('pause', function () {
			//on pause
		});
		GoogleChromecast.on('stop', function () {
			//on stop
		});
		GoogleChromecast.on('seek', function () {
			//on seek time
		});
	});
```