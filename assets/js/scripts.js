const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event('template-loaded'));
        });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === 'none') {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === 'none') {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($('.js-dropdown-list'))) return;

    const items = $$('.js-dropdown-list > li');

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty('--arrow-left-pos', `${arrowPos}px`);
    });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener('resize', calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener('template-loaded', calArrowPos);

const calculateHeight = debounce(() => {
    const items = $$('.collection-card__inner');

    items.forEach((item) => {
        const width = item.offsetWidth;
        item.style.height = width + 'px';
    });
});

window.addEventListener('resize', calculateHeight);
window.addEventListener('template-loaded', calculateHeight);

const calculateHeightIntroductions = debounce(() => {
    const items = $$('.instructions-card__inner');

    items.forEach((item) => {
        const width = item.offsetWidth;
        item.style.height = width + 'px';
    });
});

window.addEventListener('resize', calculateHeightIntroductions);
window.addEventListener('template-loaded', calculateHeightIntroductions);
/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener('template-loaded', handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$('.js-dropdown');
    const menus = $$('.js-menu-list');
    const activeClass = 'menu-column__item--active';

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                    item.scrollIntoView();
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener('template-loaded', initJsToggle);

function initJsToggle() {
    $$('.js-toggle').forEach((button) => {
        const target = button.getAttribute('toggle-target');
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();

            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains('hide');

            requestAnimationFrame(() => {
                $(target).classList.toggle('hide', !isHidden);
                $(target).classList.toggle('show', isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains('hide');
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}

window.addEventListener('template-loaded', () => {
    const links = $$('.js-dropdown-list > li > a');

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest('li');
            item.classList.toggle('nav-bar__item--active');
        };
    });
});

window.addEventListener('template-loaded', () => {
    const tabsSelector = 'art-works__nav-item';
    const contentsSelector = 'art-works__content';

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$('.js-tabs');
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
                tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});

// window.addEventListener('template-loaded', () => {
//     // createThumbnails();

//     let currentSlide = 0;
//     const slider = document.getElementById('slider');
//     const slides = document.getElementsByClassName('slider__wrapimage');

//     function showSlide(index) {
//         if (index >= slides.length) {
//             currentSlide = 0;
//         } else if (index < 0) {
//             currentSlide = slides.length - 1;
//         } else {
//             currentSlide = index;
//         }
//         const thumbnails = document.getElementsByClassName('thumbnail');
//         const displacement = -currentSlide * 100 + '%';
//         slider.style.transform = 'translateX(' + displacement + ')';

//         // Highlight the current thumbnail
//         for (let i = 0; i < thumbnails.length; i++) {
//             thumbnails[i].classList.remove('active');
//         }
//         thumbnails[currentSlide].classList.add('active');
//     }

//     const preSlide = document.getElementById('prev');
//     const nextSlide = document.getElementById('next');

//     preSlide.onclick = () => {
//         showSlide(currentSlide - 1);
//     };
//     nextSlide.onclick = () => {
//         showSlide(currentSlide + 1);
//     };
// });

window.addEventListener('template-loaded', () => {
    var imageSlider = document.getElementsByClassName('slider__items')[0];
    console.log(document.getElementsByClassName('slider__items')[0].children.length);
    // console.log(imageSlider);
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');

    var currentSlide = 0;

    prevBtn.onclick = () => {
        showSlide(currentSlide - 1);
    };

    nextBtn.onclick = () => {
        showSlide(currentSlide + 1);
    };

    // prevBtn.addEventListener('click', function () {
    //     showSlide(currentSlide - 1);
    // });

    // nextBtn.addEventListener('click', function () {
    //     showSlide(currentSlide + 1);
    // });

    function showSlide(slideIndex) {
        //var imageSlider = document.getElementsByClassName('slider__items');
        //  console.log(imageSlider);
        var totalSlides = document.getElementsByClassName('slider__items')[0].children.length;

        // Loop back to the first slide if at the end
        if (slideIndex >= totalSlides) {
            currentSlide = 0;
        } else if (slideIndex < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = slideIndex;
        }

        console.log(currentSlide);

        var translateValue = -currentSlide * 50 + '%';
        imageSlider.style.transform = 'translateX(' + translateValue + ')';

        const items = document.getElementsByClassName('slider__item');
        console.log(items);

        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('slider__item--active');
        }
        items[currentSlide].classList.add('slider__item--active');
    }
});
