# JET live-orders bundle — curated evidence

Source: https://live-orders.takeaway.com/assets/index-D_IofYHW.js (2666993 chars)


### A. confirm-order endpoint + payload builder
```js
sFetching,notifications:a,selectedTab:h,setSelectedTab:p,sorting:r,setSorting:i,urgentNotifications:c,markAllAsRead:g,hasUnread:u,amountOfUnread:d,isStale:l.isStale,refetch:l.refetch}}function exe(){return Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order_issue",partner_product_id_list:e.partn
```


### B. PATCH status endpoint
```js
eliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_list
```


### C. status enum definition
_NOT FOUND IN BUNDLE_


### D. status order array (transition ladder)
```js
:"Dansk",de:"Deutsch",es:"Español",fr:"Français",it:"Italiano",nl:"Nederlands",pl:"Polski",ro:"Română",sk:"Slovenčina"},JO={uk:"https://live-orders.just-eat.uk",ie:"https://live-orders.just-eat.ie",it:"https://live-orders.just-eat.it",es:"https://live-orders.just-eat.es",au:"https://live-orders.just-eat.au",nz:"https://live-orders.just-eat.nz"},ZO=[Jn.NEW,Jn.CONFIRMED,Jn.KITCHEN,Jn.IN_DELIVERY,Jn.DELIVERED,Jn.CANCELLED],xBe=5,EBe=50,CBe="ofl_enabled",a8e=["default","airhorn","bladerunner","bong","bumptious","doorbell_notification","doorbell","banjo","radio","signal_ring","alert1","alert2","alert3","warning"],s8e=async()=>Hn.post("/account/actualize"),YS=e=>{Zt.dismiss(e)},n7=(e,t)=>{const n={onOpen:t.onShow,onC
```


### E. transition validation logic
```js
r_flow!==zm&&(this.is_own_delivery||this.is_3PL)}get can_change_default_delivery_duration(){return this.order_flow!==zm&&this.is_own_delivery}can_change_cooking_duration_of_order(t){return!((this.is_3PL||this.is_scoober||this.is_delco||this.is_haal)&&this.is_courier_first&&t.is_delivery)}can_change_delivery_duration_of_order(t){return!this.is_courier_first&&this.is_own_delivery&&t.is_delivery}get can_revert_order_status(){return this.is_own_delivery||this.is_unified_order_flow}can_change_confirmed_time_of_order(t){return this.is_own_delivery&&!t.is_cancelled&&!t.is_delivered&&!t.is_new}can_update_status_of_order(t){return!(this.is_unified_order_flow&&t.is_confirmed&&!t.is_ready_for_kitchen)}get is_own_delivery(){r
```
```js
(e=>e.data)}function Hpe(){return Hn({url:"/notifications/read-all",method:"post"}).then(e=>e.data)}function zpe(e){return Hn({url:`/notifications/${e}/read`,method:"post"}).then(t=>t.data)}const tg=e=>{const t=h7(e);jI(e),r7(t,{onClose:()=>zpe(e.id).then(r=>jI(r)).catch(r=>!1)})},Wpe=(e,t,n)=>{const r=ZO.findIndex(l=>l===e.status),i=ZO.findIndex(l=>l===t.status);return e.status===Jn.CANCELLED||n.can_revert_order_status&&e.is_in_delivery&&t.is_in_kitchen?!1:r>i};function F_(e,t,n){if(!e&&!t)return[];const r=[],i=Object.keys(e),l=Object.keys(t);return i.length!==l.length?[]:(i.forEach(o=>{const a=e[o],c=t[o];if(!a||!c)return[];a instanceof Date&&c instanceof Date&&!D7e(a,c)?r.push(o):Array.isArray(a)&&Array.isArray
```


