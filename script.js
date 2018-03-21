var promos_array = ['phillyd','sleepwithme','atp100','PRESENTABLE'];

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
    }).then((response) => {
        return response.json();
    }).then((data) => {
            let total = data.included.find((item) => {
                if (item.type === 'totals') {
                    return item;                    
                }
            });            
        });;
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
          let total = data.included.find((item) => {
              if (item.type === 'totals') {
                   return item;                    
               }
           });
          // setTimeout(()=>{location.reload()},5000);           
          console.log('Original price : ', total.attributes.item);
          console.log('Discount with : ',promo_code,' is ',total.attributes.order);        
     });
}

Promise.each(promos_array, _applyPromoCode);
//_applyPromoCode('atp100');
//_applyPromoCode(promos_array[1]);