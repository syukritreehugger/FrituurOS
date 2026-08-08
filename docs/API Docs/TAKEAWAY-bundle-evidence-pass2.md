# JET bundle — deep evidence (pass 2, trimmed)

Each snippet is a bounded slice around the match.

## axios baseURL
```
,d){if(!Ue.isUndefined(d))return r(void 0,d)}function o(u,d){if(Ue.isUndefined(d)){if(!Ue.isUndefined(u))return r(void 0,u)}else return r(void 0,d)}function a(u,d,h){if(h in t)return r(u,d);if(h in e)return r(void 0,u)}const c={url:l,method:l,data:l,baseURL:o,transformRequest:o,transformResponse:o,paramsSerializer:o,timeout:o,timeoutMessage:o,withCredentials:o,withXSRFToken:o,adapter:o,responseType:o,xsrfCookieName:o,xsrfHeaderName:o,onUploadProgress:o,onDownloadProgress:o,decompress:o,maxContentLength:o,maxBodyLength:o,beforeRedirect:o,transport:o,httpAgent:o,httpsAgent:o,cancelToken:o,socketPath:o,r
```
```
e().actions.logoutStarted(),await Promise.allSettled([Fz(),Lz("[Auth] User logged out",{reason:e}),_n.getState().actions.setToken(null)]),["isJetEmployee","selectedRestaurantId"].forEach(t=>localStorage.removeItem(t)),vn.logout()}const Hn=Dn.create({baseURL:fr.apiUrl,headers:{"X-Requested-With":"XMLHttpRequest","X-Timezone":Intl.DateTimeFormat().resolvedOptions().timeZone,"Content-Type":"application/json"}});Hn.interceptors.request.use(async e=>{const t=await c7(),n=await Che(),r=u7(),i=_n.getState().token;if(!t){const o=new AbortController;return o.abort(),{...e,signal:o.signal}}e.headers.Authorizati
```
```
turn ve(void 0,Qe)}function Ne(et,Qe){if(ge.isUndefined(Qe)){if(!ge.isUndefined(et))return ve(void 0,et)}else return ve(void 0,Qe)}function ze(et,Qe,ct){if(ct in fe)return ve(et,Qe);if(ct in ue)return ve(void 0,et)}const nt={url:Me,method:Me,data:Me,baseURL:Ne,transformRequest:Ne,transformResponse:Ne,paramsSerializer:Ne,timeout:Ne,timeoutMessage:Ne,withCredentials:Ne,withXSRFToken:Ne,adapter:Ne,responseType:Ne,xsrfCookieName:Ne,xsrfHeaderName:Ne,onUploadProgress:Ne,onDownloadProgress:Ne,decompress:Ne,maxContentLength:Ne,maxBodyLength:Ne,beforeRedirect:Ne,transport:Ne,httpAgent:Ne,httpsAgent:Ne,cancelT
```

## request interceptor (auth)
```
d||"get").toLowerCase();let o=l&&Ue.merge(l.common,l[n.method]);l&&Ue.forEach(["delete","get","head","post","put","patch","common"],y=>{delete l[y]}),n.headers=Ni.concat(o,l);const a=[];let c=!0;this.interceptors.request.forEach(function(v){if(typeof v.runWhen=="function"&&v.runWhen(n)===!1)return;c=c&&v.synchronous;const S=n.transitional||bw;S&&S.legacyInterceptorReqResOrdering?a.unshift(v.fulfilled,v.rejected):a.push(v.fulfilled,v.rejected)});const u=[];this.interceptors.response.forEach(function(v){u.push(v.fulfilled,v.rejected)});let d,h=0,p;if(!c){const y=[VT.bind(this),void 0];for(y.unshift(...a),y.push(...u),p=y.length,d=Promise.resolve(n);h<p;)d=d.then(y[h++],y[h++]);return d}p=a.length;let g=n;for(;h<p
```
```
)),vn.logout()}const Hn=Dn.create({baseURL:fr.apiUrl,headers:{"X-Requested-With":"XMLHttpRequest","X-Timezone":Intl.DateTimeFormat().resolvedOptions().timeZone,"Content-Type":"application/json"}});Hn.interceptors.request.use(async e=>{const t=await c7(),n=await Che(),r=u7(),i=_n.getState().token;if(!t){const o=new AbortController;return o.abort(),{...e,signal:o.signal}}e.headers.Authorization=‘Bearer ${t}‘,i&&(e.headers["X-pin-token"]=i),n&&(e.headers["X-Restaurant-Id"]=n),r&&r!=="default"&&r!=="internal"&&(e.headers["X-Tenant"]=r);const l=await G6e();return Object.entries(l).forEach(([o,a])=>{e.headers[o]=a}),e});function Ohe(){return Hn({url:"/restaurant",method:"get"}).then(e=>e.data)}function OBe(e,t,n){ret
```

