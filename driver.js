var promos_array = ['SLAINTE','JAN18','DOORBUSTER','DOORBUSTER','FEBPJ','OFFICEPARTY','LOVEBOOZE','KEPPWARM','STAYWARM','DRIZLYDEAL'];
var result_array = [];

var meta_token = document.querySelector('meta[name="csrf-token"]');
var x_csrf_token = meta_token.getAttribute('content')

Promise.each = function(arr, fn) {   
  if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));  
  if(arr.length === 0) return Promise.resolve(); 
  return arr.reduce(function(prev, cur) { 
    return prev.then(() => fn(cur))
  }, Promise.resolve());
}


var _applyPromoCode = (promo_code) => {
    const url = 'https://drizly.com/cart';
    const putBody = new URLSearchParams();
    putBody.set('redemption_code', promo_code);    
    putBody.set('re_apply_auto_promos', '1');    
    return fetch(url, {
        headers: {
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate, br',                     
            'x-csrf-token': x_csrf_token        
        },
        credentials: 'include',
        method: 'PUT',
        body: putBody
    }).then(res => res.json());
};

var _removePromoCode = ()=>{
  const url = 'https://drizly.com/cart';
    const putBody = new URLSearchParams();
    putBody.set('redemption_code', '');    
    putBody.set('re_apply_auto_promos', '');    
    return fetch(url, {
        headers: {
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate, br',                       
            'x-csrf-token': x_csrf_token        
        },
        credentials: 'include',
        method: 'PUT',
        body: putBody
    })
    .then((res) => res.json());             
}

var _getExistCode = () => {
  const parent_elem = document.querySelector('input[name="redemption_code"]');    
  let extinct_promocode_flag = false;

  if(parent_elem.value.length){ 
    let promo_set = new Set(promos_array);
    let tmp_code = parent_elem.value;  
    extinct_promocode_flag = true;      
    promo_set.add(tmp_code);
    promos_array = [...promo_set];    
  }else{
    extinct_promocode_flag = false;    
  }  
  return Promise.resolve(extinct_promocode_flag);
}

function _parseTotal (data) {  
  const parrent_wrapper = document.querySelector('.Cart__Total');
  const regex = /(\d+(,\d{3})*(\.\d+)?)/g;
  let price = null;  
  if (data) {   
      const total_price_order = data.cart.display_line_items.find((item)=>{
          if(item.key == 'total')
            return item;
        });
    price = total_price_order.raw_value;    
  } else {    
    price = Number(parrent_wrapper.textContent.match(regex)[1].replace(/,/g,''));      
  }
  return price;
}

_getExistCode()
.then(res =>{
  if(res){     
      return _removePromoCode()
          .then( data => { return _parseTotal(data)});
  }else{
      return Promise.resolve(_parseTotal());
  }
})
.then( originalPrice =>{
  return Promise.each(promos_array, code => {
     return _applyPromoCode(code)
        .then(data => _parseTotal(data))
        .then(price => {
          const discount = originalPrice - price;
          result_array.push({code, originalPrice, discount});
          console.log({code, originalPrice, discount});
          return _removePromoCode()
            .then(() => {
              return Promise.resolve();
            })
        })
   });   
})
.then(()=>{

  result_array.sort((a,b)=>{
        return b.discount - a.discount;
  });
 
  console.log(result_array);
  return _applyPromoCode(result_array[0].code);
})
.then(()=>{
  location.reload();
  return Promise.resolve();
});
