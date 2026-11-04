// ================= CSS bổ sung cho bảng thông tin nút =================
(function(){const st=document.createElement('style');st.textContent=`
#info .nbadge{display:flex;align-items:center;gap:8px;margin:2px 0 8px}
#info .nbadge b{min-width:30px;height:30px;padding:0 6px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--c);color:#111;font-size:15px}
#info .nbadge span{font-weight:700;color:var(--c)}
#info .nbadge.root{--c:#fab005}#info .nbadge.br{--c:#4dabf7}#info .nbadge.leaf{--c:#40c057}
#info .ngrid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:4px}
#info .ngrid div{background:rgba(127,127,127,.16);border-radius:8px;padding:4px 2px;text-align:center;line-height:1.2}
#info .ngrid small{display:block;opacity:.72;font-size:10.5px}
#info .ngrid b{font-size:15px}
#info .ngrid .k{box-shadow:inset 0 0 0 1px rgba(255,146,43,.7)}
#info .npath{margin-top:6px;font-size:12px}
#info .nhelp{display:block;opacity:.68;margin-top:6px;font-size:10.5px;line-height:1.35}
#mbd .tm{font-size:13px;line-height:1.5}
`;document.head.appendChild(st)})();

// ================= XÓA NÚT TRÊN BST (3 trường hợp) =================
// Quy ước nhất quán: nút có 2 con → dùng NÚT KẾ NHIỆM (trái nhất của cây con phải = giá trị nhỏ nhất bên phải)
const succ=n=>{let s=n.r;while(s.l)s=s.l;return s};
function bstRemove(n){
  const p=par(n),setP=c=>{if(!p)root=c;else if(p.l===n)p.l=c;else p.r=c};
  if(!n.l&&!n.r){setP(null);return 'Trường hợp 1: đã xóa nút lá '+n.v+' (con trỏ của cha đặt về NULL)'}
  if(!n.l||!n.r){const c=n.l||n.r;setP(c);return 'Trường hợp 2: con '+c.v+' nối thẳng lên cha, thay vị trí nút '+n.v}
  const s=succ(n),ps=par(s),old=n.v;
  if(ps===n)n.r=s.r;else ps.l=s.r;          // gỡ nút kế nhiệm khỏi vị trí cũ (nó không có con trái, chỉ có thể có con phải)
  n.v=s.v;
  return 'Trường hợp 3: nút kế nhiệm '+s.v+' lên thay vị trí nút '+old}

// ================= TẠO CÂY ĐỘC LẬP (không dựa vào cây đang có) =================
function bstInsert(t,v){const m=mk(v);if(!t)return m;let c=t;for(;;){if(v===c.v)return t;const d=v<c.v?'l':'r';if(!c[d]){c[d]=m;return t}c=c[d]}}
function bstFromList(txt){
  if(/[()]/.test(txt)){const t=parseStr(txt);return t?{t,dup:0,n:lsz(t)}:null}   // vẫn hiểu dạng cũ v(trái,phải)
  const A=(txt.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);if(!A.length)return null;
  let t=null,dup=0;A.forEach(v=>{const b=t?lsz(t):0;t=bstInsert(t,v);if(lsz(t)==b)dup++});
  return{t,dup,n:A.length-dup}}