## response interceptor (errors)
```
nction"&&v.runWhen(n)===!1)return;c=c&&v.synchronous;const S=n.transitional||bw;S&&S.legacyInterceptorReqResOrdering?a.unshift(v.fulfilled,v.rejected):a.push(v.fulfilled,v.rejected)});const u=[];this.interceptors.response.forEach(function(v){u.push(v.fulfilled,v.rejected)});let d,h=0,p;if(!c){const y=[VT.bind(this),void 0];for(y.unshift(...a),y.push(...u),p=y.length,d=Promise.resolve(n);h<p;)d=d.then(y[h++],y[h++]);return d}p=a.length;let g=n;for(;h<p;){const y=a[h++],v=a[h++];try{g=y(g)}catch(S){v.call(this,S);break}}try{d=VT.call(this,g)}catch(y){return Promise.reject(y)}for(h=0,p=u.length;h<p;)d=d.then(u[h++],u[h++]);return d}getUri(t){t=mu(this.defaults,t);const n=CF(t.baseURL,t.url,t.allowAbsoluteUrls);retu
```
```
hen(ye)===!1)return;nt=nt&&ft.synchronous;const rt=ye.transitional||ho;rt&&rt.legacyInterceptorReqResOrdering?ze.unshift(ft.fulfilled,ft.rejected):ze.push(ft.fulfilled,ft.rejected)});const et=[];this.interceptors.response.forEach(function(ft){et.push(ft.fulfilled,ft.rejected)});let Qe,ct=0,un;if(!nt){const Je=[y2.bind(this),void 0];for(Je.unshift(...ze),Je.push(...et),un=Je.length,Qe=Promise.resolve(ye);ct<un;)Qe=Qe.then(Je[ct++],Je[ct++]);return Qe}un=ze.length;let Sr=ye;for(;ct<un;){const Je=ze[ct++],ft=ze[ct++];try{Sr=Je(Sr)}catch(rt){ft.call(this,rt);break}}try{Qe=y2.call(this,Sr)}catch(Je){return Promise.reject(Je)}for(ct=0,un=et.length;ct<un;)Qe=Qe.then(et[ct++],et[ct++]);return Qe}getUri(fe){fe=xi(this.de
```

## API host / env
```
.useCallback((o,a)=>{r.mutate(o,a).catch(fi)},[r]);if(i.error&&GS(r.options.throwOnError,[i.error]))throw i.error;return{...i,mutate:l,mutateAsync:i.mutate}}const fr={env:"production",apiUrl:"https://live-orders-api.takeaway.com/api",liveOrdersUrl:"https://live-orders.takeaway.com/",courierAppUrl:"https://courierapp.takeaway.com/",socketHost:"https://live-orders-socket.takeaway.com",fcmVapidKey:"BM27tWtVWjo79H0oQZ4rl0-_NIXLysIJeIf_XrcHporYhtZp7bStD61bxBXYuI4P5G
```

## auto-accept setting
_NOT FOUND_

