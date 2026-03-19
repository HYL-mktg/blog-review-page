(function (global) {
  const STORAGE_KEY = "hyl_auth_v1";
  const LOGIN_ENDPOINT = "https://hyltest-login.mktg-95f.workers.dev/";
  const SHARE_SETTINGS_KEY = "hyl_share_settings_v1";
  const ADMIN_IDS = new Set(["hy3d"]);

  function normalizeCompany(value) {
    if (!value) return "";
    return String(value).trim();
  }

  function normalizeId(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase();
  }

  function parseJson(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function getAuth() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseJson(raw, null);
    if (!parsed || !parsed.token) return null;
    return parsed;
  }

  function isAdmin(auth) {
    return ADMIN_IDS.has(normalizeId(auth?.id));
  }

  function saveAuth(payload) {
    const normalized = {
      token: payload.token || "",
      id: payload.id || "",
      company: normalizeCompany(payload.company),
      isAdmin: Boolean(payload.isAdmin),
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    sessionStorage.setItem("token", normalized.token);
    sessionStorage.setItem("id", normalized.id);
    sessionStorage.setItem("company", normalized.company);
    sessionStorage.setItem("isAdmin", normalized.isAdmin ? "1" : "0");
    return normalized;
  }

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("company");
    sessionStorage.removeItem("isAdmin");
  }

  function extractCompany(responseJson) {
    return normalizeCompany(
      responseJson.company ||
      responseJson.company_name ||
      responseJson.companyName ||
      responseJson.allowed_company ||
      responseJson.allowedCompany ||
      responseJson.client ||
      responseJson.organization
    );
  }

  async function loginWithPrompt() {
    const id = prompt("아이디를 입력해 주세요.");
    if (!id) return null;

    const password = prompt("비밀번호를 입력해 주세요.");
    if (!password) return null;

    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password })
    });

    if (response.status === 401) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      return null;
    }

    if (!response.ok) {
      alert(`로그인 서버 오류: ${response.status}`);
      return null;
    }

    const result = await response.json();
    let company = extractCompany(result);
    const adminById = ADMIN_IDS.has(normalizeId(id));

    if (!company) {
      const companyInput = prompt(adminById ? "관리자 계정입니다. 대표 회사명을 입력해 주세요." : "소속 회사명을 입력해 주세요.");
      company = normalizeCompany(companyInput);
    }

    if (!company) {
      alert("회사 정보가 없어 로그인할 수 없습니다.");
      return null;
    }

    return saveAuth({
      token: result.token || "",
      id,
      company,
      isAdmin: adminById
    });
  }

  function isPublicMode(params) {
    return params.get("public") === "1";
  }

  function requireAuth(options) {
    const config = options || {};
    const auth = getAuth();

    if (auth && auth.token) return auth;

    if (config.redirectTo) {
      window.location.href = config.redirectTo;
    }
    return null;
  }

  function enforceCompanyAccess(requestedCompany, auth, fallbackPath) {
    const normalizedRequested = normalizeCompany(requestedCompany);
    const normalizedOwned = normalizeCompany(auth?.company);

    if (!normalizedOwned) return null;
    if (!normalizedRequested) return normalizedOwned;

    if (normalizedRequested !== normalizedOwned && !isAdmin(auth)) {
      alert("본인 회사 콘텐츠만 확인할 수 있습니다.");
      if (fallbackPath) window.location.href = fallbackPath;
      return null;
    }

    return normalizedRequested || normalizedOwned;
  }

  function resolveCompanyWithPublicOption(options) {
    const config = options || {};
    const params = config.params || new URLSearchParams(window.location.search);
    const requestedCompany = normalizeCompany(config.requestedCompany || params.get("company"));
    const auth = getAuth();
    if (auth && auth.token) {
      const company = enforceCompanyAccess(requestedCompany, auth, config.fallbackPath || "index-company.html");
      return { company, auth, isPublic: false };
    }

    if (requestedCompany) {
      return { company: requestedCompany, auth: null, isPublic: true };
    }

    if (config.redirectTo) {
      window.location.href = config.redirectTo;
    }

    return { company: null, auth: null, isPublic: false };
  }

  function getShareSettings() {
    const raw = localStorage.getItem(SHARE_SETTINGS_KEY);
    const parsed = parseJson(raw || "{}", {});
    return parsed && typeof parsed === "object" ? parsed : {};
  }

  function saveShareSettings(settings) {
    localStorage.setItem(SHARE_SETTINGS_KEY, JSON.stringify(settings));
  }

  function setShareEnabled(company, contentType, enabled) {
    const normalizedCompany = normalizeCompany(company);
    if (!normalizedCompany) return;
    const settings = getShareSettings();
    settings[normalizedCompany] = settings[normalizedCompany] || {};
    settings[normalizedCompany][contentType] = Boolean(enabled);
    saveShareSettings(settings);
  }

  function isShareEnabled(company, contentType) {
    const normalizedCompany = normalizeCompany(company);
    const settings = getShareSettings();
    return Boolean(settings?.[normalizedCompany]?.[contentType]);
  }

  function buildCompanyUrl(pathname, company) {
    const companyValue = encodeURIComponent(normalizeCompany(company));
    return `${pathname}?company=${companyValue}`;
  }

  function buildDetailUrl(pathname, company, postId) {
    const companyValue = encodeURIComponent(normalizeCompany(company));
    const postValue = encodeURIComponent(String(postId || ""));
    return `${pathname}?company=${companyValue}&post_id=${postValue}`;
  }

  global.HYLAuth = {
    getAuth,
    isAdmin,
    saveAuth,
    clearAuth,
    loginWithPrompt,
    requireAuth,
    enforceCompanyAccess,
    resolveCompanyWithPublicOption,
    normalizeCompany,
    isPublicMode,
    getShareSettings,
    setShareEnabled,
    isShareEnabled,
    buildCompanyUrl,
    buildDetailUrl
  };
})(window);