### F. order model getters
```js
t_prep"):t("orders.live_orders_order_details.titles.waiting_for_courier");class Au{constructor(t){Object.entries(t).forEach(([n,r])=>{this[n]=r})}get is_new(){return this.status===Jn.NEW}get is_confirmed(){return this.status===Jn.CONFIRMED}get is_in_kitchen(){return this.status===Jn.KITCHEN}get is_in_delivery(){return this.status===Jn.IN_DELIVERY}get is_delivered(){return this.status===Jn.DELIVERED}get is_cancelled(){return this.status===Jn.CANCELLED}get acceptance_time(){return Tz(Date.now(),this.created_at)}get pickup_time(){return this.delivery_service_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}ge
```
```js
ils.titles.waiting_for_courier");class Au{constructor(t){Object.entries(t).forEach(([n,r])=>{this[n]=r})}get is_new(){return this.status===Jn.NEW}get is_confirmed(){return this.status===Jn.CONFIRMED}get is_in_kitchen(){return this.status===Jn.KITCHEN}get is_in_delivery(){return this.status===Jn.IN_DELIVERY}get is_delivered(){return this.status===Jn.DELIVERED}get is_cancelled(){return this.status===Jn.CANCELLED}get acceptance_time(){return Tz(Date.now(),this.created_at)}get pickup_time(){return this.delivery_service_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==nu
```


### G. axios baseURL / client config
```js
,d){if(!Ue.isUndefined(d))return r(void 0,d)}function o(u,d){if(Ue.isUndefined(d)){if(!Ue.isUndefined(u))return r(void 0,u)}else return r(void 0,d)}function a(u,d,h){if(h in t)return r(u,d);if(h in e)return r(void 0,u)}const c={url:l,method:l,data:l,baseURL:o,transformRequest:o,transformResponse:o,paramsSerializer:o,timeout:o,timeoutMessage:o,withCredentials:o,withXSRFToken:o,adapter:o,responseType:o,xsrfCookieName:o,xsrfHeaderName:o,onUploadProgress:o,onDownloadProgress:o,decompress:o,maxContentLength:o,maxBodyLength:o,beforeRedirect:o,transport:o,httpAgent:o,httpsAgent:o,cancelToken:o,socketPath:o,
```
```js
")return;const h=Ue.hasOwnProp(c,d)?c[d]:i,p=h(e[d],t[d],d);Ue.isUndefined(p)&&h!==a||(n[d]=p)}),n}const AF=e=>{const t=mu({},e);let{data:n,withXSRFToken:r,xsrfHeaderName:i,xsrfCookieName:l,headers:o,auth:a}=t;if(t.headers=o=Ni.from(o),t.url=_F(CF(t.baseURL,t.url,t.allowAbsoluteUrls),e.params,e.paramsSerializer),a&&o.set("Authorization","Basic "+btoa((a.username||"")+":"+(a.password?unescape(encodeURIComponent(a.password)):""))),Ue.isFormData(n)){if(Jr.hasStandardBrowserEnv||Jr.hasStandardBrowserWebWorkerEnv)o.setContentType(void 0);else if(Ue.isFunction(n.getHeaders)){const c=n.getHeaders(),u=["cont
```
```js
ertOptions(i,{encode:_l.function,serialize:_l.function},!0)),n.allowAbsoluteUrls!==void 0||(this.defaults.allowAbsoluteUrls!==void 0?n.allowAbsoluteUrls=this.defaults.allowAbsoluteUrls:n.allowAbsoluteUrls=!0),Gd.assertOptions(n,{baseUrl:_l.spelling("baseURL"),withXsrfToken:_l.spelling("withXSRFToken")},!0),n.method=(n.method||this.defaults.method||"get").toLowerCase();let o=l&&Ue.merge(l.common,l[n.method]);l&&Ue.forEach(["delete","get","head","post","put","patch","common"],y=>{delete l[y]}),n.headers=Ni.concat(o,l);const a=[];let c=!0;this.interceptors.request.forEach(function(v){if(typeof v.runWhen
```
```js
length;let g=n;for(;h<p;){const y=a[h++],v=a[h++];try{g=y(g)}catch(S){v.call(this,S);break}}try{d=VT.call(this,g)}catch(y){return Promise.reject(y)}for(h=0,p=u.length;h<p;)d=d.then(u[h++],u[h++]);return d}getUri(t){t=mu(this.defaults,t);const n=CF(t.baseURL,t.url,t.allowAbsoluteUrls);return _F(n,t.params,t.paramsSerializer)}};Ue.forEach(["delete","get","head","options"],function(t){su.prototype[t]=function(n,r){return this.request(mu(r||{},{method:t,url:n,data:(r||{}).data}))}});Ue.forEach(["post","put","patch"],function(t){function n(r){return function(l,o,a){return this.request(mu(a||{},{method:t,h
```