## revert flag + transition rule
```
r_flow!==zm&&(this.is_own_delivery||this.is_3PL)}get can_change_default_delivery_duration(){return this.order_flow!==zm&&this.is_own_delivery}can_change_cooking_duration_of_order(t){return!((this.is_3PL||this.is_scoober||this.is_delco||this.is_haal)&&this.is_courier_first&&t.is_delivery)}can_change_delivery_duration_of_order(t){return!this.is_courier_first&&this.is_own_delivery&&t.is_delivery}get can_revert_order_status(){return this.is_own_delivery||this.is_unified_order_flow}can_change_confirmed_time_of_order(t){return this.is_own_delivery&&!t.is_cancelled&&!t.is_delivered&&!t.is_new}can_update_status_of_order(t){return!(this.is_unified_order_flow&&t.is_confirmed&&!t.is_ready_for_kitchen)}get is_own_delivery(){return this.delivery_service==="own_delivery"}get i
```
```
(e=>e.data)}function Hpe(){return Hn({url:"/notifications/read-all",method:"post"}).then(e=>e.data)}function zpe(e){return Hn({url:‘/notifications/${e}/read‘,method:"post"}).then(t=>t.data)}const tg=e=>{const t=h7(e);jI(e),r7(t,{onClose:()=>zpe(e.id).then(r=>jI(r)).catch(r=>!1)})},Wpe=(e,t,n)=>{const r=ZO.findIndex(l=>l===e.status),i=ZO.findIndex(l=>l===t.status);return e.status===Jn.CANCELLED||n.can_revert_order_status&&e.is_in_delivery&&t.is_in_kitchen?!1:r>i};function F_(e,t,n){if(!e&&!t)return[];const r=[],i=Object.keys(e),l=Object.keys(t);return i.length!==l.length?[]:(i.forEach(o=>{const a=e[o],c=t[o];if(!a||!c)return[];a instanceof Date&&c instanceof Date&&!D7e(a,c)?r.push(o):Array.isArray(a)&&Array.isArray(c)?a.length!==c.length?r.push(o):Object.keys(a).f
```

## transition index validation
```
ns.main.hours_ago",{hours:Math.round(t/60)})}function qpe(){return Hn({url:"/notifications",method:"get"}).then(e=>e.data)}function Hpe(){return Hn({url:"/notifications/read-all",method:"post"}).then(e=>e.data)}function zpe(e){return Hn({url:‘/notifications/${e}/read‘,method:"post"}).then(t=>t.data)}const tg=e=>{const t=h7(e);jI(e),r7(t,{onClose:()=>zpe(e.id).then(r=>jI(r)).catch(r=>!1)})},Wpe=(e,t,n)=>{const r=ZO.findIndex(l=>l===e.status),i=ZO.findIndex(l=>l===t.status);return e.status===Jn.CANCELLED||n.can_revert_order_status&&e.is_in_delivery&&t.is_in_kitchen?!1:r>i};function F_(e,t,n){if(!e&&!t)return[];const r=[],i=Object.keys(e),l=Object.keys(t);return i.length!==l.length?[]:(i.forEach(o=>{const a=e[o],c=t[o];if(!a||!c)return[];a instanceof Date&&c instanceof Date&&!D7e(a,c)?r.push(o):Array.isArray(a)&&Array
```