// ================= GIAO DIỆN =================
let MOK=null;
let MXC=null;
function modal(t,h,ok,txt,cancel,ctxt,low){const _d=$('#mxd');if(_d)_d.remove();$('#mo').className=low?'q':'';MXC=cancel||null;$('#mx').textContent=ctxt||'Đóng';$('#mh').textContent=t;$('#mbd').innerHTML=h;$('#mo').style.display='flex';MOK=ok;$('#mok').style.display=ok?'':'none';$('#mok').textContent=txt||'Xác nhận'}
// thanh xác nhận GỌN ở đáy màn hình (không che cây, vẫn kéo/chạm được phía trên)
function bar(h){$('#mo').className='q c';MXC=null;MOK=null;$('#mh').textContent='';$('#mbd').innerHTML=h;$('#mo').style.display='flex';$('#mok').style.display='none'}
const close=()=>{$('#mo').style.display='none';const _d=$('#mxd');if(_d)_d.remove();$('#mo').className='';MOK=null;MXC=null;$('#mx').textContent='Đóng'};
$('#mok').onclick=()=>{const b=H.snap();if(MOK&&MOK()===false)return;H.push(b);close();refresh()};$('#mx').onclick=()=>{const f=MXC;close();if(f)f()};
const X={};$('#mbd').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b&&X[b.dataset.x])X[b.dataset.x]()});
$('#mbd').addEventListener('input',e=>{const t=e.target;if(t.id=='sb')S.bright=+t.value;if(t.id=='ss')S.size=+t.value;if(t.id=='sn')S.snd=t.checked;if(t.id=='sg'){S.notes=t.checked;ui()}
  if(t.id=='sth'){TH.m=t.value=='light'?'light':'dark';try{localStorage.setItem('arbt_theme',TH.m)}catch(_){}applyTheme()}sync()});