### H. request interceptor (auth header)
```js
d||"get").toLowerCase();let o=l&&Ue.merge(l.common,l[n.method]);l&&Ue.forEach(["delete","get","head","post","put","patch","common"],y=>{delete l[y]}),n.headers=Ni.concat(o,l);const a=[];let c=!0;this.interceptors.request.forEach(function(v){if(typeof v.runWhen=="function"&&v.runWhen(n)===!1)return;c=c&&v.synchronous;const S=n.transitional||bw;S&&S.legacyInterceptorReqResOrdering?a.unshift(v.fulfilled,v.rejected):a.push(v.fulfilled,v.rejected)});const u=[];this.interceptors.response.forEach(function(v){u.push(v.fulfilled,v.rejected)});let d,h=0,p;if(!c){const y=[VT.bind(this),void 0];for(y.unshift(...a),y.push(...u),p=y.length,d=Promise.resolve(n);h<p;)d=d.then(y[h++],y[h++]);return d}p=a.length;let g=n;for(;h<p
```
```js
)),vn.logout()}const Hn=Dn.create({baseURL:fr.apiUrl,headers:{"X-Requested-With":"XMLHttpRequest","X-Timezone":Intl.DateTimeFormat().resolvedOptions().timeZone,"Content-Type":"application/json"}});Hn.interceptors.request.use(async e=>{const t=await c7(),n=await Che(),r=u7(),i=_n.getState().token;if(!t){const o=new AbortController;return o.abort(),{...e,signal:o.signal}}e.headers.Authorization=`Bearer ${t}`,i&&(e.headers["X-pin-token"]=i),n&&(e.headers["X-Restaurant-Id"]=n),r&&r!=="default"&&r!=="internal"&&(e.headers["X-Tenant"]=r);const l=await G6e();return Object.entries(l).forEach(([o,a])=>{e.headers[o]=a}),e});function Ohe(){return Hn({url:"/restaurant",method:"get"}).then(e=>e.data)}function OBe(e,t,n){ret
```
```js
function(){var n=this;Vue.http.interceptors.push(function(r,i){n.socketId()&&r.headers.set("X-Socket-ID",n.socketId()),i()})}},{key:"registerAxiosRequestInterceptor",value:function(){var n=this;axios.interceptors.request.use(function(r){return n.socketId()&&(r.headers["X-Socket-Id"]=n.socketId()),r})}},{key:"registerjQueryAjaxSetup",value:function(){var n=this;typeof jQuery.ajax<"u"&&jQuery.ajaxPrefilter(function(r,i,l){n.socketId()&&l.setRequestHeader("X-Socket-Id",n.socketId())})}},{key:"registerTurboRequestInterceptor",value:function(){var n=this;document.addEventListener("turbo:before-fetch-request",function(r){r.detail.fetchOptions.headers["X-Socket-Id"]=n.socketId()})}}]),e}();const Do=Object.create(null)
```