## status values the UI sends
```
t:14,specifications:[],menu_product_id:"menu-1",partner_product_ids:[],is_available:!0,...e}),_Ee=(e={})=>({id:Math.floor(Math.random()*1e3),public_reference:‘#${Math.random().toString(36).substring(2,8)}‘,created_at:new Date("2020-09-22T19:00:46Z"),status:Jn.NEW,placed_date:new Date("2020-09-22T19:00:46Z"),delivery_type:"delivery",requested_time:new Date("2020-09-21T19:46:46Z"),payment_type:"visa",restaurant_estimated_pickup_time:new Date("2020-09-21T20:46:4
```
```
)=>Gr(e=>e.actions),kn=to,REe=e=>document.querySelector(‘[data-training-id="${e}"]‘),Tr=(e,t)=>()=>{Gr.getState().actions.callUIMethod(e,t)},$d=Tr("navigation","open"),sL=Tr("navigation","closePauseRestaurant"),uL=Tr("notifications","open"),N0={id:0,status:Jn.CONFIRMED,delivery_type:oz,public_reference:"DEMO",customer:{city:"Amsterdam",company_name:null,full_name:"Oliver S.",phone_number:"0208 736 2000",display_phone_number:"0208 736 2000",postcode:"2054DJ",street:
```
```
stimated_delivery_time:p6(new Date,20),restaurant_estimated_pickup_time:p6(new Date,20),products:[JV({name:"Maestro Burger",remarks:null,code:"DEMO"})]},Ux=e=>{const t=O7({...N0,...e});Gr.getState().actions.setTestOrder(t)},tG=()=>{const e=O7({...N0,status:Jn.NEW});Gr.getState().actions.setTestOrder(e)},OEe=()=>{const e=O7(N0);Gr.getState().actions.setTestOrder(e)},qx=e=>{const t=O7({...N0,...e});Gr.getState().actions.setTestOrderDetails(t)},Cl=()=>{Gr.getSta
```
```
te().actions.setTestOrder(null),Gr.getState().actions.setTestOrderDetails(null),Ht.invalidateQueries({queryKey:["orders"]}),Tr("prepareTab","select")()},Gv=()=>{Tr("notifications","close")()},cL=()=>{Cl(),OEe()},IEe=()=>{Cl(),tG()},nG=()=>{Ux({...N0,status:Jn.KITCHEN}),qx({...N0,status:Jn.KITCHEN})},DEe=()=>{Cl(),nG()},BEe=()=>{Cl(),Ux({status:Jn.DELIVERED}),Tr("doneTab","select")()},fL=()=>{Cl(),Ux({status:Jn.IN_DELIVERY}),Tr("handoverTab","select")()},NEe=()=>{
```
```
),Gr.getState().actions.setTestOrderDetails(null),Ht.invalidateQueries({queryKey:["orders"]}),Tr("prepareTab","select")()},Gv=()=>{Tr("notifications","close")()},cL=()=>{Cl(),OEe()},IEe=()=>{Cl(),tG()},nG=()=>{Ux({...N0,status:Jn.KITCHEN}),qx({...N0,status:Jn.KITCHEN})},DEe=()=>{Cl(),nG()},BEe=()=>{Cl(),Ux({status:Jn.DELIVERED}),Tr("doneTab","select")()},fL=()=>{Cl(),Ux({status:Jn.IN_DELIVERY}),Tr("handoverTab","select")()},NEe=()=>{Cl(),nG()},MEe=()=>qx({status:
```

## issue-status endpoint
```
livery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:‘/orders/${e.id}‘,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:‘/orders/${e.id}/issue-status‘,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_list:e.menuProductIds}}).then(t=>di(t.data))}function zBe(e,t){const n=e.toISOString().split(".")[0]+"Z",r=t.toISOString().split(".")[0]+"Z";return Hn({url:‘/orders/history?date_from=${n}&date_to=${r}‘,method:"get"}).then(i=>di(i.data))}function W
```

## realtime transport
```
ion",data:{from:r,to:i}})}}function Yoe(e){return!!e&&!!e.target}const Qoe=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","BroadcastChannel","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","SharedWorker","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest",
```
```
ons.broadcaster=="reverb")this.connector=new $I(M4(M4({},this.options),{cluster:""}));else if(this.options.broadcaster=="pusher")this.connector=new $I(this.options);else if(this.options.broadcaster=="socket.io")this.connector=new UI(this.options);else if(this.options.broadcaster=="null")this.connector=new Hhe(this.options);else if(typeof this.options.broadcaster=="function"&&Lhe(this.options.broadcaster))this.connector=new this.options.broadcaster(this.options);else throw new Error("Broadcaster ".concat(
```
```
id,t.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case Ut.EVENT:case Ut.BINARY_EVENT:this.onevent(t);break;case Ut.ACK:case Ut.BINARY_ACK:this.onack(t);break;case Ut.DISCONNECT:this.ondisconnect();break;case Ut.CONNECT_ERROR:this.destroy();const r=new Error(t.data.message);r.data=t.data.data,this.emitRe
```