const F=(id,l,v='',ty='text')=>`<label>${l}</label><input id="${id}" type="${ty}" value="${esc(v)}">`;
const fields=n=>F('f1','Khoá v',n?n.v:'','number');
function recFrom(){const a=$('#f1').value.trim();if(!a||!Number.isFinite(+a)){toast('Khoá phải là số');return null}return{v:+a}}
const sure=(t,msg,fn,txt)=>modal(t,'<p>'+msg+'</p>',()=>{fn()},txt||'Đồng ý',null,'Hủy');   // hộp xác nhận cho thao tác làm mất cây
const OP={
 ad(){OP.add()},
 add(){if(root&&!byId(S.sel))return hint('👆 Chạm chọn một nút trên cây trước (nút cha khi thêm, hoặc nút cần xóa), rồi bấm lại ＋/－',1);
   const sn=byId(S.sel),full=sn&&sn.l&&sn.r,pick=sn&&sn.l&&!sn.r?'r':'l';
   const info=sn?'<div class="adinfo">Nút đang chọn <b>'+esc(sn.v)+'</b></div>':'<div class="adinfo">Cây đang rỗng: nút đầu tiên sẽ là gốc.</div>';
   const side=root?'<label>Thêm làm con của nút '+esc(sn.v)+'</label><select id="f3"><option value="l"'+(sn.l?' disabled':'')+(pick=='l'?' selected':'')+'>Con trái'+(sn.l?' (đã có)':'')+'</option><option value="r"'+(sn.r?' disabled':'')+(pick=='r'?' selected':'')+'>Con phải'+(sn.r?' (đã có)':'')+'</option></select>'+(full?'<small class="adwarn">Nút này đã đủ 2 con, không thể thêm nữa.</small>':(sn.l||sn.r)?'<small class="adnote">Tự chọn '+(sn.l?'con phải':'con trái')+' vì '+(sn.l?'con trái':'con phải')+' đã có.</small>':''):'';
   modal('Thêm / Xóa nút',info+fields()+side,()=>{
   const r=recFrom();if(!r)return false;
   if(!root)root=mk(r.v);else{const p=byId(S.sel);if(!p){toast('Chạm chọn nút cha trước');return false}if(p.l&&p.r){toast('Nút này đã có đủ 2 con');return false}const d=p.l?'r':p.r?'l':$('#f3').value;p[d]=mk(r.v);S.grow=0}clear()},'＋ Thêm');
   if(sn){const x=document.createElement('button');x.id='mxd';x.className='bad';x.textContent='－ Xóa nút '+sn.v;x.onclick=()=>{close();OP.del()};$('#mx').parentNode.insertBefore(x,$('#mx'))}},
 del(){const n=byId(S.sel);if(!n)return hint('👆 Chưa chọn nút: hãy chạm vào nút cần xóa trên cây (các nút đang nhấp nháy), rồi bấm lại Xóa',1);
   const c=!n.l&&!n.r?'<b>Trường hợp 1 — nút lá (không có con):</b> xóa trực tiếp, con trỏ của nút cha được đặt về NULL.'
     :n.l&&n.r?'<b>Trường hợp 3 — nút có 2 con:</b> chọn nút <b>kế nhiệm</b> = nút trái nhất của cây con phải (giá trị nhỏ nhất bên phải) = <b>'+esc(succ(n).v)+'</b>. Nút này lên thay vị trí của <b>'+esc(n.v)+'</b>, rồi được gỡ khỏi vị trí cũ.'
     :'<b>Trường hợp 2 — nút có 1 con:</b> con <b>'+esc((n.l||n.r).v)+'</b> nối thẳng lên cha của nút '+esc(n.v)+', thay thế vị trí nút bị xóa.';
   modal('Xóa nút '+disp(n),'<p class="tm">'+c+'</p>',()=>{const m=bstRemove(n);S.sel=null;clear();beep(220);toast(m)},'Xóa')},

 search(){modal('Tìm kiếm',F('f1','Khoá cần tìm','','number'),()=>{const a=$('#f1').value.trim();if(!a)return false;if(!root){toast(EM);return false}setSteps(sSteps(+a))},'Tìm')},
 upd(){const n=byId(S.sel);if(!n)return hint('👆 Chưa chọn nút: hãy chạm vào nút cần cập nhật trên cây (các nút đang nhấp nháy), rồi bấm lại Cập nhật',1);
   modal('Cập nhật nút',fields(n),()=>{const a=$('#f1').value.trim();if(!a||!Number.isFinite(+a))return false;n.v=+a;S.spin=n.id;clear()},'Lưu')},
 inp(){modal('Nhập / Khởi tạo cây','<p>Tạo cây mới bằng tay hoặc ngẫu nhiên (không phụ thuộc cây đang hiển thị):</p><button class="bt or" data-x="i1">⌨ Nhập cây bằng chuỗi số</button><button class="bt or" data-x="i2">🔢 Nhập / sửa số các nút</button><hr style="opacity:.2"><button class="bt" data-x="rand">🎲 Cây ngẫu nhiên</button><button class="bt" data-x="deg">📏 Cây suy biến (đường thẳng)</button><button class="bt" data-x="bal">⚖ Cây cân bằng</button><button class="bt" data-x="orig">↩ Khôi phục cây quét ban đầu</button>')},
 str(){modal('Nhập cây bằng chuỗi số','<p class="tm">Nhập bao nhiêu số cũng được, cách nhau bằng dấu cách hoặc dấu phẩy. Số <b>đầu tiên là gốc</b>; các số sau lần lượt được thêm vào: <b>nhỏ hơn → sang trái</b>, <b>lớn hơn → sang phải</b> (số trùng sẽ bỏ qua).</p><label>Dãy số</label><input id="f1" type="text" placeholder="ví dụ: 8 3 10 1 6 14 4 7 13" autocomplete="off">'+(root?'<small>⚠ Cây đang hiển thị sẽ bị thay bằng cây mới (có thể khôi phục cây quét ở Nhập / Khởi tạo cây).</small>':''),()=>{
   const r=bstFromList($('#f1').value);if(!r){toast('Chưa có số hợp lệ, ví dụ: 8 3 10 1 6');return false}
   if(r.n>300){toast('Tối đa 300 số');return false}
   root=r.t;S.sel=null;S.orig=clone(root);S.grow=1;clear();
   toast('✅ Đã dựng cây '+r.n+' nút, gốc = '+root.v+(r.dup?' · bỏ qua '+r.dup+' số trùng':''))},'Dựng cây')},

 vals(){if(!root)return toast(EM);modal('Nhập số các nút',F('f1','Giá trị theo từng mức, trái → phải ('+lvl().length+' số, cách nhau bởi dấu cách)',lvl().map(n=>n.v).join(' ')),()=>{
   const A=$('#f1').value.split(/[\s,;]+/).filter(Boolean).map(Number),L=lvl();if(A.length!=L.length||A.some(x=>!Number.isFinite(x))){toast('Cần đúng '+L.length+' số');return false}
   L.forEach((n,i)=>n.v=A[i]);S.orig=clone(root);clear()},'Áp dụng')},
 lay(){inord().forEach(n=>delete n.P);Object.assign(S,{px:0,py:0,roll:0,yaw:0,pitch:0,zoom:1,grow:0});clear();refresh();toast('Đã đặt lại vị trí nút và góc nhìn')},
 undo(){H.undo()},redo(){H.redo()},
 quiz(){newQ();drawQ()},
 game(){modal('Chơi game','<p>Chạm vào nút trên cây. Sai 3 lần là thua, qua màn sẽ khó dần.</p><button class="bt or" data-x="g1">🔢 Duyệt đúng thứ tự</button><button class="bt or" data-x="g2">🍃 Săn nút theo đặc điểm</button><button class="bt or" data-x="g3">🔍 Đi tìm khoá</button><button class="bt or" data-x="gq">📝 Trắc nghiệm</button><small>Điểm cao nhất: '+GM.best+'</small>')},
 ana(){if(!root)return toast(EM);const a=inord(),ks=a.map(n=>n.v).filter(v=>typeof v=='number').sort(cmp),n=a.length,h=hE(root),lv=a.filter(x=>!x.l&&!x.r).length,two=a.filter(x=>x.l&&x.r).length,
   full=a.every(x=>!x.l==!x.r),comp=Math.max(...wk().list.map(e=>e.k))==n-1,perf=n==2**(h+1)-1,
   kinds=perf?['hoàn hảo (cũng đầy đủ và hoàn chỉnh)']:[full&&'đầy đủ',comp&&'hoàn chỉnh'].filter(Boolean);
   modal('Thông số cây',`<table><tr><td>Số nút n</td><td>${n}</td></tr><tr><td>Chiều cao cây h</td><td>${h}</td></tr><tr><td>Số mức</td><td>${h+1} (mức 0…${h})</td></tr><tr><td>Số lá</td><td>${lv}</td></tr><tr><td>Số nút nhánh</td><td>${n-lv}</td></tr><tr><td>Nút có đủ 2 con</td><td>${two}</td></tr><tr><td>Giá trị nhỏ nhất</td><td>${esc(ks[0]??'—')}</td></tr><tr><td>Giá trị lớn nhất</td><td>${esc(ks[ks.length-1]??'—')}</td></tr></table><p>Loại: ${kinds.length?kinds.join(', '):'thường'}</p><small>Quy ước: độ sâu của gốc = 0 · chiều cao của lá = 0 · chiều cao cây = số cạnh trên đường dài nhất từ gốc xuống lá (= độ sâu lớn nhất).</small>`)}};
