(function ($) {
    "use strict";
    
    // Scroll-reveal animations disabled: content renders instantly and
    // stays visible even if scripts load slowly or fail.
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, 0);
        } else {
            $('html, body').animate({scrollTop: 0}, 700, 'easeInOutExpo');
        }
        return false;
    });
    
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // jQuery counterUp
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });
    
    
    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonial Slider
    $('.testimonial-slider').slick({
        infinite: true,
        autoplay: true,
        arrows: false,
        dots: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.testimonial-slider-nav'
    });
    $('.testimonial-slider-nav').slick({
        arrows: false,
        dots: false,
        focusOnSelect: true,
        centerMode: true,
        centerPadding: '22px',
        slidesToShow: 3,
        asNavFor: '.testimonial-slider'
    });
    $('.testimonial .slider-nav').css({"position": "relative", "height": "160px"});
    
    
    // Blogs carousel
    $(".related-slider").owlCarousel({
        autoplay: true,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            }
        }
    });
    
    
    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });

    $('#portfolio-flters li').on('click keydown', function (event) {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        event.preventDefault();
        $("#portfolio-flters li").removeClass('filter-active');
        $(this).addClass('filter-active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });

    var $heroCarousel = $('#carousel.hero-carousel');
    var heroVideos = Array.prototype.slice.call(document.querySelectorAll('#carousel.hero-carousel video'));
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resetHeroVideos(activeVideo) {
        heroVideos.forEach(function (video) {
            video.pause();
            try {
                video.currentTime = 0;
            } catch (error) {
                // Metadata may not be available on a slow connection yet.
            }
        });

        if (activeVideo && !reduceMotion) {
            var playPromise = activeVideo.play();
            if (playPromise) {
                playPromise.catch(function () {
                    // Muted inline playback can still be blocked by browser policy.
                });
            }
        }
    }

    if (heroVideos.length) {
        resetHeroVideos(document.querySelector('#carousel.hero-carousel .carousel-item.active video'));

        $heroCarousel.on('slide.bs.carousel', function (event) {
            var nextVideo = event.relatedTarget ? event.relatedTarget.querySelector('video') : null;
            resetHeroVideos(nextVideo);
        });
    }

    // Keep the hero moving unless the user has requested reduced motion.
    if (!reduceMotion) {
        $heroCarousel.carousel({
            interval: 5200,
            pause: false,
            ride: 'carousel'
        });
    }

    $heroCarousel.on('slid.bs.carousel', function (event) {
        var current = String(event.to + 1).padStart(2, '0');
        $('.hero-current').text(current);
    });
    
})(jQuery);



// Auto-update footer copyright year
document.querySelectorAll('.footer-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
});

// Project labels stay available on tap while retaining hover on pointer devices.
(function () {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.project-tile'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-project-filter]'));

    function selectTile(tile) {
        tiles.forEach(function (item) {
            var selected = item === tile && !item.classList.contains('is-active');
            item.classList.toggle('is-active', selected);
            item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
    }

    tiles.forEach(function (tile) {
        tile.addEventListener('click', function () {
            selectTile(tile);
        });
        tile.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectTile(tile);
            }
        });
    });

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            var filter = button.getAttribute('data-project-filter');

            filters.forEach(function (item) {
                var selected = item === button;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-pressed', selected ? 'true' : 'false');
            });

            tiles.forEach(function (tile) {
                var visible = filter === 'all' || tile.getAttribute('data-project-status') === filter;
                tile.hidden = !visible;
                tile.classList.remove('is-active');
                tile.setAttribute('aria-pressed', 'false');
            });
        });
    });
}());

// Interactive values statement on the About page.
(function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.core-values-tabs [role="tab"]'));
    var statement = document.getElementById('core-value-statement');

    if (!tabs.length || !statement) {
        return;
    }

    function selectValue(tab) {
        tabs.forEach(function (item) {
            var selected = item === tab;
            item.classList.toggle('active', selected);
            item.setAttribute('aria-selected', selected ? 'true' : 'false');
        });

        statement.classList.add('is-changing');
        window.setTimeout(function () {
            statement.textContent = tab.getAttribute('data-value-statement');
            statement.classList.remove('is-changing');
        }, 160);
    }

    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            selectValue(tab);
        });

        tab.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowLeft') {
                return;
            }

            event.preventDefault();
            var direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
            var next = tabs[(index + direction + tabs.length) % tabs.length];
            next.focus();
            selectValue(next);
        });
    });
}());

// Full-screen navigation overlay.
(function () {
    var menu = document.getElementById('siteMenu');
    var openButton = document.querySelector('[data-menu-open]');
    var closeButton = document.querySelector('[data-menu-close]');
    var lastFocused;

    if (!menu || !openButton || !closeButton) {
        return;
    }

    function focusableElements() {
        return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
    }

    function openMenu() {
        lastFocused = document.activeElement;
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        openButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        window.setTimeout(function () {
            closeButton.focus();
        }, 250);
    }

    function closeMenu() {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        openButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        if (lastFocused) {
            lastFocused.focus();
        }
    }

    openButton.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (event) {
        if (!menu.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            closeMenu();
            return;
        }

        if (event.key === 'Tab') {
            var items = focusableElements();
            var first = items[0];
            var last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}());