## polling cadence
```
ime,this.#t);if(R4.isServer()||this.#i.isStale||!h_(e))return;const n=zH(this.#i.dataUpdatedAt,e)+1;this.#c=lu.setTimeout(()=>{this.#i.isStale||this.updateResult()},n)}#y(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#w(),this.#u=e,!(R4.isServer()||xl(this.options.enabled,this.#t)===!1||!h_(this.#u)||this.#u===0)&&(this.#f=lu.setInterval(()=>{(this.options.refetchInter
```
```
Stale||!h_(e))return;const n=zH(this.#i.dataUpdatedAt,e)+1;this.#c=lu.setTimeout(()=>{this.#i.isStale||this.updateResult()},n)}#y(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#w(),this.#u=e,!(R4.isServer()||xl(this.options.enabled,this.#t)===!1||!h_(this.#u)||this.#u===0)&&(this.#f=lu.setInterval(()=>{(this.options.refetchIntervalInBackground||zS.isFocused())&&this.#d
```
```
i.dataUpdatedAt,e)+1;this.#c=lu.setTimeout(()=>{this.#i.isStale||this.updateResult()},n)}#y(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(this.#t):this.options.refetchInterval)??!1}#v(e){this.#w(),this.#u=e,!(R4.isServer()||xl(this.options.enabled,this.#t)===!1||!h_(this.#u)||this.#u===0)&&(this.#f=lu.setInterval(()=>{(this.options.refetchIntervalInBackground||zS.isFocused())&&this.#d()},this.#u))}#b(){this.#g(),this.#v(t
```

## scheduled/preorder handling
```
e":"Delivery fee","customer_paid":"The costumer paid","food_ready_at":"Food ready at","order_details":"Order details","products_list":"Product list","title_kitchen":"Kitchen","order_one_item":"item","requested_time":"Requested time","title_accepted":"Accepted","address_contact":"Address & Contact","order_cancelled":"This order has been cancelled","something_wrong":"Something wrong with the order?","title_cancelled":"Order cancelled","title_delivered":"Delivered","title_on_the_way":"On the way","no_order_selec
```
```
ice_pickup_time||this.restaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requ
```
```
estaurant_estimated_pickup_time}get delivery_time(){return this.delivery_service_delivery_time||this.restaurant_estimated_delivery_time}get minutes_until_preorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requested_time)&&N4(this.re
```

## is_ready_for_kitchen
```
turn this.is_own_delivery||this.is_unified_order_flow}can_change_confirmed_time_of_order(t){return this.is_own_delivery&&!t.is_cancelled&&!t.is_delivered&&!t.is_new}can_update_status_of_order(t){return!(this.is_unified_order_flow&&t.is_confirmed&&!t.is_ready_for_kitchen)}get is_own_delivery(){return this.delivery_service==="own_delivery"}get is_scoober(){return this.delivery_service==="scoober"}get is_3PL(){return["notime","stuart","yuso","doorhub","gastrokurier","fleetlery","quickzii","step","flink","haal","gastroflow"].includes(this.delivery_service)||this.order
```
```
next_day_scheduled(){return this.requested_time!==null&&I7e(this.requested_time,D9e())}get has_unavailable_products(){return this.products.some(t=>t.is_available===!1)}is_waiting_for_courier(t){return t.is_unified_order_flow&&this.is_confirmed&&this.is_ready_for_kitchen!==!0}get is_paid(){return this.customer_total<=(this.payment?.already_paid_amount||0)||this.payment_type===As.ONLINE}get_courier_title(t,n){const r=this.couriers?.[0];return this.is_cancelled||!this.is_delivery?void 0:r?.full_name?r.full_name:t.is_unified_order_flow&&this.is_delivery?_he(this,n):vo
```