X.build=k=>{const N={rand:8+(Math.random()*5|0),deg:5+(Math.random()*3|0),bal:rn([7,11,15])}[k],
  V=sh(Array.from({length:99},(_,i)=>i+1)).slice(0,N);let t=null;                       // N số ngẫu nhiên khác nhau, KHÔNG lấy từ cây hiện tại
  if(k=='bal'){V.sort((a,b)=>a-b);const b=(l,h)=>{if(l>h)return null;const m=(l+h+1)>>1,n=mk(V[m]);n.l=b(l,m-1);n.r=b(m+1,h);return n};t=b(0,V.length-1)}
  else if(k=='deg'){V.sort((a,b)=>a-b);if(Math.random()<.5)V.reverse();V.forEach(v=>t=bstInsert(t,v))}   // tăng dần → lệch phải, giảm dần → lệch trái
  else{V.sort((a,b)=>a-b);                                                              // cây ngẫu nhiên ĐẸP: chọn ngẫu nhiên hình dạng gọn (cao tối đa 3 cạnh, gốc luôn đủ 2 con), rồi gán số theo thứ tự giữa → vẫn là BST hợp lệ
    const inc=new Set([0,1,2]);
    while(inc.size<N){const c=[];for(let q=3;q<15;q++)if(!inc.has(q)&&inc.has((q-1)>>1))for(let j=0;j<(q<7?3:1);j++)c.push(q);inc.add(rn(c))}   // ưu tiên lấp đầy mức 2 trước mức 3
    const bd=k=>{if(!inc.has(k))return null;const n=mk(0);n.l=bd(2*k+1);n.r=bd(2*k+2);return n};t=bd(0);
    let i=0;(function f(n){if(!n)return;f(n.l);n.v=V[i++];f(n.r)})(t)}
  root=t;S.grow=1;S.sel=null;clear();close();refresh();toast('Cây mới '+N+' nút, gốc = '+root.v)};
