window.HATROB = (() => {
  const REPO_OWNER="tahsinuygun", REPO_NAME="HATROB-AR", BRANCH="main";
  const MODELS_PREFIX="models/", USDZ_PREFIX="usdz/";
  const CACHE_KEY="hatrob_models_v2", CACHE_TTL_MS=2*60*1000;

  const niceNameFromPath=(path)=>{
    const file=(path||"").split("/").pop()||"";
    return file.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
  };
  const encodePath=(path)=>(path||"").split("/").map(encodeURIComponent).join("/");
  const formatBytes=(n)=>{
    if(!Number.isFinite(n)) return "";
    if(n<1024*1024) return (n/1024).toFixed(0)+" KB";
    return (n/1024/1024).toFixed(1)+" MB";
  };
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);

  function loadCache(){
    try{
      const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
      if(!x?.ts || !Array.isArray(x.models) || Date.now()-x.ts>CACHE_TTL_MS) return null;
      return x;
    }catch{return null;}
  }
  function saveCache(models,usdz){try{localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),models,usdz}))}catch{}}
  function clearCache(){try{localStorage.removeItem(CACHE_KEY)}catch{}}

  async function getTree(){
    const b=await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}`,{headers:{Accept:"application/vnd.github+json"}});
    if(!b.ok) throw new Error("GitHub branch bilgisi alınamadı");
    const bd=await b.json();
    const sha=bd?.commit?.commit?.tree?.sha;
    const t=await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${sha}?recursive=1`,{headers:{Accept:"application/vnd.github+json"}});
    if(!t.ok) throw new Error("GitHub model listesi alınamadı");
    return t.json();
  }

  async function getRepoFiles({forceRefresh=false}={}){
    if(!forceRefresh){
      const c=loadCache();
      if(c) return c;
    }
    const tree=await getTree();
    const blobs=(tree.tree||[]).filter(x=>x.type==="blob"&&x.path);
    const candidates=blobs
      .filter(x=>/\.(glb|gltf)$/i.test(x.path) && !x.path.toLowerCase().startsWith("assets/") && !x.path.toLowerCase().startsWith(USDZ_PREFIX))
      .map(x=>({path:x.path,size:x.size||0,sha:x.sha}))
      .sort((a,b)=>{
        const am=a.path.toLowerCase().startsWith(MODELS_PREFIX)?0:1;
        const bm=b.path.toLowerCase().startsWith(MODELS_PREFIX)?0:1;
        return am-bm || niceNameFromPath(a.path).localeCompare(niceNameFromPath(b.path),"tr");
      });
    const seen=new Set();
    const models=[];
    for(const m of candidates){
      const key=m.path.split("/").pop().toLowerCase();
      if(seen.has(key)) continue;
      seen.add(key);
      models.push(m);
    }
    const usdz=blobs.filter(x=>x.path.toLowerCase().startsWith(USDZ_PREFIX)&&/\.usdz$/i.test(x.path)).map(x=>x.path);
    models.sort((a,b)=>niceNameFromPath(a.path).localeCompare(niceNameFromPath(b.path),"tr"));
    usdz.sort();
    saveCache(models,usdz);
    return {models,usdz};
  }

  function resolveRequestedModel(raw,models){
    if(!raw) return null;
    const exact=models.find(m=>m.path===raw);
    if(exact) return exact;
    const base=raw.split("/").pop().toLowerCase();
    return models.find(m=>m.path.split("/").pop().toLowerCase()===base)||null;
  }

  function findMatchingUSDZ(modelPath,usdzList){
    const file=modelPath.split("/").pop();
    const base=file.replace(/\.[^.]+$/,"").toLowerCase();
    return (usdzList||[]).find(x=>x.split("/").pop().replace(/\.usdz$/i,"").toLowerCase()===base)||null;
  }

  return {getRepoFiles,clearCache,niceNameFromPath,encodePath,formatBytes,isIOS,resolveRequestedModel,findMatchingUSDZ};
})();