### I. Authorization header construction
```js
=this.prototype;function l(o){const a=w1(o);r[a]||(OJ(i,o),r[a]=!0)}return Ue.isArray(t)?t.forEach(l):l(t),this}};Ni.accessor(["Content-Type","Content-Length","Accept","Accept-Encoding","User-Agent","Authorization"]);Ue.reduceDescriptors(Ni.prototype,({value:e},t)=>{let n=t[0].toUpperCase()+t.slice(1);return{get:()=>e,set(r){this[n]=r}}});Ue.freezeMethods(Ni);function Kp(e,t){const n=this||V4,r=t||n,i=Ni.from(r.headers);let l=r.data;return Ue.forEach(e,functi
```
```js
},e);let{data:n,withXSRFToken:r,xsrfHeaderName:i,xsrfCookieName:l,headers:o,auth:a}=t;if(t.headers=o=Ni.from(o),t.url=_F(CF(t.baseURL,t.url,t.allowAbsoluteUrls),e.params,e.paramsSerializer),a&&o.set("Authorization","Basic "+btoa((a.username||"")+":"+(a.password?unescape(encodeURIComponent(a.password)):""))),Ue.isFormData(n)){if(Jr.hasStandardBrowserEnv||Jr.hasStandardBrowserWebWorkerEnv)o.setContentType(void 0);else if(Ue.isFunction(n.getHeaders)){const c=n.g
```
```js
ientId];return!!G&&G.roles.indexOf(L)>=0},t.loadUserProfile=function(){var L=y()+"/account",$=new XMLHttpRequest;$.open("GET",L,!0),$.setRequestHeader("Accept","application/json"),$.setRequestHeader("Authorization","bearer "+t.token);var G=B();return $.onreadystatechange=function(){$.readyState==4&&($.status==200?(t.profile=JSON.parse($.responseText),G.setSuccess(t.profile)):G.setError())},$.send(),G.promise},t.loadUserInfo=function(){var L=t.endpoints.userin
```
```js
):G.setError())},$.send(),G.promise},t.loadUserInfo=function(){var L=t.endpoints.userinfo(),$=new XMLHttpRequest;$.open("GET",L,!0),$.setRequestHeader("Accept","application/json"),$.setRequestHeader("Authorization","bearer "+t.token);var G=B();return $.onreadystatechange=function(){$.readyState==4&&($.status==200?(t.userInfo=JSON.parse($.responseText),G.setSuccess(t.userInfo)):G.setError())},$.send(),G.promise},t.isTokenExpired=function(L){if(!t.tokenParsed||
```


### J. deliveryDurationTime origin
```js
tale:l.isStale,refetch:l.refetch}}function exe(){return Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProdu
```


### K. cookingTime origin
```js
ad:g,hasUnread:u,amountOfUnread:d,isStale:l.isStale,refetch:l.refetch}}function exe(){return Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order
```


### L. estimated_delivery_time handling
```js
ELIVERED}get is_cancelled(){return this.status===Jn.CANCELLED}get acceptance_time(){return Tz(Date.now(),this.created_at)}get pickup_time(){return this.delivery_service_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_sche
```
```js
n r.length?_6(i[n],r.join(".")):i[n]}}function oW(e,t,n){const[r,...i]=t.split("."),l=e;i.length?oW(l[r],i.join("."),n):l[r]=n}function di(e){const t=["placed_date","created_at","createdAt","cancelled_at","requested_time","restaurant_estimated_pickup_time","delivery_service_pickup_time","restaurant_estimated_delivery_time","delivery_service_delivery_time","nextAvailableAt","back_to_stock_at","context.estimatedAtDeliveryPointTime","context.estimatedAtRestaurantTime"],n=i=>(i.includes(" ")&&(i=i.replace(" ","T"),i.match(/([+-][0-9]{2}:[0-9]{2}|Z)$/)||(i+="Z")),i),r=i=>{t.forEach(l=>{if(_6(i,l)&&typeof _6(i,l)=="string
```
```js
&&typeof c[d]=="object"?r.push(...F_(a[d],c[d],`${o}.${u}`)):a[d]!==c[d]&&r.push(`${o}.${u}`)}):typeof a=="object"&&typeof c=="object"&&a&&c?r.push(...F_(a,c,o)):a!==c&&r.push(o)}),n?r.map(o=>n+"."+o):r)}const Vpe=(e,t)=>{const n=F_(e,t),r=n.filter(i=>["restaurant_estimated_pickup_time","restaurant_estimated_delivery_time","delivery_service_delivery_time","delivery_service_pickup_time"].includes(i));return n.length!==r.length||e.status!==t.status},Gpe="/assets/default_sound-CJXJpA04.mp3",Kpe="/assets/airhorn-DCQ3CCtK.mp3",Ype="/assets/alert1-DrbUK5E1.mp3",Qpe="/assets/alert2-DCHW8mCj.mp3",Xpe="/assets/alert3-BBdF0Cg
```
```js
s",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_li
```