const RB=(k,nm)=>()=>{if(!root){const b=H.snap();X.build(k);H.push(b);return}
  sure('Tạo '+nm,'Cây hiện tại sẽ được thay bằng một cây mới hoàn toàn (số ngẫu nhiên, không dựa vào cây đang có). Muốn quay lại: Nhập / Khởi tạo cây → Khôi phục cây quét ban đầu (hoặc ↶ Hoàn tác).',()=>X.build(k),'Tạo')};
X.rand=RB('rand','cây ngẫu nhiên');X.deg=RB('deg','cây suy biến');X.bal=RB('bal','cây cân bằng');
X.orig=()=>sure('Khôi phục cây quét ban đầu','Mọi thay đổi (thêm / xóa / sửa nút, vị trí đã kéo) sẽ mất, cây trở về lúc vừa quét.',()=>{if(!S.orig)return;root=clone(S.orig);S.grow=1;S.sel=null;clear();close();refresh()},'Khôi phục');
$('#bSet').onclick=()=>modal('Cài đặt',`<label>Giao diện</label><select id="sth"><option value="dark" ${TH.m=='dark'?'selected':''}>Tối (mặc định)</option><option value="light" ${TH.m=='light'?'selected':''}>Sáng</option></select><label>Độ sáng hiệu ứng</label><input id="sb" type="range" min=".4" max="2" step=".1" value="${S.bright}"><label><input id="sn" type="checkbox" style="width:auto" ${S.snd?'checked':''}> Âm thanh tương tác</label><label><input id="sg" type="checkbox" style="width:auto" ${S.notes?'checked':''}> Hiện ghi chú hướng dẫn (bong bóng gợi ý)</label>`);
$('#bHelp').onclick=()=>modal('Trợ giúp',`<button class="bt or" data-x="tour">↺ Xem lại hướng dẫn 3 bước</button><p><span class="hand">👆</span> Chạm một nút để xem thông tin. Thanh trên có 3 chế độ: <b>🔎 Khám phá</b> (xem và sửa cây), <b>🚶 Duyệt cây</b> (xem từng bước kèm code), <b>🎮 Trò chơi</b>. Nút trên thanh trên đổi cách kéo 1 ngón: <b>⟳ Xoay cây</b> (kéo để xoay 3D) hoặc <b>✋ Kéo nút</b> (kéo từng nút; kéo chỗ trống để dời cả cây).<br>Hai ngón: chụm để thu/phóng, vặn để xoay cây.<br>📌 Cây tự cố định ngay khi bạn xác nhận quét đúng. Muốn đổi cây: bấm 🔍 Quét lại. Giữ lâu một nút bất kỳ để xem ghi chú tác dụng.</p><p><b style="color:#fab005">●</b> Nút gốc &nbsp;<b style="color:#4dabf7">●</b> Nút trong (nhánh) &nbsp;<b style="color:#40c057">●</b> Nút lá<br><b style="color:#ff6b35">●</b> Đang duyệt &nbsp;<b style="color:#ffd43b">●</b> Đã duyệt &nbsp;<b style="color:#fa5252">●</b> Không tìm thấy</p><p class="tm"><b>Thuật ngữ:</b> <b>Gốc</b> – nút trên cùng, không có cha · <b>Cha / con</b> – nút nối ngay phía trên / ngay phía dưới · <b>Lá</b> – nút không có con · <b>Độ sâu</b> của nút = số cạnh từ gốc xuống nút (gốc = 0) · <b>Chiều cao</b> của nút = số cạnh trên đường dài nhất từ nút xuống lá (lá = 0); chiều cao cây = chiều cao của gốc.</p>`);
// nút ⋯ trên màn hình hẹp: gom Cài đặt / Trợ giúp / Đo thông số
$('#bMore').onclick=()=>{const nf=q=>$(q).classList.contains('nf');modal('Thêm',(nf('#bSet')?'<button class="bt" data-x="mSet">⚙ Cài đặt</button>':'')+(nf('#bHelp')?'<button class="bt" data-x="mHelp">? Trợ giúp</button>':'')+(nf('#bAna')&&S.mode=='kham'&&root?'<button class="bt" data-x="mAna">📐 Đo thông số</button>':''))};
X.mSet=()=>{close();$('#bSet').click()};X.mHelp=()=>{close();$('#bHelp').click()};X.mAna=()=>{close();OP.ana()};
document.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>OP[b.dataset.op]());
$('#bAna').onclick=OP.ana;
const MVL={rot:['⟳','Xoay cây'],node:['✋','Kéo nút']},MVT={rot:'⟳ Xoay cây: kéo 1 ngón để xoay 3D · 2 ngón để thu/phóng',node:'✋ Kéo nút: kéo từng nút · kéo chỗ trống để dời cả cây'};
$('#bMv').onclick=()=>{S.dm=S.dm=='rot'?'node':'rot';S.mv=S.dm=='rot'?'orbit':'pan';toast(MVT[S.dm]);ui()};
const MDESC={kham:'Xem thông số & thông tin nút · thêm / xóa / sửa nút · nhập cây',duyet:'Xem từng bước duyệt cây và tìm kiếm, kèm mã giả / Python',choi:'Trắc nghiệm sinh từ cây · đoán nút tiếp theo · sửa cây lỗi · duyệt · săn nút · tìm khoá'};
const setMode=m=>{if(m==S.mode&&!GM.on)return;
  if(GM.on){clearInterval(GM.tm);GM.on=0;document.body.classList.remove('game')}   // đang chơi mà đổi chế độ → thoát game
  S.mode=m;if(m=='choi'){S.dm='rot';S.mv='orbit'}                                  // chế độ chơi chỉ chạm nút, không kéo nút
  $('#tools').classList.remove('cl');                                               // mặc định mở thanh công cụ của chế độ vừa chọn
  clear();refresh();if(m=='choi')OP.game()};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('#vw').onchange=e=>{S.view=e.target.value;sync.w=0;refresh()};
