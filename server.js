// Plant Habitat server: static site + orders API + admin. No npm packages needed. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const PORT=process.env.PORT||3000,PASS=process.env.ADMIN_PASSWORD||'root',DB=path.join(__dirname,'data','orders.json');
const ROOT=__dirname,MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const W={};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'js/products.js'),'utf8'),{window:W});
const P=W.PRODUCTS,S=W.SHIPPING||{};
const FLOW={ship:['Received','Confirmed','Preparing','Shipped','Out for delivery','Delivered'],pick:['Received','Confirmed','Preparing','Ready for pick-up','Completed']};
fs.mkdirSync(path.dirname(DB),{recursive:true});
let orders=[];try{orders=JSON.parse(fs.readFileSync(DB,'utf8'))}catch(e){}
const save=()=>fs.writeFileSync(DB,JSON.stringify(orders,null,1));
const INQ=path.join(__dirname,'data','inquiries.json');
let inquiries=[];try{inquiries=JSON.parse(fs.readFileSync(INQ,'utf8'))}catch(e){}
const saveInq=()=>fs.writeFileSync(INQ,JSON.stringify(inquiries,null,1));
const tokens=new Set(),hits={};
const digits=s=>String(s||'').replace(/\D/g,'').slice(-10);
const pub=o=>({code:o.code,status:o.status,flow:FLOW[o.ship?'ship':'pick'],ship:o.ship,items:o.items,subtotal:o.subtotal,fee:o.fee,total:o.total,address:o.address,created:o.created,history:o.history,name:o.name,review:o.review||null});
function json(res,c,d){res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(d))}
function body(req){return new Promise((ok,no)=>{let b='';req.on('data',c=>{b+=c;if(b.length>2e5){req.destroy();no()}});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(e){no(e)}})})}
const admin=req=>tokens.has((req.headers.authorization||'').replace('Bearer ',''));
function build(d){
  if(!d.name||!digits(d.phone)||!Array.isArray(d.cart)||!d.cart.length)return{err:'Please fill in your name, phone and at least one item.'};
  let sub=0,items=[];
  for(const l of d.cart){const p=P.find(x=>x.id===l.id),v=p&&p.variants?p.variants[l.v]:null,q=Math.min(99,Math.max(1,+l.q|0));
    if(!p||p.available===false||(p.variants&&(!v||v.available===false)))return{err:'An item is no longer available.'};
    const pr=v&&v.price!=null?v.price:p.price;if(pr==null)return{err:'An item has no price yet. Please call us.'};
    sub+=pr*q;items.push({name:p.name+(v?' ('+v.name+')':''),q,price:pr})}
  let fee=0,a=null;
  if(d.ship){a=d.address||{};if(!a.street||!a.city||!a.barangay)return{err:'Please complete your delivery address.'};
    const c=(a.city+' '+a.barangay).toLowerCase(),near=(S.nearAreas||[]).some(n=>c.includes(n.toLowerCase()));fee=(near?S.nearFee:S.farFee)||0}
  return{o:{code:'PH-'+crypto.randomBytes(3).toString('hex').toUpperCase(),status:'Received',ship:!!d.ship,name:String(d.name).slice(0,80),phone:String(d.phone).slice(0,30),email:String(d.email||'').slice(0,80),notes:String(d.notes||'').slice(0,300),items,subtotal:sub,fee,total:sub+fee,address:a,created:Date.now(),history:[{s:'Received',t:Date.now()}]}}}
