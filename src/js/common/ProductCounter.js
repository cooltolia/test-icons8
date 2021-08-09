import { debounce } from '/js/helpers';
import { addProductToCart } from '/js/common/common';

export class ProductCounter {
    /**
     * @param {HTMLElement} product
     */
    constructor(product) {
        this.product = product;

        this.counter = product.querySelector('.kz-product-counter');
        if (!this.counter) return null;

        this.currentNode = this.counter.querySelector('.kz-product-counter__current .value');
        this.minusButton = this.counter.querySelector(`[data-action='minus']`);
        this.plusButton = this.counter.querySelector(`[data-action='plus']`);

        this.maxCount = parseInt(this.counter.dataset.max);
        this.initialCount = parseInt(this.currentNode.textContent);
    }

    init() {
        if (!this.counter) return;

        this.setActiveControls();

        this.minusButton.addEventListener('click', () => {
            this.decreaseCounter();
        });

        this.plusButton.addEventListener('click', () => {
            this.inreaseCounter();
        });
    }

    update(newValue, newMax) {
        this.currentNode.textContent = newValue;

        this.maxCount = +newMax;
        this.counter.dataset.max = newMax;

        this.setActiveControls();
    }

    get currentCount() {
        return parseInt(this.currentNode.textContent);
    }

    set currentCount(value) {
        this.currentNode.textContent = value;
    }

    decreaseCounter() {
        const current = parseInt(this.currentNode.textContent);
        let newValue = current;

        newValue = current - 1;
        this.plusButton.classList.remove('disabled');
        if (newValue < 1) {
            return current;
        } else if (newValue === 1) {
            this.minusButton.classList.add('disabled');
        }

        this.currentNode.textContent = newValue;

        return newValue;
    }

    inreaseCounter() {
        const current = parseInt(this.currentNode.textContent);
        let newValue = current;

        newValue = current + 1;
        this.minusButton.classList.remove('disabled');
        if (newValue > this.maxCount) {
            /** show some error, I guess */
            return current;
        } else if (newValue === this.maxCount) {
            this.plusButton.classList.add('disabled');
        }

        this.currentNode.textContent = newValue;

        return newValue;
    }

    setActiveControls() {
        this.minusButton.classList.remove('disabled');
        this.plusButton.classList.remove('disabled');

        if (this.maxCount === this.initialCount) {
            this.plusButton.classList.add('disabled');
        }

        if (this.initialCount === 1) {
            this.minusButton.classList.add('disabled');
        }
    }
}

export class CartProductCounter extends ProductCounter {
    constructor(product, onSubmit = () => {}) {
        super(product);

        // this.productCard = this.product.closest('.cart-product');

        this.onSubmit = onSubmit;

        this.productId = this.product.dataset.product;
    }

    decreaseCounter() {
        const newValue = super.decreaseCounter();
        this.submitProductCount(newValue);
    }

    inreaseCounter() {
        const newValue = super.inreaseCounter();
        this.submitProductCount(newValue);
    }

    submitProductCount = debounce((newValue) => {
        if (newValue === this.initialCount) {
            return;
        }

        addProductToCart(this.productId, newValue).then(data => {
            this.initialCount = 1;
            debugger;
            this.onSubmit(data);
        })
    }, 500);
}
