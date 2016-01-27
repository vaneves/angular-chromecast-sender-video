var angularChromecast = angular.module('vaneves.chromecast-sender-video', []);

angularChromecast.factory('ChromecastSenderVideo', function ($interval, RECEIVER_APP_ID) {
	
	var session = null;
	var currentMedia = null;

	function initializeCastApi () {
		if(RECEIVER_APP_ID === null) {
			RECEIVER_APP_ID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
		}
		var sessionRequest = new chrome.cast.SessionRequest(RECEIVER_APP_ID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
		chrome.cast.initialize(apiConfig, getEvent('init'), getEvent('error'));
	};

	function sessionListener (e) {
		session = e;
	}

	function receiverListener (e) {
		if(e === chrome.cast.ReceiverAvailability.AVAILABLE) {
			chrome.cast.requestSession(getEvent('connect'), getEvent('error'));
		}
	}

	function onMediaDiscovered(how, media) {
		currentMedia = media;
		getEvent('load').bind(this);
	}

	var queue = {
		index: 0,
		items: []
	};
	var events = [];

	function getEvent(event) {
		if(typeof events[event] !== 'undefined') {
			return events[event];
		}
		return function () {};
	}

	return {
		init: function () {
			initializeCastApi();
		},
		load: function (url, title, image) {
			if(session === null) {
				console.log('!session')
				return;
			}
			var mediaInfo = new chrome.cast.media.MediaInfo(url);
			mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
			mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
			mediaInfo.contentType = 'video/mp4';

			if(typeof title !== 'undefined') {
				mediaInfo.metadata.title =  title;
			}
			if(typeof image !== 'undefined') {
				mediaInfo.metadata.images = [{url: image}];
			}

			var request = new chrome.cast.media.LoadRequest(mediaInfo);
			request.autoplay = true;
			request.currentTime = 0;

			session.loadMedia(request, onMediaDiscovered.bind(this, 'load'), getEvent('error'));

			$interval(function () {
				if (session === null || currentMedia === null) {
					return;
				}
				var estimated = currentMedia.getEstimatedTime();
				var percentage = parseInt(100 * estimated / currentMedia.media.duration);

				var timer = {
					percentage: percentage,
					estimated: estimated,
					duration: currentMedia.media.duration
				};
				getEvent('timer').apply(this, [timer]);
			}, 1000);
		},
		add: function (url, title, image) {
			queue.items.push({
				url: url,
				title: title,
				image: image
			});
		},
		remove: function (index) {
			if(queue.items.indeOf(index) != -1) {
				queue.items.splice(index, 1);
			}
		},
		next: function () {
			if(queue.index < queue.items.length - 1) {
				queue.index++;
			} else {
				queue.index = 0;
			}
		},
		prev: function () {
			if(queue.index > 0) {
				queue.index--;
			} else {
				queue.index = queue.items.length - 1;
			}
		},
		play: function () {
			if(!session || !currentMedia) {
				return;
			}
			currentMedia.play(null, getEvent('play'), getEvent('error'));
		},
		pause: function () {
			if(!session || !currentMedia) {
				return;
			}
			currentMedia.pause(null, getEvent('pause'), getEvent('error'));
		},
		stop: function () {
			if(!session || !currentMedia) {
				return;
			}
			currentMedia.stop(null, getEvent('stop'), getEvent('error'));
		}, 
		on: function (event, action) {
			events[event] = action;
		}, 
		close: function () {
			session.stop(getEvent('close'), getEvent('error'));
		},
		isConnected: function () {
			return session != null;
		},
		isPlaying: function () {
			return currentMedia.playerState && currentMedia.playerState == 'PLAYING';
		},
		seek: function (position) {
			if(position < 0) {
				position = 0;
			}
			if(position > currentMedia.media.duration) {
				position = currentMedia.media.duration;
			}
			var request = new chrome.cast.media.SeekRequest();
			request.currentTime = position;
			currentMedia.seek(request, getEvent('seek'), getEvent('error'));
		},
		seekPercentage: function (position) {
			if(position < 0) {
				position = 0;
			}
			if(position >= 100) {
				position = 100;
			}
			var request = new chrome.cast.media.SeekRequest();
			request.currentTime = position * currentMedia.media.duration / 100;
			currentMedia.seek(request, getEvent('seek'), getEvent('error'));
		}
	}
});
