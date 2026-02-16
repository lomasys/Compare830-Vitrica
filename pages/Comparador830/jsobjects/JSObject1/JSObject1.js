export default {
  setHtmlResult() {
    const payload = apiComparar830.data?.[0];   // 👈 porque data es array
    const html =
      apiComparar830.isLoading
        ? "<div style='font-family:Inter;padding:12px'>AI Analizyng...</div>"
        : (payload?.result_html || "<div style='font-family:Inter;padding:12px'>Sin resultado</div>");

    storeValue("comparar830_html", html);
    return html;
  }
}