$('#tk').onchange=e=>{S.kind=e.target.value;clear();refresh()};
$('#spd').onchange=e=>{S.speed=+e.target.value;if(S.run)startT()};
const trav=()=>{if(!S.steps.length||S.steps[0].t!='trav'||S.i>=S.steps.length-1){const s=tSteps(S.kind);if(!s.length){toast(EM);return false}S.steps=s;S.i=-1;S.ck=S.kind}return true};
$('#bPlay').onclick=()=>{if(S.run){stopT();return ui()}if(trav())startT()};
$('#bNx').onclick=()=>{stopT();if(!S.steps.length||S.steps[0].t!='trav'){if(!trav())return}go(S.i+1)};
$('#bPv').onclick=()=>{stopT();go(S.i-1)};
$('#bLock').onclick=()=>lockFn?lockFn():toast('Chưa bật AR');
const KS=[['pre','Duyệt trước (preorder)'],['in','Duyệt giữa (inorder)'],['post','Duyệt sau (postorder)'],['rin','Duyệt ngược (reverse order)']];
const TS=[{t:'👆 Bước 1/3: chạm vào <b>một nút</b> trên cây để xem thông tin của nó.',ok:()=>S.sel!=null},
 {t:'🚶 Bước 2/3: chuyển sang <b>Duyệt cây</b>, rồi bấm ▶ để xem máy duyệt cây từng bước kèm code.',sel:'[data-mode="duyet"]',ok:()=>S.mode=='duyet'||S.steps.length>0},
 {t:'🎮 Bước 3/3: thử chế độ <b>Trò chơi</b> — chạm các nút đúng thứ tự duyệt!',sel:'[data-mode="choi"]',ok:()=>GM.on||S.mode=='choi'}];