### M. food_preparation_duration usages
```js
tOfUnread:d,isStale:l.isStale,refetch:l.refetch}}function exe(){return Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:`/orders/${e.id}/confirm-order`,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:
```


### N. scheduled-order handling
```js
er at","service_fee":"Service charge","delivery_fee":"Delivery fee","customer_paid":"The costumer paid","food_ready_at":"Food ready at","order_details":"Order details","products_list":"Product list","title_kitchen":"Kitchen","order_one_item":"item","requested_time":"Requested time","title_accepted":"Accepted","address_contact":"Address & Contact","order_cancelled":"This order has been cancelled","something_wrong":"Something wrong with the order?","title_cancelled":"Order cancelled","title_delivered":"Delivered","title_on_the_way":"On the way","no_order_selec
```
```js
ed_at)}get pickup_time(){return this.delivery_service_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requ
```
```js
){return this.delivery_service_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requested_time)&&N4(this.re
```
```js
aurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requested_time)&&N4(this.requested_time,new Date)>90}get is_next_day_scheduled()
```


### O. is_ready_for_kitchen
```js
turn this.is_own_delivery||this.is_unified_order_flow}can_change_confirmed_time_of_order(t){return this.is_own_delivery&&!t.is_cancelled&&!t.is_delivered&&!t.is_new}can_update_status_of_order(t){return!(this.is_unified_order_flow&&t.is_confirmed&&!t.is_ready_for_kitchen)}get is_own_delivery(){return this.delivery_service==="own_delivery"}get is_scoober(){return this.delivery_service==="scoober"}get is_3PL(){return["notime","stuart","yuso","doorhub","gastrokurier","fleetlery","quickzii","step","flink","haal","gastroflow"].includes(this.delivery_service)||this.order
```
```js
next_day_scheduled(){return this.requested_time!==null&&I7e(this.requested_time,D9e())}get has_unavailable_products(){return this.products.some(t=>t.is_available===!1)}is_waiting_for_courier(t){return t.is_unified_order_flow&&this.is_confirmed&&this.is_ready_for_kitchen!==!0}get is_paid(){return this.customer_total<=(this.payment?.already_paid_amount||0)||this.payment_type===As.ONLINE}get_courier_title(t,n){const r=this.couriers?.[0];return this.is_cancelled||!this.is_delivery?void 0:r?.full_name?r.full_name:t.is_unified_order_flow&&this.is_delivery?_he(this,n):vo
```
```js
efault"),toastId:typeof document>"u"?"order-update":`order-${o.id}`}),r.actions.receivedOrderUpdateFromSockets(o.id),o.is_cancelled){r.actions.orderCancelled(o.public_reference);return}const d=o.is_in_kitchen&&o.couriers.length>a.couriers.length,h=o.is_ready_for_kitchen&&!a.is_ready_for_kitchen;if(d||h){p7.getState().actions.pushNotification(n.reference,"PrepareOrder",o);return}}),Pz(l)});function dme(e){const t=new Au(di(e));fme(t)}const hme=dW(async e=>{const t=Ht.getQueryData(["restaurant"]);Pz(e),ux(t.ui_settings.incoming_order_sound??"default"),r7(yt.t("order
```