## delivery_type comparisons
```
reorder(){return this.requested_time?N4(this.requested_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requested_time)&&N4(this.requested_time,new Date)>90}get is_next_day_scheduled(){ret
```
```
sted_time,new Date):0}get is_asap(){return this.requested_time===null}get is_preorder(){return this.requested_time!==null}get is_pickup(){return this.delivery_type===o8e}get is_delivery(){return this.delivery_type===oz}get is_scheduled(){return this.requested_time!==null&&M7e(this.requested_time)&&N4(this.requested_time,new Date)>90}get is_next_day_scheduled(){return this.requested_time!==null&&I7e(this.requested
```

## deliveryDurationTime origin
```
eturn Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:‘/orders/${e.id}/confirm-order‘,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url:‘/orders/${e.id}‘,method:"patch",data:{status:e.status}}).then(t=>di(t.data))}function HBe(e){return Hn({url:‘/orders/${e.id}/issue-status‘,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProdu
```

## restaurant settings endpoint
```
="default"&&r!=="internal"&&(e.headers["X-Tenant"]=r);const l=await G6e();return Object.entries(l).forEach(([o,a])=>{e.headers[o]=a}),e});function Ohe(){return Hn({url:"/restaurant",method:"get"}).then(e=>e.data)}function OBe(e,t,n){return Hn({url:‘/restaurant/setting/${e}‘,method:"patch",data:{name:t,value:n}})}function Ihe(e,t,n){return Hn({url:"/restaurant/worktime/slot",method:"post",data:{type:e,reason:t,duration:n}}).then(r=>r.data)}function Dhe(e){return Hn({url:‘/restaurant/worktime/${e}‘,method:"delete"}).then(t=>t.data)}const zn=()=>O6e({queryKey:["res
```

## date wire format
```
rgentNotifications:c,markAllAsRead:g,hasUnread:u,amountOfUnread:d,isStale:l.isStale,refetch:l.refetch}}function exe(){return Hn({url:"/orders",method:"get"}).then(e=>di(e.data))}function UBe(e){const t=e.estimatedDeliveryTime?e.estimatedDeliveryTime.toISOString().split(".")[0]+"Z":null;return Hn({url:‘/orders/${e.id}/confirm-order‘,method:"post",data:{food_preparation_duration:e.cookingTime,delivery_time_duration:e.deliveryDurationTime,estimated_delivery_time:t}}).then(n=>di(n.data))}function qBe(e){return Hn({url
```
```
=>di(t.data))}function HBe(e){return Hn({url:‘/orders/${e.id}/issue-status‘,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_list:e.menuProductIds}}).then(t=>di(t.data))}function zBe(e,t){const n=e.toISOString().split(".")[0]+"Z",r=t.toISOString().split(".")[0]+"Z";return Hn({url:‘/orders/history?date_from=${n}&date_to=${r}‘,method:"get"}).then(i=>di(i.data))}function WBe(e){const t=e.dateFrom.toISOString().split(".")[0]+"Z",n=e.dateTo.toISOString().split(".")[0]
```
```
 Hn({url:‘/orders/${e.id}/issue-status‘,method:"post",data:{status:"order_issue",partner_product_id_list:e.partnerProductIds,menu_product_id_list:e.menuProductIds}}).then(t=>di(t.data))}function zBe(e,t){const n=e.toISOString().split(".")[0]+"Z",r=t.toISOString().split(".")[0]+"Z";return Hn({url:‘/orders/history?date_from=${n}&date_to=${r}‘,method:"get"}).then(i=>di(i.data))}function WBe(e){const t=e.dateFrom.toISOString().split(".")[0]+"Z",n=e.dateTo.toISOString().split(".")[0]+"Z";return Hn({url:‘/orders/history
```

## transition error string
```
messages.main.error"));return;case 404:Bs(t??yt.t("orders.live_orders_messages.main.not_found"));return;case 403:if(e.response.data.reason==="pin_required"){Ht.invalidateQueries({queryKey:["restaurant"]}),ghe();return}if(e.response?.data?.message==="Wrong status transition!"){Ht.invalidateQueries({queryKey:["orders"]}),Nz("Order status transition failed.");return}Bs(t??yt.t("orders.live_orders_messages.main.forbidden"));return;default:console.error(‘Request to ${e.response?.config.url} failed with status ${
```
