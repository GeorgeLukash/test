var promos_array = ['phillyd','sleepwithme','atp100','PRESENTABLE'];
var result_array = [];

Promise.each = async function(arr, fn) { 
   for(let item of arr) await fn(item);
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


var _applyPromoCode = async (promo_code) => {
    _removePromoCode();
    const url = new URL('https://casper.com/japi/order/apply_promo');
    const params = {
        include: 'line_items.variant',        
        coupon_code: promo_code       
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    await fetch(url, {
        header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST'
    }).then((response) => {
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
     });
}

var _bestCodeApply = (promo_code) => {
    _removePromoCode();
    const url = new URL('https://casper.com/japi/order/apply_promo');
    const params = {
        include: 'line_items.variant',        
        coupon_code: promo_code       
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

     fetch(url, {
        header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST'
    }).then((response) => {
        return response.json();
    }).then((data) => {         
          let total = data.included.find((item) => {
              if (item.type === 'totals') {
                   return item;                    
               }
           });           
           console.log('Best promo is : ',promo_code,'total is : ', total.attributes.order);                               
     });;
};

var _someFunction = async ()=>{
    await Promise.each(promos_array, _applyPromoCode);
    result_array.sort((a,b)=>{
        return a.discount - b.discount;
    });

    _bestCodeApply(result_array[0].code);
    
}

_someFunction();