http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://x'),p=u.pathname;
  try{
    if(p==='/api/orders'&&req.method==='POST'){const ip=req.socket.remoteAddress;hits[ip]=(hits[ip]||0)+1;setTimeout(()=>hits[ip]--,6e4);if(hits[ip]>10)return json(res,429,{error:'Too many orders. Try again later.'});
      const r=build(await body(req));if(r.err)return json(res,400,{error:r.err});orders.push(r.o);save();return json(res,201,pub(r.o))}
    if(p==='/api/inquiries'&&req.method==='POST'){const ip='i'+req.socket.remoteAddress;hits[ip]=(hits[ip]||0)+1;setTimeout(()=>hits[ip]--,6e4);if(hits[ip]>5)return json(res,429,{error:'Too many messages. Please try again in a minute.'});
      const d=await body(req),c=(x,n)=>String(x==null?'':x).trim().slice(0,n);
      const q={id:Date.now().toString()+Math.floor(Math.random()*10),name:c(d.name,80),contact:c(d.contact,120),interest:c(d.interest,120),message:c(d.message,1500),created:Date.now(),read:false};
      if(!q.name||!q.contact)return json(res,400,{error:'Please enter your name and your phone or email.'});
      inquiries.push(q);saveInq();return json(res,201,{ok:true})}
    if(p==='/api/mine'&&req.method==='POST'){const d=await body(req),out=[];for(const k of(d.list||[]).slice(0,20)){const o=orders.find(x=>x.code===String(k.code).toUpperCase().trim()&&digits(x.phone)===digits(k.phone));if(o&&!out.includes(o))out.push(o)}return json(res,200,out.sort((a,b)=>b.created-a.created).map(pub))}
    if(p==='/api/review'&&req.method==='POST'){const d=await body(req),o=orders.find(x=>x.code===String(d.code).toUpperCase()&&digits(x.phone)===digits(d.phone));
      if(!o||!['Delivered','Completed'].includes(o.status)||o.review)return json(res,400,{error:'Cannot review this order.'});
      o.review={rating:Math.min(5,Math.max(1,+d.rating|0)),text:String(d.text||'').slice(0,500),t:Date.now()};save();return json(res,200,pub(o))}
    if(p==='/api/track'&&req.method==='GET'){const o=orders.find(x=>x.code===(u.searchParams.get('code')||'').toUpperCase().trim());
      if(!o||digits(o.phone)!==digits(u.searchParams.get('phone')))return json(res,404,{error:'No order found. Check your order number and phone.'});return json(res,200,pub(o))}
    if(p==='/api/admin/login'&&req.method==='POST'){const d=await body(req);if(d.password!==PASS)return json(res,401,{error:'Wrong password'});const t=crypto.randomBytes(20).toString('hex');tokens.add(t);return json(res,200,{token:t})}
    if(p.startsWith('/api/admin/')){if(!admin(req))return json(res,401,{error:'Login required'});
      if(p==='/api/admin/orders')return json(res,200,orders.slice().reverse().map(o=>Object.assign(pub(o),{phone:o.phone,email:o.email,notes:o.notes})));
      if(p==='/api/admin/inquiries'&&req.method==='GET')return json(res,200,inquiries.slice().reverse());
      const qm=p.match(/^\/api\/admin\/inquiries\/(\d+)$/);if(qm&&req.method==='PATCH'){const q=inquiries.find(x=>x.id===qm[1]),d=await body(req);
        if(!q)return json(res,404,{error:'Not found'});q.read=!!d.read;saveInq();return json(res,200,q)}
      const m=p.match(/^\/api\/admin\/orders\/([\w-]+)$/);if(m&&req.method==='PATCH'){const o=orders.find(x=>x.code===m[1]),d=await body(req);
        if(!o)return json(res,404,{error:'Not found'});if(![...FLOW.ship,...FLOW.pick,'Cancelled'].includes(d.status))return json(res,400,{error:'Bad status'});
        o.status=d.status;o.history.push({s:d.status,t:Date.now()});save();return json(res,200,pub(o))}}
    let f=path.normalize(path.join(ROOT,p==='/'?'index.html':p));
    if(p==='/admin')f=path.join(ROOT,'admin.html');
    const rel=path.relative(ROOT,f);if(rel.startsWith('..')||/^(data|server\.js)/.test(rel)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
  }catch(e){json(res,500,{error:'Server error'})}
}).listen(PORT,()=>console.log('Plant Habitat running on http://localhost:'+PORT+(PASS==='root'?'  (WARNING: set ADMIN_PASSWORD)':'')+'  Admin: /admin'));
