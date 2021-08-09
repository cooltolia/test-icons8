import { postData } from '/js/common/ajax';

const cartCounters = document.querySelectorAll('.cart-counter');
const favoriteCounters = document.querySelectorAll('.favorite-counter');

export function updateHeaderBusket(count) {
    if (count) cartCounters.forEach((node) => (node.innerHTML = count));
    else cartCounters.forEach((node) => (node.innerHTML = ''));
}

export function updateHeaderFavorites(count) {
    if (count) favoriteCounters.forEach((node) => (node.innerHTML = count));
    else favoriteCounters.forEach((node) => (node.innerHTML = ''));
}

export function addProductToCart(id, count, shouldDelete) {
    const deleteParam = shouldDelete ? '&delete=true' : ''
    return new Promise((resolve) => {
        postData('/ajax/basket_add.php', {
            body: `id=${id}&quantity=${count}${deleteParam}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((data) => {
            updateHeaderBusket(data.count, data.price);
            resolve(data);
        });
    });
}

export function likeProduct(id) {
    return new Promise((resolve) => {
        postData('/ajax/favorite_add.php', {
            body: `id=${id}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((data) => {
            updateHeaderFavorites(data.favorite_count);
            resolve(data);
        });
    });
}
