let scrollBarWidth = null;
let currentRequestAnimationFrame;

/**
 *
 * @typedef {Object} slideFunctionReturn
 * @property {Promise} slideFunctionReturn.promise
 * @property {Function} slideFunctionReturn.cancel - abort animation. Not tested!
 */

/**
 * @description
 * firstly checks if has cached value in this.scrollBarWidth =>
 * than calcs it if absent
 *
 * @returns {Number} width of scroll bar
 */
function getScrollbarWidth() {
    if (scrollBarWidth || scrollBarWidth === 0) return scrollBarWidth;

    scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    return scrollBarWidth;
}

/**
 * @description
 * relies on window width.
 * should correspond to variables.scss media
 */
const deviceType = {
    mobileMedia: window.matchMedia('(max-width: 767px)'),
    get isMobile() {
        return this.mobileMedia.matches;
    },
    tabletMedia: window.matchMedia(
        '(min-width: 768px) and (max-width: 1023px)'
    ),
    get isTablet() {
        return this.tabletMedia.matches;
    },
    laptopMedia: window.matchMedia(
        '(min-width: 1024px) and (max-width: 1279px)'
    ),
    get isLaptop() {
        return this.laptopMedia.matches;
    },
    desktopMedia: window.matchMedia('(min-width: 1280px)'),
    get isDesktop() {
        return this.desktopMedia.matches;
    },
    /** additional properties */
    minimumLaptopMedia: window.matchMedia('(min-width: 1024px)'),
};

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {Number} [props.speed = 160] - animation speed
 * @returns {Promise}
 */
