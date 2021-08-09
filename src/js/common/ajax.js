export { getData, postData, loadModal, loadYandexMap };

/**
 *
 *
 * @param {String} url
 * @param {Object} options
 * @param {String} [options.method = post]
 * @param {Object} [options.headers]
 * @param {URLSearchParams | FormData} [options.body]
 * @returns {Promise}
 */
function postData(url, options) {
    const requestOptions = {
        method: 'POST',
        headers: options.headers || {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: options.body,
    };
    return fetch(url, requestOptions).then(response => {
        return response.json();
        // if  (response.ok) {
        //     return response.json();
        // } else {
        //     window.location.reload()
        // }
    }).catch(e => console.log(e));
}

function getData(url, options) {
    return fetch(url, options).then(
        response => {
            return response.json();
        },
        e => {}
    );
}

function loadModal(url) {
    return new Promise(resolve => {
        getData(url).then(data => {
            const modalHtml = data.html;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            resolve();
        });
    });
}

function loadYandexMap(url) {
    return new Promise(resolve => {
        if (window.yandexMapIsLoading) {
            setTimeout(() => resolve(loadYandexMap(url)), 1000);
        } else if (typeof ymaps !== 'undefined') {
            resolve();
        } else {
            // const yandexMapUrl = url;
            window.yandexMapIsLoading = true;
            const yandexMapUrl =
                'https://api-maps.yandex.ru/2.1/?apikey=08e27ce7-4e95-44b2-bb52-c19da9aeec5d&lang=ru_RU';
            const yandexMapScript = document.createElement('script');
            yandexMapScript.type = 'text/javascript';
            yandexMapScript.src = yandexMapUrl;
            document.body.appendChild(yandexMapScript);

            yandexMapScript.onload = function () {
                window.yandexMapIsLoading = false;
                resolve();
            };
        }
    });
}
