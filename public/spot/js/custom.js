
$(document).ready(function() {

    // Initial background image positon
    var bgTranslateY = 0;

    // Fullpage init
    $('#fullpage').fullpage({

      // Navigation
      menu: ".menu",

      // Scrolling
      scrollingSpeed: 700,
      easingcss3: "cubic-bezier(0.39, 0.575, 0.565, 1)", // easeOutSine

      //Custom selectors
      sectionSelector: 'section',
      slideSelector: 'slide_custom',

      // Design
      paddingTop: "130px",
      paddingBottom: "50px",
      responsiveWidth: 768,

      // Events
      afterLoad: function(anchorLink, index) {

        // Background color switcher
        backgroundColor(index - 1);

        // Animate elements
        animateElements(index - 1, true);

        // Enable/disable carousel
        if (anchorLink == "section_carousel") {
          $(".carousel").carousel("cycle");
        } else {
          $(".carousel").carousel("pause");
        }

      },
      onLeave: function(index, nextIndex, direction) {

        // Background color switcher
        backgroundColor(nextIndex - 1);

        // Remove animation classes from elements on the current section
        setTimeout(function() {
          animateElements(index - 1, false);
        }, 700);

        // Fade out/in old/new sections
        $(this).css("opacity", "0");
        $("section").eq(nextIndex - 1).css("opacity", "1");

        // Translate background image
        bgTranslateY -= (nextIndex - index) * 30;

        $(".bg-image").css({
          "-webkit-transform": "translateY(" + bgTranslateY + "px)",
              "-ms-transform": "translateY(" + bgTranslateY + "px)",
                  "transform": "translateY(" + bgTranslateY + "px)"
        });

        // Device slideshow
        deviceSlideshow(nextIndex - 1);

      }

    });
});


/**
 * Animate elements
 */

function animateElements(section, animate) {
  $("section").eq(section).find("[data-animate-in]").each(function() {
    var animateClass = $(this).data("animate-in");

    // Add classes if animate == true, remove if false
    if (animate) {
      $(this).addClass("animated " + animateClass);
    } else {
      $(this).removeClass("animated " + animateClass);
    }
  });
};


/**
 * Background image size calc
 */

$(function() {

  var bg = $(".bg-image");
  var sections = $("section").length;
  var bottomOffset = 30 * sections;

  bg.css("bottom", -bottomOffset + "px");

});


/**
 * Change navbar background on collapse (mobile)
 */

$(function() {
  $(".navbar").on({
    "show.bs.collapse": function() {
      $(this).addClass("navbar-mobile");
    },
    "hide.bs.collapse": function() {
      $(this).removeClass("navbar-mobile");
    }
  });
});


/**
 * Collapse navbar on click
 */

$(function() {
  $(".navbar-collapse li > a").click(function() {
    if ($(".navbar-collapse").attr("aria-expanded") && !$(this).hasClass("dropdown-toggle")) {
      $(".navbar-collapse").collapse("hide");
    }
  });
});


/**
 * Background colors switcher
 */

function backgroundColor(index) {
  var colors = $(".bg-colors").data("colors");
  colors = colors.split(",");

  $(".bg-colors").css("background-color", colors[index]);
};


/**
 * Initialize popovers & tooltips
 */

$(function () {
  $('[data-toggle="popover"]').popover();
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


/**
 * Device slideshow
 */

function deviceSlideshow(index) {

  $(".device__slides").each(function() {
    var fullHeight = $(this).height(),
        totalSlides = $(this).children("img").length,
        singleSlideHeight = fullHeight / totalSlides,
        shiftScreensBy = -(index * singleSlideHeight);

    $(this).css({
      "-webkit-transform": "translateY(" + shiftScreensBy + "px)",
          "-ms-transform": "translateY(" + shiftScreensBy + "px)",
              "transform": "translateY(" + shiftScreensBy + "px)"
    });
  });
};
