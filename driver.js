var regex = /C\d+/g;
var dwcont = document.querySelector('iframe').src.match(regex)[1];

var parent_form = document.querySelector('#cart-items-form');
var amount_value_parent = parent_form.querySelectorAll('input[type="tel"]');

var _applyPromoCode = (promo_code) => {
    const url = `https://www.mrcoffee.com/cart?dwcont=${dwcont}`;
    const postBody = new URLSearchParams();	
    amount_value_parent.forEach((item)=>{
      postBody.set(item.name, item.value);
    });	    
	postBody.set('toggle_promo', 'on');       	
    postBody.set('dwfrm_cart_couponCode', promo_code);   
	postBody.set('dwfrm_cart_addCoupon','dwfrm_cart_addCoupon');	 
    return fetch(url, {
        headers: {
			'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'content-type': 'application/x-www-form-urlencoded',          
            'accept-encoding': 'gzip, deflate, br',
            'cache-control':'max-age=0',
			'upgrade-insecure-requests': '1'                                     
        },
        credentials: 'include',
        method: 'POST',
        body: postBody
    }).then(res => res.text());
};
_applyPromoCode('take10').then(res =>{
	const regex = />\$(\d+(,\d+)*(\.\d+)?)</;
	const total_price_after_promo = Number(res.match(regex)[1].replace(/,/,'')); 
	console.log(total_price_after_promo);
});