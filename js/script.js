
function createGallery($gallery) {
  var
    GALLERY_SCROLL_DURATION = 1000,
    $galleryControls = $gallery.find('.gallery-button'),
    $galleryItemsContainer = $gallery.find('.gallery-items'),
    $galleryItems = $galleryItemsContainer.find('.gallery-item'),
    galleryItemsCount = $galleryItems.length,
    indexCurrent = 0,
    inAnimation = false;

  $galleryItems.hide();
  $galleryItems.eq(0).show();

  function goTo(index, direction) {
    var
      $current = $galleryItems.eq(indexCurrent),
      $next = $galleryItems.eq(index);

    $next.css({
      display: 'block',
      left: (direction ? '' : '-') + '100%'
    });
    
    // starting animation
    inAnimation = true;
    // animating both current and next slides at once
    $current.add($next).animate({
      'left': (direction ? '-' : '+') + '=100%'
    }, GALLERY_SCROLL_DURATION, function() {
      $current.hide();
      inAnimation = false; // animation ended
      indexCurrent = index;
    });
  }
  
  $galleryControls.on('click', function() {
    // ignore clicks while in the middle of animation
    if (inAnimation) {
      return false;
    }
    
    var
      // "right to left", aka direction
      rtl = $(this).hasClass('right') ? true : false,
      // next slide index, +1 or -1
      index = indexCurrent + (rtl ? 1 : -1);
    
    // clicking Prev when current == 0 (first slide)
    if (index < 0) {
      index = galleryItemsCount - 1;
    }
    
    // clicking Next when current == galleryItemsCount - 1 (last slide)
    if (index > galleryItemsCount - 1) {
      index = 0;
    }
    
    goTo(index, rtl);
    
    return false;
  });
}

createGallery($('#gallery'));
createGallery($('.small-gallery'));


function createAccordeon($gallery) {
  var
    GALLERY_ANIMATION_DURATION = 800,
    $galleryItems = $gallery.find('.gallery-item'),
    $galleryItemsImages = $galleryItems.find('img'),
    $galleryItemsOverlays = $galleryItems.find('.overlay'),
    // объединяем в одну коллекцию всё, к чему
    // будем применять анимацию
    $galleryAnimationSubjects = $galleryItems.add($galleryItemsImages).add($galleryItemsOverlays),
    $galleryNavItems = $gallery.find('.main-gallery-button'),
    currentIndex = $galleryItems.filter('.expanded').index(),
    inAnimation = false,
    // здесь используем .width() вместо .css('width'),
    // потому что ниже нам понадобится использовать размеры
    // элементов для вычислений, а этот метод возвращает
    // число (в пикселях), а не строку.
    galleryItemsHeight = $galleryItems.height(),
    galleryItemsExpandedWidth = $galleryItems.filter('.expanded').width(),
    galleryItemsExpandedImageShift = 0,
    galleryItemsExpandedOverlayOpacity = 0,
    galleryItemsCollapsedWidth = $galleryItems.filter('.collapsed').width(),
    galleryItemsCollapsedImageShift = ((galleryItemsCollapsedWidth - galleryItemsExpandedWidth) / 2),
    galleryItemsCollapsedOverlayOpacity = $galleryItemsOverlays.filter('.collapsed .overlay').css('opacity');
  
  $galleryNavItems.removeClass('active');
  $galleryNavItems.eq(currentIndex).addClass('active');
  
  function applyInlineCSS() {
    // задаем начальные стили галереи В ПИКСЕЛЯХ (с размерами
    // в % анимация отказывается работать адекватно)
    $galleryItems.css({
      height: galleryItemsHeight
    });
    $galleryItemsImages.css({
      height: galleryItemsHeight,
      width: galleryItemsExpandedWidth
    });
    $galleryItemsImages.filter('.expanded img').css({
      marginLeft: galleryItemsExpandedImageShift
    });
    $galleryItemsImages.filter('.collapsed img').css({
      marginLeft: galleryItemsCollapsedImageShift
    });
  }
  
  // убираем инлайновые стили, чтобы галерея
  // снова могла ресайзиться при изменении
  // размеров окна браузера
  function clearInlineCSS() {
    $galleryAnimationSubjects.removeAttr('style');
  }
  
  function goTo(index) {
    var
      $current = $galleryItems.eq(currentIndex),
      $currentImage = $galleryItemsImages.eq(currentIndex),
      $currentOverlay = $galleryItemsOverlays.eq(currentIndex),
      $next = $galleryItems.eq(index),
      $nextImage = $galleryItemsImages.eq(index),
      $nextOverlay = $galleryItemsOverlays.eq(index),
      $nextNav = $galleryNavItems.eq(index);
    
    if (!$next.hasClass('collapsed') || $nextNav.hasClass('active')) {
      return false;
    }
    
    applyInlineCSS();
    $galleryNavItems.removeClass('active');
    
    inAnimation = true;
    // метод .animate() вызываем с двумя параметрами:
    // 1. css-свойства которые нужно изменить
    // 2. опции (нас интересует "queue: false" - отключение очереди)
    // желаемые размеры картинок задаем В ПИКСЕЛЯХ
    $next.animate({
      width: galleryItemsExpandedWidth
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false
    });
    
    $nextImage.animate({
      marginLeft: galleryItemsExpandedImageShift
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false
    });
    
    $nextOverlay.animate({
      opacity: galleryItemsExpandedOverlayOpacity
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false
    });

    $current.animate({
      width: galleryItemsCollapsedWidth
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false
    });
    
    $currentImage.animate({
      marginLeft: galleryItemsCollapsedImageShift
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false
    });
    
    $currentOverlay.animate({
      opacity: galleryItemsCollapsedOverlayOpacity
    }, {
      duration: GALLERY_ANIMATION_DURATION,
      queue: false,
      complete: function() {
        // переключаем классы на элементах гелереи,
        // чтобы при очистке инлайновых стилей она
        // сохранила свое новое состояние (новая
        // активная картинка)
        $current.removeClass('expanded').addClass('collapsed');
        $next.removeClass('collapsed').addClass('expanded');
        // задаем активную ссылку (индикатор активной картинки)
        $nextNav.addClass('active');
        // удаляем инлайновые стили (в пикселях), чтобы стили
        // для ресайза (в %) снова заработали
        clearInlineCSS();
        currentIndex = index;
        inAnimation = false;
      }
    });
  }
  
  $galleryItems.add($galleryNavItems).on('click', function() {
    if (inAnimation) {
      return false;
    }
    
    goTo($(this).index());
    
    return false;
  });
  
  // при изменении размеров окна браузера обновляем
  // значения переменных, которые мы используем для
  // анимации размеров элементов
  $(window).on('resize', function() {
    galleryItemsHeight = $galleryItems.height();
    galleryItemsExpandedWidth = $galleryItems.filter('.expanded').width();
    galleryItemsExpandedImageShift = 0;
    galleryItemsCollapsedWidth = $galleryItems.filter('.collapsed').width();
    galleryItemsCollapsedImageShift = ((galleryItemsCollapsedWidth - galleryItemsExpandedWidth) / 2);
  });
}

createAccordeon($('.main-gallery'));