function tour(){const el=$('#coach');document.querySelectorAll('.hl').forEach(x=>x.classList.remove('hl'));if(!S.notes){el.style.display='none';return}
  const blk=document.body.classList.contains('scan')||document.body.classList.contains('cfm')||!root||GM.on||$('#mo').style.display=='flex';
  $('#cs').textContent='Bỏ qua';if(TR.off||blk){el.style.display='none';return}
  while(TR.i<TS.length&&TS[TR.i].ok())TR.i++;
  if(TR.i>=TS.length){TR.off=1;try{localStorage.setItem('arbt_tour','1')}catch(e){}el.style.display='none';toast('🎉 Xong hướng dẫn! Bấm ? để xem lại');return}
  const c=TS[TR.i];$('#ct').innerHTML=c.t;el.style.display='flex';if(c.sel){const t=$(c.sel);t&&t.classList.add('hl')}}
$('#cs').onclick=()=>{TR.off=1;try{localStorage.setItem('arbt_tour','1')}catch(e){}tour()};
function fitTop(){const t=$('#top'),A=[$('#bAna'),$('#bSet'),$('#bHelp')],mo=$('#bMore');
  [...A,mo].forEach(b=>b.classList.remove('ic','nf'));
  if(!matchMedia('(max-width:760px)').matches)return;
  const wr=()=>{const k=[...t.children].filter(e=>e.offsetParent);if(k.length<2)return false;const c=e=>e.offsetTop+e.offsetHeight/2,y=c(k[0]);return k.some(e=>Math.abs(c(e)-y)>12)};
  A.forEach(b=>b.classList.add('nf'));                       // bắt đầu: tất cả nằm trong ⋯, rồi đưa ra ngoài nếu còn chỗ
  let full=true;                                              // hết chỗ ở nút nào thì các nút sau cũng nằm trong ⋯ (đúng thứ tự ưu tiên)
  A.forEach((b,i)=>{if(b.hidden)return;if(!full)return;b.classList.remove('nf');if(i>0)b.classList.add('ic');   // 📐 thử cả chữ; ⚙ và ? chỉ biểu tượng
    if(wr()){b.classList.add('ic');if(wr()){b.classList.add('nf');full=false}}});
  if(A.every(b=>!b.classList.contains('nf'))){mo.classList.add('nf');if(wr())mo.classList.remove('nf')}}   // ra hết thì bỏ nút ⋯
