var promos_array = ['SUNY50','facebook','phillyd','PRESENTABLE','sleepwithme','atp100'];
var result_array = [];

Promise.each = function(arr, fn) {   
  if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));  
  if(arr.length === 0) return Promise.resolve(); 
  return arr.reduce(function(prev, cur) { 
    return prev.then(() => fn(cur))
  }, Promise.resolve());
}

var _removePromoCode = async ()=>{
    const url = new URL('https://casper.com/japi/order/remove_promos');
    const params ={
        include: 'line_items.variant'
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    await fetch(url,{
         header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST'
    });
}

var _checkForPromos = ()=>{
  const parent_elem = document.querySelector('.CartSummary__item-label--promo___3Ag_n');  
  if(parent_elem != null){
    let promo_set = new Set(promos_array);
    let tmp_code = parent_elem.textContent;    
    promo_set.add(tmp_code.replace(/\s/g,'').toLowerCase());
    promos_array = [...promo_set];   
  }else{
    console.log('No promo code on page!');
  }  
}

var _applyPromoCode = (promo_code)=>{
    _removePromoCode();
    const url = new URL('https://casper.com/japi/order/apply_promo');
    const params = {
        include: 'line_items.variant',        
        coupon_code: promo_code       
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    return fetch(url, {
        header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST'
    })
};

var _findPromoCodes = async (promo_code) => {
    await _applyPromoCode(promo_code).then((response) => {
        return response.json();
    }).then((data) => {
          let promo = {};
          let origin_price = 0;
          let order_details = data.included.find((item) => {
              if (item.type === 'totals') {
                   return item;                    
               }
           });
           origin_price = order_details.attributes.item;
           promo.code = promo_code;
           promo.discount = origin_price - order_details.attributes.order; 
           result_array.push(promo); 
           console.log(promo);                  
     });
}

var _mainFunction = async ()=>{
    await _checkForPromos();
    await Promise.each(promos_array, _findPromoCodes);
   
    result_array.sort((a,b)=>{
        return b.discount - a.discount;
    });
    console.log(result_array);

    _applyPromoCode(result_array[0].code);
     location.reload();
    
}

_mainFunction();
