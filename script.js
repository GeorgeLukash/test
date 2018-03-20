const promo_codes = ['PRESENTABLE', 'phillyd', 'sleepwithme', 'atp100'];

const _findBestPromo = (promo_code) => {
    const url = new URL('https://casper.com/japi/order/apply_promo');
    const params = {
        include: 'line_items.variant',
        guest_token: 'G9QQ5nID8EIqal-wfIaRnw',
        coupon_code: promo_code,
        order: 'R446713368'
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    fetch(url, {
        header: {
            'Accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        method: 'POST'
    }).then((response) => {
        response.json().then((data) => {
            let total = data.included.find((item) => {
                if (item.type === 'totals') {
                    return item;                    
                }
            });
            console.log(total.attributes.order);
        });
    });
}
_findBestPromo(promo_codes[2]);
