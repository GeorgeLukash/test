var promos_array = ['facebook','phillyd','sleepwithme','atp100','PRESENTABLE'];
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
          let total = data.included.find((item) => {
              if (item.type === 'totals') {
                   return item;                    
               }
           });
           promo.code = promo_code;
           promo.discount = total.attributes.order; 
           result_array.push(promo); 
           console.log(promo);                  
     });
}

var _someFunction = async ()=>{
    await Promise.each(promos_array, _findPromoCodes);
    console.log(result_array);
    result_array.sort((a,b)=>{
        return a.discount - b.discount;
    });
        

    _applyPromoCode(result_array[0].code);
    location.reload();
    
}

_someFunction();