addEventListener('resize',()=>{try{ui()}catch(e){}});
function ui(){H.ui();qWatch();
  const sc=document.body.classList.contains('scan'),st=S.steps[S.i];
  $('#st').textContent=sc?'ĐANG QUÉT':isLocked?'ĐÃ CỐ ĐỊNH':'ĐÃ HOẠT ĐỘNG';$('#st').style.color=sc||isLocked?'#e67700':'#2f9e44';
  const b=$('#bLock');b.innerHTML=isLocked?'🔓<span class="tx"> BỎ CỐ ĐỊNH</span>':'📌<span class="tx"> CỐ ĐỊNH CÂY</span>';b.className=isLocked?'gr':'or';
  $('#bMv').innerHTML=MVL[S.dm][0]+'<span class="tx"> '+MVL[S.dm][1]+'</span>';$('#bMv').className=S.dm=='node'?'or':'gr';
  $('#vw').value=S.view;document.querySelectorAll('[data-mode]').forEach(b=>b.className=b.dataset.mode==S.mode?'or':'');
  const MO=MODES[S.mode].ops.split(' '),md=S.mode;document.querySelectorAll('[data-op]').forEach(x=>{x.hidden=!MO.includes(x.dataset.op)});$('#bAna').hidden=!MO.includes('ana');
  $('#trav').hidden=md=='choi'||!(md=='duyet'||S.steps.length>0);      // thanh phát mô phỏng: Duyệt cây (và khi đang chạy tìm kiếm / thêm nút)
  $('#info').hidden=md!='kham';                                         // thông tin nút: chỉ Khám phá
  $('#vw').hidden=md=='choi';$('#bMv').hidden=md=='choi';               // đổi cách hiển thị / cách kéo: Khám phá + Duyệt cây
  $('#mdesc').textContent=MDESC[md];
  const tg=$('#tg');tg.innerHTML=$('#tools').classList.contains('cl')?'🧰 ▸':'▾ Thu gọn';tg.title=$('#tools').classList.contains('cl')?'Mở rộng thanh công cụ':'Thu gọn thanh công cụ';
  const ks=KS;if(!ks.some(k=>k[0]==S.kind))S.kind='in';
  const th=ks.map(k=>`<option value="${k[0]}" ${k[0]==S.kind?'selected':''}>${k[1]}</option>`).join('');if(ui.th!==th){ui.th=th;$('#tk').innerHTML=th}
  $('#tt').textContent=st&&st.t=='path'?'ĐƯỜNG ĐI':'MÔ PHỎNG';$('#bPlay').textContent=S.run?'⏸':'▶';
  const ids=st?st.out:[];$('#out').innerHTML=ids.map((id,j)=>`<span class="${st.cur==id&&j==ids.length-1?'cu':''}">${esc(trunc(disp(byId(id))))}</span>`).join('')||'<small style="opacity:.6;font-weight:400">Kết quả sẽ hiện ở đây</small>';
  $('#nt').textContent=st?st.note:'';
  const n=byId(S.sel);let h='<h4>THÔNG TIN NÚT</h4>';
  if(!n){h+=root?`<div class="ngrid"><div><small>Gốc</small><b>${esc(root.v)}</b></div><div><small>Chiều cao cây</small><b>${hE(root)}</b></div><div><small>Số nút</small><b>${lvl().length}</b></div></div><div><i>Chạm vào một nút 3D để xem chi tiết</i></div>`:'<div><i>Cây rỗng — dùng ⌨ Nhập / Khởi tạo cây</i></div>'}
  else{const p=par(n),k=(function g(t,k){return t===n?k:t?(g(t.l,2*k+1)??g(t.r,2*k+2)):null})(root,0),
      role=n===root?['Nút gốc','root']:!n.l&&!n.r?['Nút lá','leaf']:['Nút trong','br'],v=x=>x?esc(disp(x)):'—';
    h+=`<div class="nbadge ${role[1]}"><b>${esc(n.v)}</b><span>${role[0]}</span></div>
<div class="ngrid"><div><small>Cha</small><b>${v(p)}</b></div><div><small>Con trái</small><b>${v(n.l)}</b></div><div><small>Con phải</small><b>${v(n.r)}</b></div>
<div class="k"><small>Độ sâu</small><b>${depth(n)}</b></div><div class="k"><small>Chiều cao</small><b>${hE(n)}</b></div><div><small>Bậc</small><b>${(n.l?1:0)+(n.r?1:0)}</b></div></div>
<div class="npath">Đường từ gốc: ${pathTo(n).map(id=>esc(disp(byId(id)))).join(' → ')}</div>
<small class="nhelp">Độ sâu = số cạnh từ gốc xuống nút (gốc = 0).<br>Chiều cao = số cạnh từ nút xuống lá xa nhất (lá = 0).<br>Bậc = số con.<br>Mảng: k=${k} → con ở vị trí ${2*k+1}, ${2*k+2}.</small>`}
  $('#info').innerHTML=h;drawCode();tour();
  fitTop();
  const tbH=$('#top').offsetHeight,mbH=$('#modes').offsetHeight;document.documentElement.style.setProperty('--tm',(tbH+14)+'px');document.documentElement.style.setProperty('--ti',(tbH+16+(mbH?mbH+6:0))+'px');document.documentElement.style.setProperty('--tb',($('#trav').offsetHeight+16)+'px');
}
document.body.classList.add('scan');
