window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function () { return false; };
  image.oncontextmenu = function () { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function () {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

  });

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach('.carousel', options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listener to  event
    carousels[i].on('before:show', state => {
      console.log(state);
    });
  }

  // Access to bulmaCarousel instance of an element
  var element = document.querySelector('#my-element');
  if (element && element.bulmaCarousel) {
    // bulmaCarousel instance is available as element.bulmaCarousel
    element.bulmaCarousel.on('before-show', function (state) {
      console.log(state);
    });
  }

  /*var player = document.getElementById('interpolation-video');
  player.addEventListener('loadedmetadata', function() {
    $('#interpolation-slider').on('input', function(event) {
      console.log(this.value, player.duration);
      player.currentTime = player.duration / 100 * this.value;
    })
  }, false);*/
  preloadInterpolationImages();

  $('#interpolation-slider').on('input', function (event) {
    setInterpolationImage(this.value);
  });
  setInterpolationImage(0);
  $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

  bulmaSlider.attach();

  // Star burst effect on click
  document.addEventListener('click', function (e) {
    if (modal && modal.classList.contains('is-active')) return;
    // Check if the click target is NOT an enlargeable image or modal content
    if (!e.target.classList.contains('enlargeable-image') &&
      !e.target.classList.contains('modal-content') &&
      !e.target.classList.contains('modal-caption') &&
      !e.target.classList.contains('close')) {
      createStarBurst(e.pageX, e.pageY);
    }
  });

  function createStarBurst(x, y) {
    // 银色系: 亮银 -> 灰银 -> 淡钢蓝 -> 幽灵白 -> 亮灰
    const colors = ['#C0C0C0', '#D3D3D3', '#B0C4DE', '#F8F8FF', '#DCDCDC'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star-burst');

      // Randomize direction and distance
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 100; // pixels
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      star.style.setProperty('--tx', `${tx}px`);
      star.style.setProperty('--ty', `${ty}px`);
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      document.body.appendChild(star);

      // Remove after animation
      star.addEventListener('animationend', function () {
        star.remove();
      });
    }
  }

  // Image Modal Logic
  var modal = document.getElementById("imageModal");
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");
  var closeBtn = document.getElementsByClassName("close")[0];

  // Zoom/Pan state
  var scale = 1;
  var translateX = 0;
  var translateY = 0;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var lastTranslateX = 0;
  var lastTranslateY = 0;

  function applyTransform() {
    modalImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    if (scale > 1) {
      modalImg.classList.add('is-zoomed');
    } else {
      modalImg.classList.remove('is-zoomed');
    }
  }

  function openModal(src, alt) {
    if (!modal || !modalImg) return;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // reset state
    scale = 1;
    translateX = 0;
    translateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    modalImg.classList.remove('is-dragging');
    applyTransform();

    modalImg.src = src;
    modalImg.alt = alt || '';
    if (captionText) {
      captionText.innerHTML = `${alt || ''}<span class="hint">Scroll to zoom • Drag to pan • Double‑click to toggle • Esc to close</span>`;
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  $('.enlargeable-image').click(function () {
    openModal(this.src, this.alt);
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeModal();
    });
  }

  // Click backdrop to close (but not when clicking image)
  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // Esc key to close
  document.addEventListener('keydown', function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Wheel zoom
  if (modalImg) {
    modalImg.addEventListener('wheel', function (e) {
      if (!modal || !modal.classList.contains('is-active')) return;
      e.preventDefault();

      const rect = modalImg.getBoundingClientRect();
      const cx = e.clientX - (rect.left + rect.width / 2);
      const cy = e.clientY - (rect.top + rect.height / 2);

      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.12 : 0.88;
      const nextScale = Math.min(4, Math.max(1, scale * zoomFactor));

      // keep cursor position stable
      const scaleChange = nextScale / scale;
      translateX = (translateX - cx) * scaleChange + cx;
      translateY = (translateY - cy) * scaleChange + cy;

      scale = nextScale;
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
    }, { passive: false });

    // Double click toggle zoom
    modalImg.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (scale === 1) {
        scale = 2;
      } else {
        scale = 1;
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
    });

    // Drag to pan (only when zoomed)
    modalImg.addEventListener('mousedown', function (e) {
      if (scale <= 1) return;
      e.preventDefault();
      isDragging = true;
      modalImg.classList.add('is-dragging');
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastTranslateX = translateX;
      lastTranslateY = translateY;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      translateX = lastTranslateX + dx;
      translateY = lastTranslateY + dy;
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      modalImg.classList.remove('is-dragging');
    });
  }

  // --- Gallery Logic Start ---
  var currentGalleryIndex = 0;
  var galleryItems = document.querySelectorAll('.gallery-item');
  var galleryTabs = document.querySelectorAll('#gallery-tabs li');
  var totalItems = galleryItems.length;
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');

  function updateGallery(index) {
    if (index < 0 || index >= totalItems) return;
    currentGalleryIndex = index;

    // Update Tabs
    galleryTabs.forEach(function (tab) {
      tab.classList.remove('is-active');
    });
    var activeTab = document.querySelector('#gallery-tabs li[data-tab="' + index + '"]');
    if (activeTab) activeTab.classList.add('is-active');

    // Update Items
    galleryItems.forEach(function (item, i) {
      item.classList.remove('is-active', 'is-prev', 'is-next');
      var video = item.querySelector('video');

      if (i === index) {
        item.classList.add('is-active');
        if (video) {
          // video.currentTime = 0; // Optional: restart video on focus
          var playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(function (error) {
              console.log('Auto-play was prevented');
            });
          }
        }
      } else if (i === index - 1) {
        item.classList.add('is-prev');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      } else if (i === index + 1) {
        item.classList.add('is-next');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      } else {
        if (video) video.pause();
      }
    });

    // Manage Arrows visibility
    if (prevBtn && nextBtn) {
      if (index === 0) {
        prevBtn.style.opacity = '0.3';
        prevBtn.style.pointerEvents = 'none';
      } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
      }

      if (index === totalItems - 1) {
        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';
      } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
      }
    }
  }

  // Initial State
  updateGallery(0);

  // Event Listeners
  galleryTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var index = parseInt(tab.dataset.tab);
      updateGallery(index);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentGalleryIndex > 0) {
        updateGallery(currentGalleryIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentGalleryIndex < totalItems - 1) {
        updateGallery(currentGalleryIndex + 1);
      }
    });
  }
  // --- Gallery Logic End ---

})
