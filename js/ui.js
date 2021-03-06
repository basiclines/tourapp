// Common UI interactions

var uiHandlers = function() {


	var initSwipe = function() {
		var context = document.getElementById("canvas");
		var closeapp = document.getElementById("closeapp");
		var reloadapp = document.getElementById("reloadapp");
		var current, overlayCurrent, positionCurrent, next, overlayNext, positionNext, prev, overlayPrev, positionPrev, last, positionLast;
		var views = context.querySelectorAll(".view");

		var repeat, queueRepeat;
		var pressEvent =  ("ontouchstart" in window) ? "touchstart" : "mousedown";
		var moveEvent = ("ontouchstart" in window) ? "touchmove" : "mousemove";
		var releaseEvent = ("ontouchstart" in window) ? "touchend" :"mouseup";
		var coordinates = { init: 0, current: 0 }
		var OFFSET = 25 * (window.innerWidth/320);
		var delay = 8000;

		var autoPlay = function() {

			context.classList.add("autoplay");
			for (var i = 0; i < views.length; i++) {
				views[i].querySelector(".overlay").removeAttribute("style");
			}

			function nextSlide() {
				if (next) {
					// anonymous becomes next
					if (next.nextElementSibling) {
						next.nextElementSibling.classList.add("next");

						// Next becomes current
						next.dataset.viewport = "start";
						next.classList.remove("next");
						next.classList.add("current");
						next.addEventListener("transitionend", function endTrans() {
							refreshNodes();
							this.removeEventListener("transitionend", endTrans);
						});

						// Current becomes prev
						overlayCurrent.style.opacity = "1";
						current.classList.remove("current");
						current.classList.add("prev");

						// Prev becomes anonymous
						if (prev) {
							prev.classList.remove("prev");
						}
					} else {
						// Last slide and reload app
						reloadApp();
					}

				}
			}
			repeat = setInterval(function(){
				nextSlide();
			}, delay);
		}

		function reloadApp() {
			for (var i = 0; i < views.length; i++) {
				// Clean all
				views[i].classList.remove("prev");
				views[i].classList.remove("current");
				views[i].classList.remove("next");
				views[i].classList.remove("last");
				views[i].querySelector(".overlay").removeAttribute("style");

				// Set initial order
				if (!i == 0) {
					views[i].dataset.viewport = "end"
				} else {
					views[i].classList.add("current");
				}
				if ( i == 1 ) {
					views[i].classList.add("next");
				}
			}
			resetViews();
			refreshNodes();
		}

		function refreshNodes() {
			views = context.querySelectorAll(".view");
			current = context.querySelector(".view.current");
			if (current) {
				overlayCurrent = current.querySelector(".overlay");
				positionCurrent = current.querySelector(".position");
			}

			next = current.nextElementSibling;
			if (next) {
				overlayNext = next.querySelector(".overlay");
				positionNext = next.querySelector(".position");
			}

			prev = current.previousElementSibling;
			if (prev) {
				overlayPrev = prev.querySelector(".overlay");
				positionPrev = prev.querySelector(".position");
			}

			last = context.querySelector(".last");
			if (last) {
				positionLast = last.querySelector(".position");
			}
		}

		// Reset to default state
		function resetViews() {
			if (prev) {
				prev.classList.remove("notransition");
				prev.setAttribute("style", "");
			}
			if (next) {
				next.classList.remove("notransition");
				next.setAttribute("style", "");
			}
			current.classList.remove("notransition");
			current.setAttribute("style", "");
			if (last) {
				last.addEventListener("transitionend", function endTrans() {
					positionLast.innerHTML = ">";
					positionLast.removeAttribute("style");
					last.classList.remove("last");
					this.removeEventListener("transitionend", endTrans);
				});
			}
		}

		function move(e) {
			coordinates.current = (e.touches) ? e.touches[0].pageX : e.clientX;

			if (coordinates.init - coordinates.current >= 0) {
				// To start
				coordinates.direction = "start";
				if (next) {
					var amount = window.innerWidth - OFFSET - (coordinates.init - coordinates.current);
					next.style.transform = "translateX("+amount+"px)";
					overlayCurrent.style.background = "#000";
					overlayCurrent.style.opacity = (1.3-amount/window.innerWidth < 1) ? 1.3-amount/window.innerWidth : 1 ;
					overlayNext.style.opacity = (amount/window.innerWidth);
					positionNext.style.transform = "translateX("+((window.innerWidth-amount-1)/13)+"px)";
					positionNext.style.opacity = ((amount/2)/window.innerWidth);
				}

			} else {
				// To end
				coordinates.direction = "end";
				if (prev) {
					var amount =  coordinates.current - coordinates.init;
					current.style.transform = "translateX("+amount+"px)";
					overlayPrev.style.background = "rgba(255,255,255,0.2)";
					overlayPrev.style.opacity = (1-amount/window.innerWidth);
					positionCurrent.style.transform = "translateX("+((window.innerWidth-amount-1)/13)+"px)";
					positionCurrent.style.opacity = (amount/window.innerWidth);
					if (next) {
						next.classList.remove("next");
					}
				}
			}

		}

		function start() {
			clearInterval(repeat);
			clearTimeout(queueRepeat);
			context.classList.remove("autoplay");
			refreshNodes();
			if (current) {
				current.classList.add("notransition");
			}
			if (next) {
				next.classList.add("notransition");
			}

			context.addEventListener(moveEvent, move);
			context.addEventListener(releaseEvent, end);
		}

		function end() {
			resetViews();
			queueRepeat = setTimeout(function(){
				refreshNodes();
				autoPlay();
			}, delay);

			// // Swipe to start to start or end
			if ( coordinates.direction == "end" ) {
				if ( coordinates.current  >= window.innerWidth / 3 && prev ) {
					current.dataset.viewport = "end";
					if (next) {
						next.classList.remove("next");
					}

					overlayPrev.style.opacity = 0;
					overlayCurrent.style.opacity = 1;
					positionCurrent.style.opacity = 1;
					positionCurrent.style.transform = "translateX(0px)";
					current.classList.remove("current")
					current.classList.add("next")
					prev.classList.add("current");
					prev.classList.remove("prev");
					if (prev.previousElementSibling) {
						prev.previousElementSibling.classList.add("prev");
					}
				} else {
					//Not moved
					positionCurrent.style.opacity = 0;
				}
			} else {
				if ( coordinates.current  <= window.innerWidth / 1.5 && next ) {
					if (prev) {
						prev.classList.remove("prev");
						current.addEventListener("transitionend", function endTrans(){
							overlayCurrent.style.opacity = "0";
							this.removeEventListener("transitionend",endTrans)
						})
					}
					overlayNext.style.opacity = 0;
					next.classList.remove("next");
					current.classList.remove("current");
					current.classList.add("prev");

					// Check for last slide
					if (next.nextElementSibling) {
						next.classList.add("current");
						next.nextElementSibling.classList.add("next");
					} else {
						next.classList.add("current");
						next.classList.add("last");
						positionNext.style.opacity = "0"
					}
					next.dataset.viewport = "start";
				} else if (next) {
					//Not moved
					overlayCurrent.style.background = "rgba(255,255,255,0.2)";
					overlayCurrent.style.opacity = 0;
					positionNext.style.opacity = 1;
					positionNext.style.transform = "translateX(0px)";
					next.dataset.viewport = "end";
				} else {
					// Check last again
					current.classList.add("last");
					positionCurrent.addEventListener("transitionend", function endTrans(){
						positionCurrent.style.opacity = "0";
						this.removeEventListener("transitionend", endTrans);
					});
				}
			}

			context.removeEventListener(moveEvent, move, false);
			context.removeEventListener(releaseEvent, end, false);
		}

		context.addEventListener(pressEvent, function(e) {
			coordinates.init = (e.touches) ? e.touches[0].pageX : e.clientX;
			start();
		});
		refreshNodes();
		autoPlay();
		reloadapp.addEventListener("click", function() {
			reloadApp();
		});
	}

	initSwipe();

	closeapp.addEventListener("click", function() {
		window.close();
	});


}
