var promos_array = ['SUNY50','facebook','phillyd','PRESENTABLE','sleepwithme','atp100'];
var result_array = [];

Promise.each = function(arr, fn) {   
  if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));  
  if(arr.length === 0) return Promise.resolve(); 
  return arr.reduce(function(prev, cur) { 
    return prev.then(() => fn(cur))
  }, Promise.resolve());
}

var _getExistCode = () => {  
  const parent_elem = document.querySelector('.CartSummary__item-label--promo___3Ag_n');  
  let exictinkt_promocode_flag = false;

  if(parent_elem != null){ 
    let promo_set = new Set(promos_array);
    let tmp_code = parent_elem.textContent;  
    exictinkt_promocode_flag = true;      
    promo_set.add(tmp_code.replace(/\s/g,'').toLowerCase());
    promos_array = [...promo_set];    
  }else{
    exictinkt_promocode_flag = false;    
  }  
  
  return Promise.resolve(exictinkt_promocode_flag);
}

var _removePromoCode = () => {
    const url = 'https://casper.com/japi/order/remove_promos';
    const postBody = new URLSearchParams();
    postBody.set('include', 'line_items.variant');
    return fetch(url,{
         header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST',
        body: postBody
    }).then(res => res.json());
}

var _applyPromoCode = (promo_code) => {
    const url = 'https://casper.com/japi/order/apply_promo';
    const postBody = new URLSearchParams();
    postBody.set('include', 'line_items.variant');
    postBody.set('coupon_code', promo_code);
    return fetch(url, {
        header: {
            'accept': 'application/json; version=1',
            'accept-encoding': 'gzip, deflate, br'
        },
        credentials: 'include',
        method: 'POST',
        body: postBody
    }).then(res => res.json());
};

function _parseTotal (data) {
  const parrent_wrapper = document.querySelector('.CartSummary__item-value--total___3nPuY');
  const regex = /(\d+(,\d{3})*(\.\d+)?)/g;
  let price = null;  
  if (data) {
    let order_details = data.included.find((item) => {
      if (item.type === 'totals') {
        return item;                    
      }
    });

    price = order_details.attributes.order;
  } else {    
    price = Number(parrent_wrapper.textContent.match(regex)[0].replace(/,/g,''));    
  }
  return price;
}


_getExistCode() 
.then(res => {
  if (res) {
    return _removePromoCode()
      .then(data => _parseTotal(data));
  }
  else {
    return Promise.resolve(_parseTotal());
  }
}) 
.then(originalPrice => {
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