### P. error strings for transitions
```js
messages.main.error"));return;case 404:Bs(t??yt.t("orders.live_orders_messages.main.not_found"));return;case 403:if(e.response.data.reason==="pin_required"){Ht.invalidateQueries({queryKey:["restaurant"]}),ghe();return}if(e.response?.data?.message==="Wrong status transition!"){Ht.invalidateQueries({queryKey:["orders"]}),Nz("Order status transition failed.");return}Bs(t??yt.t("orders.live_orders_messages.main.forbidden"));return;default:console.error(`Request to ${e.response?.config.url} failed with status ${e.response?
```


### Q. issue-status endpoint
```js
",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:`/orders/${e.id}`,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:`/orders/${e.id}/issue-status`,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_list:e.menuProductIds}}).then(t=>di(t.data))}function zBe(e,t){const n=e.toISOString().split(".")[0]+"Z",r=t.toISOString().split(".")[0]+"Z";return Hn({url:`/orders/history?date_from=${n}&date_to=$
```


### R. auto-accept setting
_NOT FOUND IN BUNDLE_


### S. realtime channel
```js
ost===o.host&&(r=o.relative),Cn({category:"navigation",data:{from:r,to:i}})}}function Yoe(e){return!!e&&!!e.target}const Qoe=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","BroadcastChannel","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","SharedWorker","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest",
```
```js
value:function(n){this.namespace=n}}]),e}();function Lhe(e){try{new e}catch(t){if(t.message.includes("is not a constructor"))return!1}return!0}var nx=function(e){$i(n,e);var t=Ui(n);function n(r,i,l){var o;return Rr(this,n),o=t.call(this),o.name=i,o.pusher=r,o.options=l,o.eventFormatter=new qz(o.options.namespace),o.subscribe(),o}return Or(n,[{key:"subscribe",value:function(){this.subscription=this.pusher.subscribe(this.name)}},{key:"unsubscribe",value:function(){this.pusher.unsubscribe(this.name)}},{key:"listen",value:function(i,l){return this.on(th
```
```js
nction(e){$i(n,e);var t=Ui(n);function n(r,i,l){var o;return Rr(this,n),o=t.call(this),o.name=i,o.pusher=r,o.options=l,o.eventFormatter=new qz(o.options.namespace),o.subscribe(),o}return Or(n,[{key:"subscribe",value:function(){this.subscription=this.pusher.subscribe(this.name)}},{key:"unsubscribe",value:function(){this.pusher.unsubscribe(this.name)}},{key:"listen",value:function(i,l){return this.on(this.eventFormatter.format(i),l),this}},{key:"listenToAll",value:function(i){var l=this;return this.subscription.bind_global(function(o,a){if(!o.startsWit
```


### T. polling cadence
```js
e(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return v_(this.#t,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return v_(this.#t,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#_(),this.#w(),this.#t.removeObserver(this)}setOptions(e){const t=this.options,n=this.#t;if(this.options=this.#e.defaultQueryOptions(e),this.options.enabled!==void 0&&typeof this.options.enabled!="boolean"
```
```js
ime,this.#t);if(R4.isServer()||this.#i.isStale||!h_(e))return;const n=zH(this.#i.dataUpdatedAt,e)+1;this.#c=lu.setTimeout(()=>{this.#i.isStale||this.updateResult()},n)}#y(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#w(),this.#u=e,!(R4.isServer()||xl(this.options.enabled,this.#t)===!1||!h_(this.#u)||this.#u===0)&&(this.#f=lu.setInterval(()=>{(this.options.refetchInter
```
```js
Stale||!h_(e))return;const n=zH(this.#i.dataUpdatedAt,e)+1;this.#c=lu.setTimeout(()=>{this.#i.isStale||this.updateResult()},n)}#y(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#w(),this.#u=e,!(R4.isServer()||xl(this.options.enabled,this.#t)===!1||!h_(this.#u)||this.#u===0)&&(this.#f=lu.setInterval(()=>{(this.options.refetchIntervalInBackground||zS.isFocused())&&this.#d
```