function fadeIn(el, { display = 'block', speed = 160 } = {}) {
    /* no need to show again a visible element */
    if (!isHidden(el)) return;

    return new Promise(resolve => {
        const animationSpeed = 16 / speed;
        el.style.opacity = '0';
        el.style.display = display;

        const fade = () => {
            let id;
            var val = parseFloat(el.style.opacity);
            if (!((val += animationSpeed) > 1)) {
                el.style.opacity = val.toString();
                id = requestAnimationFrame(fade);
            } else {
                el.style.opacity = '1';
                resolve();
            }

            return id;
        };

        fade();
    });
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {Number} [props.speed = 160] - animation speed
 * @returns {Promise}
 */
function fadeOut(el, { speed = 160 } = {}) {
    /* no need to hide again an invisible element */
    if (isHidden(el)) return;

    return new Promise(resolve => {
        const animationSpeed = 16 / speed;
        el.style.opacity = '1';

        const fade = () => {
            let id;
            const currentOpacity = parseFloat(el.style.opacity);
            const newOpacity = currentOpacity - animationSpeed;
            if (newOpacity < 0) {
                el.style.display = 'none';
                resolve();
            } else {
                el.style.opacity = newOpacity.toString();
                id = requestAnimationFrame(fade);
            }

            return id;
        };

        fade();
    });
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {Number} [props.speed = 200] - animation speed
 * @param {String} [props.display='block'] - display property
 */
function fadeToggle(el, { speed = 160, display = 'block' } = {}) {
    if (isHidden(el)) {
        fadeIn(el, { speed: speed, display: display });
    } else {
        fadeOut(el, { speed: speed });
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {String} [props.classList] - additional class to add
 */
function show(el, { display = 'block', classList = '' } = {}) {
    el.style.display = display;
    if (classList.length > 0) el.classList.add(classList);
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.classList] - class name to remove
 */
function hide(el, { classList = '' } = {}) {
    el.style.display = 'none';
    if (classList.length > 0) el.classList.remove(classList);
}

/**
 * @param {HTMLElement} el
 * @param {Object} props
 * @param {String} [props.display='block'] - display property
 * @param {String} [props.classList] - additional class to toggle
 */
function toggle(el, { display = 'block', classList = '' } = {}) {
    if (getComputedStyle(el).display === 'none') {
        el.style.display = display;
        if (classList.length > 0) el.classList.add(classList);
    } else {
        el.style.display = 'none';
        if (classList.length > 0) el.classList.remove(classList);
    }
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 * @param {String} [props.display='block'] - display property
 *
 * @returns {slideFunctionReturn}
 */
function slideDown(el, { speed = 120, display = 'block' } = {}) {
    let resolve, reject, cancelled;
    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;

        let startHeight = 0;
        let startPaddingTop = 0;
        let startPaddingBottom = 0;

        const elStyles = window.getComputedStyle(el);
        const paddingTop = parseInt(elStyles.paddingTop);
        const paddingBottom = parseInt(elStyles.paddingBottom);

        el.style.height = startHeight + 'px';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        const height = el.scrollHeight;

        el.style.paddingTop = startPaddingTop.toString();
        el.style.paddingBottom = startPaddingBottom.toString();

        const heightAnimationSpeed = (height / speed) * 16;
        const paddingTopAnimationSpeed = (paddingTop / speed) * 16;
        const paddingBottomAnimationSpeed = (paddingBottom / speed) * 16;
        el.style.display = display;

        const slide = () => {
            let id;
            let newHeight = (startHeight += heightAnimationSpeed);
            let newPaddingTop = (startPaddingTop += paddingTopAnimationSpeed);
            let newPaddingBottom = (startPaddingBottom += paddingBottomAnimationSpeed);
            el.style.height = newHeight + 'px';
            el.style.paddingTop = newPaddingTop + 'px';
            el.style.paddingBottom = newPaddingBottom + 'px';

            if (newHeight > height) {
                currentRequestAnimationFrame = null;
                el.style.cssText = `display: ${display}`;
                resolve();
            } else {
                currentRequestAnimationFrame = requestAnimationFrame(slide);
            }

            return id;
        };

        slide();
    });

    return {
        promise,
        cancel: () => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        },
    };
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 *
 *
 * @returns {slideFunctionReturn}
 */
function slideUp(el, { speed = 120 } = {}) {
    let resolve, reject, cancelled;
    const promise = new Promise((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;

        const elStyles = window.getComputedStyle(el);
        const height = el.offsetHeight;
        const paddingTop = parseInt(elStyles.paddingTop);
        const paddingBottom = parseInt(elStyles.paddingBottom);

        let startHeight = height;
        let startPaddingTop = paddingTop;
        let startPaddingBottom = paddingBottom;

        el.style.height = startHeight + 'px';
        el.style.overflow = 'hidden';

        const heightAnimationSpeed = (height / speed) * 16;
        const paddingTopAnimationSpeed = (paddingTop / speed) * 16;
        const paddingBottomAnimationSpeed = (paddingBottom / speed) * 16;

        const slide = () => {
            let id;
            let newHeight = (startHeight -= heightAnimationSpeed);
            let newPaddingTop = (startPaddingTop -= paddingTopAnimationSpeed);
            let newPaddingBottom = (startPaddingBottom -= paddingBottomAnimationSpeed);
            el.style.height = newHeight + 'px';
            el.style.paddingTop = newPaddingTop + 'px';
            el.style.paddingBottom = newPaddingBottom + 'px';

            if (newHeight < 0) {
                el.style.cssText = `display: none`;

                currentRequestAnimationFrame = null;
                resolve();
            } else {
                currentRequestAnimationFrame = requestAnimationFrame(slide);
            }

            return id;
        };

        slide();
    });

    return {
        promise,
        cancel: () => {
            cancelled = true;
            reject({ reason: 'cancelled' });
        },
    };
}

/**
 * @param {HTMLElement} el
 * @param {Object} [props]
 * @param {Number} [props.speed = 120] - animation speed
 * @param {String} [props.display='block'] - display property
 */
function slideToggle(el, { speed = 120, display = 'block' } = {}) {
    if (isHidden(el)) {
        return slideDown(el, { speed: speed, display: display });
    } else {
        return slideUp(el, { speed: speed });
    }
}

/**
 * @param {HTMLElement} target - target element to scroll to
 * @param {Number} [offset = 100] - value for top offset
 */
function _scrollTo(target, offset = 100) {
    if (!target) {
        console.log('target: ', target);
        return;
    }
    const scrollPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
        top: scrollPosition - offset,
        behavior: 'smooth',
    });
}

/**
 * @param {HTMLElement} target - target element to scroll to
 * @param {Number} [offset = 50] - value for top offset
 * @param {Number} [duration = 500] - animation speed in ms
 */
function scrollTo(target, offset = 100, duration = 500) {
    return new Promise(resolve => {
        function move(amount) {
            document.documentElement.scrollTop = amount;
            document.body.scrollTop = amount;
        }

        const scrollPosition = target.getBoundingClientRect().top - offset;

        const start = window.scrollY;
        const increment = 20;
        let currentTime = 0;

        const animateScroll = function () {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            const value = easeInOutQuad(
                currentTime,
                start,
                scrollPosition,
                duration
            );
            // move the document.body
            move(value);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                const scrollPosition =
                    target.getBoundingClientRect().top - offset;
                if (scrollPosition < 0) {
                    scrollTo(target, offset, duration);
                } else {
                    resolve();
                }
            }
        };
        animateScroll();
    });
}

/**
 * @param {HTMLElement} el
 * @returns {Boolean} true if el is hidden via display: none
 */
function isHidden(el) {
    let style = window.getComputedStyle(el);
    return style.display === 'none';
}

function delay(time) {
    return new Promise(res => {
        setTimeout(res, time);
    });
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return (c / 2) * t * t + b;
    }
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
}

export {
    hide,
    show,
    isHidden,
    toggle,
    fadeIn,
    fadeOut,
    fadeToggle,
    slideDown,
    slideUp,
    slideToggle,
    scrollTo,
    getScrollbarWidth,
    deviceType,
    delay,
};
