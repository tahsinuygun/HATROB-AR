// app.js — GitHub repo içindeki .glb/.gltf dosyalarını otomatik listeler (GitHub API Trees)
// Repo’ya yeni model ekleyince sayfayı yenileyince otomatik görünür. "Yenile" butonu cache'i temizler.

window.HATROB = (() => {
  // ====== DOLDUR (repo değişirse) ======
  const REPO_OWNER = "tahsinuygun";
  const REPO_NAME  = "HATROB-AR";
  const BRANCH     = "main";

  // ====== AYAR ======
  const MODEL_EXTS = [".glb", ".gltf"];
  const EXCLUDE_PREFIXES = ["assets/", "usdz/", ".git", ".github/"];
  const EXCLUDE_EXTS = [".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".md", ".txt", ".pdf", ".zip", ".rar"];

  const CACHE_KEY = "hatrob_github_models_cache_v1";
  const CACHE_TTL_MS = 2 * 60 * 1000; // 2 dk

  function niceNameFromPath(path){
    const file = path.split("/").pop();
    const base = file.replace(/\.[^.]+$/, "");
    return base.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function encodePath(path){
    // boşluk/Türkçe karakter güvenli
    return path.split("/").map(encodeURIComponent).join("/");
  }

  async function fetchBranchTreeSha(){
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" }});
    if(!res.ok) throw new Error(`Branch fetch failed: ${res.status}`);
    const data = await res.json();
    return data?.commit?.commit?.tree?.sha;
  }

  async function fetchTreeRecursive(treeSha){
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${treeSha}?recursive=1`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" }});
    if(!res.ok) throw new Error(`Tree fetch failed: ${res.status}`);
    return await res.json();
  }

  function isExcluded(path){
    const lower = path.toLowerCase();
    if (EXCLUDE_PREFIXES.some(p => lower.startsWith(p))) return true;
    if (EXCLUDE_EXTS.some(ext => lower.endsWith(ext))) return true;
    if (path.split("/").some(seg => seg.startsWith("."))) return true;
    return false;
  }

  function isModelFile(path){
    const lower = path.toLowerCase();
    return MODEL_EXTS.some(ext => lower.endsWith(ext));
  }

  function isUSDZ(path){
    return path.toLowerCase().endsWith(".usdz");
  }

  function loadCache(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      const obj = JSON.parse(raw);
      if(!obj.ts || !obj.models) return null;
      if(Date.now() - obj.ts > CACHE_TTL_MS) return null;
      return obj;
    }catch{ return null; }
  }

  function saveCache(models, usdz){
    try{
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), models, usdz }));
    }catch{}
  }

  function clearCache(){
    try{ localStorage.removeItem(CACHE_KEY); }catch{}
  }

  async function getRepoFiles({forceRefresh=false}={}){
    if(!forceRefresh){
      const cached = loadCache();
      if(cached) return cached;
    }

    const treeSha = await fetchBranchTreeSha();
    if(!treeSha) throw new Error("Tree SHA not found");

    const tree = await fetchTreeRecursive(treeSha);
    const blobs = (tree.tree || []).filter(x => x.type === "blob" && x.path);

    const models = [];
    const usdz = [];

    for(const b of blobs){
      if(isExcluded(b.path)) continue;
      if(isModelFile(b.path)) models.push(b.path);
      else if(isUSDZ(b.path)) usdz.push(b.path);
    }

    models.sort((a,b)=> niceNameFromPath(a).localeCompare(niceNameFromPath(b), "tr"));
    usdz.sort();

    saveCache(models, usdz);
    return { models, usdz };
  }

  function findMatchingUSDZ(modelPath, usdzList){
    const file = modelPath.split("/").pop();
    const base = file.replace(/\.[^.]+$/, "");
    const preferred = `usdz/${base}.usdz`;

    const lower = new Set((usdzList||[]).map(x => x.toLowerCase()));
    if(lower.has(preferred.toLowerCase())) return preferred;

    const dir = modelPath.includes("/") ? modelPath.slice(0, modelPath.lastIndexOf("/")+1) : "";
    const alt = `${dir}${base}.usdz`;
    if(lower.has(alt.toLowerCase())) return alt;

    return (usdzList||[]).find(x => x.split("/").pop().toLowerCase() === `${base}.usdz`.toLowerCase()) || null;
  }

  return { getRepoFiles, clearCache, niceNameFromPath, encodePath, findMatchingUSDZ };
})();
