import MicroModal from 'micromodal';

export { showModal, closeModal, loadModal };

const scrollBarWidth = getScrollbarWidth();
console.log('scrollBarWidth: ', scrollBarWidth);

/**
 *
 * @param {String} id - id of modal
 * @param {Object} props
 * @param {Function} props.onShow
 * @param {Function} props.onClose
 * @param {Boolean} props.removeOnClose
 */
function showModal(id, { onShow = null, onClose = null, removeOnClose = false } = {}) {
    MicroModal.show(id, {
        disableScroll: true,
        disableFocus: true,
        awaitCloseAnimation: true,
        onShow(modal, trigger) {
            onModalOpen(modal);
            if (typeof onShow === 'function') onShow(modal, trigger, ...arguments);
        },
        onClose(modal) {
            onModalClose(modal, removeOnClose);
            if (typeof onClose === 'function') onClose(modal);
        },
    });
}

function closeModal(id) {
    MicroModal.close(id);
}

function loadModal(url) {
    return new Promise((resolve) => {
        postData(url).then((data) => {
            const modalHtml = data.html;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            resolve();
        });
    });
}

function onModalOpen(modal) {
    if (modal) modal.children[0].style.paddingRight = scrollBarWidth + 'px';
    document.body.style.paddingRight = scrollBarWidth + 'px';

    const fixedNodes = [document.querySelector('.section-header'), document.querySelector('.main-header')];
    fixedNodes.forEach((node) => {
        if (node) node.style.right = scrollBarWidth + 'px';
    });

    // modal.addEventListener('animationend', function addPadding() {
    //     // modal.children[0].style.paddingRight = scrollBarWidth + 'px';
    //     document.body.style.overflow = 'hidden'
    //     document.body.style.paddingRight = scrollBarWidth + 'px';
    //     this.removeEventListener('animationend', addPadding);
    // });
}

function onModalClose(modal, remove = true, modalCopy) {
    modal.children[0].style.paddingRight = '';
    document.body.style.paddingRight = '';
    // const fixedNodes = [document.querySelector('.section-header'), document.querySelector('.main-header')];
    // fixedNodes.forEach((node) => {
    //     if (node) node.style.right = '0';
    // });
    // setTimeout(() => {}, 3000);

    if (remove) {
        modal.addEventListener('animationend', function removeModal() {
            this.remove();
            this.removeEventListener('animationend', removeModal);
        });
    }
    if (modalCopy) {
        // clone to delete all event listeners
        modal.addEventListener('animationend', function updateModal() {
            modalCopy.classList.remove('is-open');
            this.removeEventListener('animationend', updateModal);
            modal.remove();

            document.body.append(modalCopy);
        });
    }
}

function getScrollbarWidth() {
    console.log();
    return window.innerWidth - document.documentElement.clientWidth;
}
