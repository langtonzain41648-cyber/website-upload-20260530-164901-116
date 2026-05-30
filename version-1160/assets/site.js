(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function showSlide(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var searchInput = document.getElementById('movie-search');
    var clearSearch = document.getElementById('clear-search');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));

    function applySearch(value) {
        var keyword = String(value || '').trim().toLowerCase();
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            searchInput.value = initial;
        }
        applySearch(searchInput.value);
        searchInput.addEventListener('input', function () {
            applySearch(searchInput.value);
        });
    }

    if (clearSearch && searchInput) {
        clearSearch.addEventListener('click', function () {
            searchInput.value = '';
            applySearch('');
            searchInput.focus();
        });
    }

    window.MovieSite = window.MovieSite || {};
    window.MovieSite.play = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('player-cover');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !streamUrl) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startVideo() {
            loadVideo();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
